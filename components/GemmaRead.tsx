"use client";

import type { ReactNode } from "react";
import type { Extraction } from "@/lib/ai/schema";
import { highlightRanges } from "@/lib/client/highlight";
import { findQuote, makeCorpus } from "@/lib/rules/quotes";
import type { CheckResult } from "@/lib/types";
import { Caret } from "./Icons";
import { useLang } from "./Lang";

const GR = {
  en: {
    signals: {
      payBeforeViewing: "Money before a viewing or lease",
      riskyPayment: "Payment method",
      noInPersonViewing: "No in-person viewing",
      landlordAway: "Owner away",
      pressure: "Pressure to act fast",
      offPlatformContact: "Contact off the listing site",
      sensitiveInfoEarly: "SSN or credit report early",
    } as Record<keyof Extraction["signals"], string>,
    rent: "Rent", aMonth: " a month", size: "Size", studio: "Studio", bedroom: (n: number) => `${n} bedroom`, zip: "ZIP", deposit: "Deposit", appFee: "Application fee",
    mentioned: "Mentioned", aiFound: "Instructions aimed at AI tools", ignored: "Found and ignored",
    saved: "Gemma 4 (saved answer)", earlier: "Gemma 4 (earlier read)", demo: "Demo mode",
    what: (photo: boolean, text: boolean): string => (photo ? (text ? "text and photo" : "photo") : "text"),
    intro: (who: string, what: string, v: number, n: number) =>
      `${who} turned your ${what} into the facts below, each with the exact words it came from. Our code checked every quote against what you shared (${v} of ${n} found) and made the verdicts. The model never sets a price, a score or a legal rule.`,
    notUsed: "(quote not found, not used)", none: "Gemma didn't find rent, size, ZIP, scam signs or lease clauses in this input.",
    clauses: (n: number) => `Lease clauses found (${n}):`, clausesTail: "Each is explained in the lease section above, and highlighted below.",
    showPhoto: "Show the quotes in the photo", showText: "Show the quotes in your text",
    asSent: "Your text, as sent (phone numbers and emails removed on your device)", transcribed: "Text Gemma transcribed from the photo",
    passages: (n: number) => `${n} passage${n === 1 ? "" : "s"} highlighted`, photoAlt: "The photo you shared",
    qStart: "[quote start] ", qEnd: " [quote end]",
  },
  es: {
    signals: {
      payBeforeViewing: "Dinero antes de una visita o contrato",
      riskyPayment: "Forma de pago",
      noInPersonViewing: "Sin visita en persona",
      landlordAway: "Dueño ausente",
      pressure: "Presión para actuar rápido",
      offPlatformContact: "Contacto fuera del sitio del anuncio",
      sensitiveInfoEarly: "Seguro Social o crédito antes de tiempo",
    } as Record<keyof Extraction["signals"], string>,
    rent: "Renta", aMonth: " al mes", size: "Tamaño", studio: "Estudio", bedroom: (n: number) => `${n} recámara${n === 1 ? "" : "s"}`, zip: "Código postal", deposit: "Depósito", appFee: "Cargo de solicitud",
    mentioned: "Mencionado", aiFound: "Instrucciones dirigidas a la IA", ignored: "Encontradas e ignoradas",
    saved: "Gemma 4 (respuesta guardada)", earlier: "Gemma 4 (lectura anterior)", demo: "Modo de demostración",
    what: (photo: boolean, text: boolean): string => (photo ? (text ? "texto y su foto" : "foto") : "texto"),
    intro: (who: string, what: string, v: number, n: number) =>
      `${who} convirtió su ${what} en los datos de abajo, cada uno con las palabras exactas de donde salió. Nuestro código comprobó cada cita contra lo que usted compartió (${v} de ${n} encontradas) y decidió los veredictos. El modelo nunca fija un precio, un puntaje ni una regla legal.`,
    notUsed: "(cita no encontrada, no se usó)", none: "Gemma no encontró renta, tamaño, código postal, señales de estafa ni cláusulas en este texto.",
    clauses: (n: number) => `Cláusulas encontradas (${n}):`, clausesTail: "Cada una se explica en la sección del contrato, arriba, y se resalta abajo.",
    showPhoto: "Ver las citas en la foto", showText: "Ver las citas en su texto",
    asSent: "Su texto, tal como se envió (sin teléfonos ni correos, quitados en su dispositivo)", transcribed: "Texto que Gemma transcribió de la foto",
    passages: (n: number) => `${n} pasaje${n === 1 ? "" : "s"} resaltado${n === 1 ? "" : "s"}`, photoAlt: "La foto que compartió",
    qStart: "[inicio de la cita] ", qEnd: " [fin de la cita]",
  },
};
type GRDict = (typeof GR)["en"];

const CLAUSE_ES: Record<Extraction["clauses"][number]["type"], string> = {
  auto_renewal: "renovación automática",
  landlord_entry: "entrada del arrendador",
  late_fee: "cargo por pago tardío",
  security_deposit: "depósito de seguridad",
  early_termination: "terminación anticipada",
  waiver_of_rights: "renuncia a derechos",
  attorney_fees: "honorarios de abogados",
  repairs_on_tenant: "reparaciones a cargo del inquilino",
  rent_increase: "aumento de renta",
  other_fee: "otros cargos",
};

interface Fact {
  label: string;
  value: string;
  quote: string | null;
}

