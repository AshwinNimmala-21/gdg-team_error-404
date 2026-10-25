import type { Extraction, SignalId } from "@/lib/ai/schema";
import { DC_OAG_ALERT, FTC_SCAMS } from "@/lib/data/help";
import type { Evidence, PriceCheck, ScamCheck, ScamFlag, ScamFlagId, SourceRef } from "@/lib/types";
import { money } from "./price";
import { findQuote, foldAccents, type Corpus } from "./quotes";

// People type Spanish without accents ("fuera del pais"), so Spanish patterns are matched with accents folded on both sides.
const folded = (re: RegExp) => new RegExp(foldAccents(re.source), re.flags);

const FTC: SourceRef = { name: "FTC: Rental listing scams", url: FTC_SCAMS };
const FTC_SPOTLIGHT: SourceRef = {
  name: "FTC Data Spotlight, Dec 2025",
  url: "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses",
};
const DC_OAG: SourceRef = { name: "DC Attorney General consumer alert", url: DC_OAG_ALERT };

export const CHECK_COUNT = 9;
const LIKELY_AT = 4;

const SIGNAL_RULES: Record<Exclude<SignalId, "riskyPayment">, { label: string; weight: 1 | 2; source?: SourceRef }> = {
  payBeforeViewing: { label: "Asks for money before you've seen the place or signed a lease", weight: 2, source: FTC_SPOTLIGHT },
  noInPersonViewing: { label: "Won't show the unit in person", weight: 2, source: FTC },
  landlordAway: { label: "Says the owner is out of town or overseas", weight: 2, source: FTC },
  sensitiveInfoEarly: { label: "Asks for your SSN or credit report before you've agreed to rent", weight: 2, source: FTC },
  pressure: { label: "Pushes you to decide or pay quickly", weight: 1, source: FTC },
  offPlatformContact: { label: "Moves the conversation off the listing site", weight: 1 },
};

// The FTC sign is an owner who is away and can't meet you. Moving for work, on its own, is ordinary.
const RELOCATING = /\b(relocat\w*|moving|transferr\w*|new job)\b/i;
// Spanish equivalents (Spanish-language listings). Unicode-aware, since \b doesn't handle accented letters.
const RELOCATING_ES = /(se muda\p{L}*|me mudo|mudanza|traslad\p{L}*|reubicad\p{L}*|nuevo (trabajo|empleo))/iu;
const AWAY_ES =
  /(en el extranjero|fuera del país|fuera de la ciudad|fuera del estado|desplegad\p{L}*|ejército|militar|misión|de viaje|lejos|no (puedo|podemos|podré|puede) (reunirme|mostrar\p{L}*|enseñar\p{L}*|estar)|(envío|mando|mandaré|enviaré|enviamos|enviarle|mandarle) (le |las )?llaves|llaves por correo|(se muda|me mudo) (a|al|para) )/iu;
const AWAY =
  /\b(overseas|abroad|out of (town|the country|state)|deployed|deployment|military|mission|travel\w*|far away|(another|a different) (city|state|country)|(relocat\w*|mov(e|ed|es|ing)|transferr\w*) to|(can'?t|cannot|unable to|not able to|won'?t be able to) (meet|show|be (there|here|around))|not (in|around)|(mail|send|ship|drop)\w* (you )?(the )?keys?)\b/i;

const RELOCATING_ES_F = folded(RELOCATING_ES);
const AWAY_ES_F = folded(AWAY_ES);

/** The sentence around a quote in the user's text (or the photo transcript), accents folded, or null if it can't be found. */
function sentenceAround(quote: string, sources: string[]): string | null {
  const q = foldAccents(quote.replace(/\s+/g, " ").trim().toLowerCase());
  for (const src of sources) {
    const s = foldAccents(src.replace(/\s+/g, " "));
    const i = s.toLowerCase().indexOf(q);
    if (i < 0) continue;
    const start = Math.max(...[".", "!", "?"].map((c) => s.lastIndexOf(c, i - 1))) + 1;
    const ends = [".", "!", "?"].map((c) => s.indexOf(c, i + q.length - 1)).filter((n) => n >= 0);
    return s.slice(start, ends.length ? Math.min(...ends) + 1 : s.length);
  }
  return null;
}

/** True when the whole sentence only says the owner is moving, with nothing about being away or unavailable. */
export function isOnlyRelocating(quote: string | null, sources: string[]): boolean {
  if (!quote || !(RELOCATING.test(quote) || RELOCATING_ES_F.test(foldAccents(quote)))) return false;
  const sentence = sentenceAround(quote, sources);
  return sentence !== null && !AWAY.test(sentence) && !AWAY_ES_F.test(sentence); // fail closed: an unlocatable quote still counts
}

const FTC_METHODS = new Set(["wire", "gift_card", "crypto"]);
const APP_METHODS = new Set(["payment_app", "cashiers_check", "cash", "money_order"]);

// Defense in depth: catch common prompt-injection phrasing even if the model doesn't report it.
const INJECTION_PATTERNS = [
  /ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|prompts?|rules)/i,
  /disregard (all |any )?(the )?(previous|prior|above|system) (instructions|prompts?)/i,
  /(ai|assistant|model|chatbot|scanner|reviewer)s?[,:]? .{0,60}(mark|report|classify|rate|label) (this|the) (listing|post|ad)/i,
  /you are now (a|an|in) /i,
  /system prompt/i,
  // Spanish phrasing
  /ignor\p{L}* (todas |cualquier )?(las )?(instrucciones|indicaciones|reglas) (anteriores|previas)/iu,
  /(ia|asistente|modelo|verificador|revisor)\p{L}*[,:]?.{0,80}(rep[oó]rtel[oa]|m[aá]rquel[oa]|clasif[ií]quel[oa]|calif[ií]quel[oa]) como/iu,
];

