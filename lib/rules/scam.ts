import type { Extraction, SignalId } from "@/lib/ai/schema";
import { DC_OAG_ALERT, FTC_SCAMS } from "@/lib/data/help";
import type { Evidence, PriceCheck, ScamCheck, ScamFlag, ScamFlagId, SourceRef } from "@/lib/types";
import { money } from "./price";
import { findQuote, type Corpus } from "./quotes";

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

const FTC_METHODS = new Set(["wire", "gift_card", "crypto"]);
const APP_METHODS = new Set(["payment_app", "cashiers_check", "cash", "money_order"]);

// Defense in depth: catch common prompt-injection phrasing even if the model doesn't report it.
const INJECTION_PATTERNS = [
  /ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|prompts?|rules)/i,
  /disregard (all |any )?(the )?(previous|prior|above|system) (instructions|prompts?)/i,
  /(ai|assistant|model|chatbot|scanner|reviewer)s?[,:]? .{0,60}(mark|report|classify|rate|label) (this|the) (listing|post|ad)/i,
  /you are now (a|an|in) /i,
  /system prompt/i,
];

export function findInjection(text: string): string | null {
  for (const p of INJECTION_PATTERNS) {
    const m = p.exec(text);
    if (m) {
      const start = text.lastIndexOf("\n", m.index) + 1;
      const endNl = text.indexOf("\n", m.index);
      const line = text.slice(start, endNl === -1 ? undefined : endNl).trim();
      return line.slice(0, 240);
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

  if (price.farBelow && price.rent !== null && price.benchmark) {
    flags.push({
      id: "priceFarBelow",
      label: "Rent is far below similar rentals",
      weight: 2,
      heuristic: true,
      evidence: [
        {
          label: "FTC: “If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam.”",
          value: `${money(price.rent)} is ${Math.round((1 - (price.ratio ?? 1)) * 100)}% under HUD's ${money(price.benchmark.amount)} benchmark. Clearlease flags 25% or more.`,
          counted: true,
          source: FTC,
        },
      ],
    });
  }

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
    if (s.present) add(id, rule.label, rule.weight, quoted(s.quote, corpus, rule.label, rule.source), !rule.source);
  }

  const modelSaw = x.aiInstructions.present ? quoted(x.aiInstructions.quote, corpus, "Instructions aimed at AI tools") : null;
  const regexSaw = findInjection(rawText);
  if (modelSaw?.counted || regexSaw) {
    const ev = modelSaw?.counted ? modelSaw : { label: "Instructions aimed at AI tools", quote: regexSaw!, quoteFrom: "text" as const, counted: true };
    flags.push({ id: "aiInstructions", label: "Hides instructions aimed at AI checkers like this one", weight: 2, heuristic: true, evidence: [ev] });
  } else if (modelSaw) {
    dropped.push({ ...modelSaw, label: "Instructions aimed at AI tools (not counted: quote not found)" });
  }

  const score = flags.reduce((s, f) => s + f.weight, 0);
  const status: ScamCheck["status"] = score === 0 ? "none_found" : score >= LIKELY_AT ? "likely" : "some";
  const n = flags.length;
  const headline = status === "none_found" ? `No red flags found in ${CHECK_COUNT} checks` : `${n} of ${CHECK_COUNT} checks flagged`;
  const detail =
    status === "none_found"
      ? "That isn't a guarantee. See the place in person (or on a live video tour) and sign a lease before you pay anything."
      : status === "likely"
        ? "These match the warning signs the FTC lists for rental scams. Don't send money. If you already paid, use the FTC link below."
        : "Get answers to the questions below before you send any money.";

  return { status, headline, detail, flagged: n, checked: CHECK_COUNT, flags, dropped };
}