const short = (q: string) => (q.length > 90 ? `${q.slice(0, 87).trimEnd()}…` : q);
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function factsOf(x: Extraction, g: GRDict): Fact[] {
  const l = x.listing;
  const out: Fact[] = [];
  if (l.rent.amount !== null) out.push({ label: g.rent, value: `${usd(l.rent.amount)}${g.aMonth}`, quote: l.rent.quote });
  if (l.bedrooms.count !== null) out.push({ label: g.size, value: l.bedrooms.count === 0 ? g.studio : g.bedroom(l.bedrooms.count), quote: l.bedrooms.quote });
  if (l.zip.value) out.push({ label: g.zip, value: l.zip.value, quote: l.zip.quote });
  if (l.deposit.amount !== null) out.push({ label: g.deposit, value: usd(l.deposit.amount), quote: l.deposit.quote });
  if (l.applicationFee.amount !== null) out.push({ label: g.appFee, value: usd(l.applicationFee.amount), quote: l.applicationFee.quote });
  for (const [id, s] of Object.entries(x.signals) as [keyof Extraction["signals"], Extraction["signals"][keyof Extraction["signals"]]][]) {
    if (s.present) out.push({ label: g.signals[id], value: g.mentioned, quote: s.quote });
  }
  if (x.aiInstructions.present) out.push({ label: g.aiFound, value: g.ignored, quote: x.aiInstructions.quote });
  return out;
}

/** The source text with every verified quote marked. Screen readers hear "quote start/end" around each mark. */
function Marked({ source, quotes, g }: { source: string; quotes: string[]; g: GRDict }) {
  const ranges = highlightRanges(source, quotes);
  const parts: ReactNode[] = [];
  let at = 0;
  ranges.forEach(([s, e], i) => {
    if (s > at) parts.push(source.slice(at, s));
    parts.push(
      <mark key={i} className="rounded-[2px] bg-pen-tint px-0.5 text-ink">
        <span className="sr-only">{g.qStart}</span>
        {source.slice(s, e)}
        <span className="sr-only">{g.qEnd}</span>
      </mark>,
    );
    at = e;
  });
  if (at < source.length) parts.push(source.slice(at));
  return (
    <>
      <p className="mt-1 text-[13px] text-ink-soft">
        {g.passages(ranges.length)}
      </p>
      {/* The user's own text (or Gemma's transcript of their photo): always shown in the original language. */}
      <p data-quote className="mt-2 font-mono text-[13.5px] leading-relaxed break-words whitespace-pre-wrap text-ink">
        {parts}
      </p>
    </>
  );
}

export function GemmaRead({ result: r, sourceText, imageUrl }: { result: CheckResult; sourceText: string; imageUrl: string | null }) {
  const { lang } = useLang();
  const g = GR[lang];
  const x = r.extraction;
  const corpus = makeCorpus(sourceText, x.imageTranscript);
  const facts = factsOf(x, g).map((f) => ({ ...f, where: findQuote(f.quote, corpus) }));
  const clauseQuotes = x.clauses.map((c) => ({ quote: c.quote, where: findQuote(c.quote, corpus) }));
  const verified = facts.filter((f) => f.where).length + clauseQuotes.filter((c) => c.where).length;
  const total = facts.length + clauseQuotes.length;
  const live = r.meta.mode === "live";
  const who = live ? `Gemma 4 (${r.meta.model})` : r.meta.mode === "saved" ? g.saved : r.meta.mode === "rules-only" ? g.earlier : g.demo;
  const all = [...facts, ...clauseQuotes];
  const textQuotes = all.filter((f) => f.where === "text").map((f) => f.quote!);
  const imageQuotes = all.filter((f) => f.where === "image").map((f) => f.quote!);
  const hasText = sourceText.trim().length > 0;
  const transcript = x.imageTranscript;

  return (
    <section aria-labelledby="gemma-read-h" className="border-t border-rule px-4 pt-6 pb-7 sm:px-8">
      <h3 id="gemma-read-h" tabIndex={-1} className="scroll-mt-4 text-[20px] leading-tight font-bold tracking-[-0.01em]">
        {lang === "es" ? "Lo que leyó Gemma" : "What Gemma read"}
      </h3>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">
        {g.intro(who, g.what(Boolean(transcript), hasText), verified, total)}
      </p>

      {facts.length > 0 && (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div key={i} className="min-w-0 border-l-[3px] border-rule pl-3">
              <dt className="text-[13px] font-semibold tracking-wide text-ink-soft uppercase">{f.label}</dt>
              <dd className="text-[15px] font-semibold">
                {f.value}
                {!f.where && <span className="ml-2 text-[13px] font-normal text-ink-soft">{g.notUsed}</span>}
              </dd>
              {f.quote && (
                <dd data-quote className="mt-0.5 font-mono text-[13px] leading-snug break-words text-ink-soft">
                  “{short(f.quote)}”
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
      {facts.length === 0 && x.clauses.length === 0 && (
        <p className="mt-4 text-[15px]">{g.none}</p>
      )}

      {x.clauses.length > 0 && (
        <p className="mt-4 text-[15px]">
          <span className="font-semibold">{g.clauses(x.clauses.length)}</span>{" "}
          {x.clauses.map((c) => (lang === "es" ? CLAUSE_ES[c.type] : c.type.replace(/_/g, " "))).join(", ")}. {g.clausesTail}
        </p>
      )}

      {(hasText || transcript) && (
        <details className="group mt-4">
          <summary className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-pen hover:text-pen-dark">
            <Caret className="caret transition-transform motion-reduce:transition-none" />
            {transcript && !hasText ? g.showPhoto : g.showText}
          </summary>
          <div className="mt-2 space-y-5">
            {hasText && (
              <div>
                <p className="text-[14px] font-semibold">{g.asSent}</p>
                <Marked source={sourceText} quotes={textQuotes} g={g} />
              </div>
            )}
            {transcript && (
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob or sample preview
                  <img src={imageUrl} alt={g.photoAlt} className="w-32 rounded-xs border border-rule object-cover object-top" />
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{g.transcribed}</p>
                  <Marked source={transcript} quotes={imageQuotes} g={g} />
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