const INJECTION_PATTERNS_F = INJECTION_PATTERNS.map(folded);

export function findInjection(text: string): string | null {
  // Match on accent-folded text, then return the original line (folding never adds or removes line breaks).
  const plain = foldAccents(text);
  for (const p of INJECTION_PATTERNS_F) {
    const m = p.exec(plain);
    if (m) {
      const lineNo = plain.slice(0, m.index).split("\n").length - 1;
      return text.split("\n")[lineNo].trim().slice(0, 240);
    }
  }
  return null;
}

function quoted(quote: string | null, corpus: Corpus, label: string, source?: SourceRef): Evidence {
  const where = findQuote(quote, corpus);
  return {
    label,
    quote: quote ?? undefined,
    quoteFrom: where ?? undefined,
    counted: where !== null,
    source,
  };
}

export function computeScam(x: Extraction, corpus: Corpus, price: PriceCheck, rawText: string): ScamCheck {
  const flags: ScamFlag[] = [];
  const dropped: Evidence[] = [];
  const add = (id: ScamFlagId, label: string, weight: 1 | 2, ev: Evidence, heuristic = false) => {
    if (ev.counted) flags.push({ id, label, weight, heuristic, evidence: [ev] });
    else dropped.push({ ...ev, label: `${label} (not counted: we couldn't find this quote in what you shared)` });
  };

  // Cheap rent counts only alongside another red flag (see FAR_BELOW_ALONE in price.ts). Added after the others.
  const priceFlag = (): ScamFlag | null =>
    price.farBelow && price.rent !== null && price.range
      ? {
          id: "priceFarBelow",
          label: "Rent is far below similar rentals",
          weight: 2,
          heuristic: true,
          evidence: [
            {
              label: "FTC: “If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam.”",
              value: `${money(price.rent)} is ${Math.round((1 - (price.ratio ?? 1)) * 100)}% under the low end of the usual local range (${money(price.range.low)}). Clearlease counts 25% or more, and only alongside another warning sign.`,
              counted: true,
              source: FTC,
            },
          ],
        }
      : null;

  const pay = x.signals.riskyPayment;
  if (pay.present) {
    const ftc = pay.methods.some((m) => FTC_METHODS.has(m));
    const app = pay.methods.some((m) => APP_METHODS.has(m));
    if (ftc) add("riskyPayment", "Wants payment by wire transfer, gift card or crypto", 2, quoted(pay.quote, corpus, "Payment request", FTC));
    else if (app || pay.methods.length === 0)
      add("riskyPayment", "Wants payment you can't get back (payment app, cashier's check or cash)", 1, quoted(pay.quote, corpus, "Payment request", DC_OAG));
  }

  for (const [id, rule] of Object.entries(SIGNAL_RULES) as [keyof typeof SIGNAL_RULES, (typeof SIGNAL_RULES)[keyof typeof SIGNAL_RULES]][]) {
    const s = x.signals[id];
    if (!s.present) continue;
    if (id === "landlordAway" && isOnlyRelocating(s.quote, [rawText, x.imageTranscript ?? ""])) {
      dropped.push({
        ...quoted(s.quote, corpus, rule.label, rule.source),
        counted: false,
        label: `${rule.label} (not counted: moving for work isn't the warning sign; the FTC sign is an owner who can't meet you or show the place)`,
      });
      continue;
    }
    add(id, rule.label, rule.weight, quoted(s.quote, corpus, rule.label, rule.source), !rule.source);
  }

  const modelSaw = x.aiInstructions.present ? quoted(x.aiInstructions.quote, corpus, "Instructions aimed at AI tools") : null;
  const regexSaw = findInjection(rawText);
  if (modelSaw?.counted || regexSaw) {
    const ev = modelSaw?.counted ? modelSaw : { label: "Instructions aimed at AI tools", quote: regexSaw!, quoteFrom: "text" as const, counted: true };
    flags.push({ id: "aiInstructions", label: "Hides instructions aimed at AI checkers like this one", weight: 2, heuristic: true, evidence: [ev] });
  } else if (modelSaw) {
    dropped.push({ ...modelSaw, label: "Instructions aimed at AI tools (not counted: quote not found)" });
  }

  const cheap = flags.length > 0 ? priceFlag() : null;
  if (cheap) flags.unshift(cheap);

  const score = flags.reduce((s, f) => s + f.weight, 0);
  // Scam signs live in listings and landlord messages. With neither (e.g. a lease alone), a clean result
  // would read as approval, so say the check didn't run. Anything that did fire is still shown.
  if (score === 0 && !x.inputKinds.some((k) => k === "listing" || k === "message"))
    return {
      status: "not_run",
      headline: "We didn't run the scam check",
      detail:
        "Scam warning signs show up in rental listings and landlord messages, and we didn't find one here. Paste the listing or the landlord's messages to check them.",
      flagged: 0,
      checked: CHECK_COUNT,
      flags,
      dropped,
    };
  const status: ScamCheck["status"] = score === 0 ? "none_found" : score >= LIKELY_AT ? "likely" : "some";
  const n = flags.length;
  const headline = status === "none_found" ? `We checked ${CHECK_COUNT} warning signs and found none` : `${n} of ${CHECK_COUNT} checks flagged`;
  const detail =
    status === "none_found"
      ? "That isn't a guarantee. See the place in person (or on a live video tour) and sign a lease before you pay anything."
      : status === "likely"
        ? "These match the warning signs the FTC lists for rental scams. Don't send money. If you already paid, use the FTC link below."
        : "Get answers to the questions below before you send any money.";

  return { status, headline, detail, flagged: n, checked: CHECK_COUNT, flags, dropped };
}
