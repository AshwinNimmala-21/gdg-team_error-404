import type { Lang } from "@/lib/i18n";
import type { LeaseCheck, PriceCheck, ScamCheck } from "@/lib/types";

export type Tone = "ok" | "warn" | "stop" | "nil";
export interface Verdict {
  word: string;
  tone: Tone;
}

const W = {
  en: {
    typical: "Typical", above: "Above usual range", rough: "Rough comparison", suspicious: "Suspiciously cheap",
    farBelow: "Below usual range: verify before paying", below: "Below usual range", unknown: "Not enough info",
    notRun: "Not run", likely: "Likely scam", some: "Some red flags", none: "No red flags found",
    fix: "Fix before signing", ask: (n: number) => `Ask about ${n} clause${n === 1 ? "" : "s"}`, standard: "Looks standard", noLease: "No lease yet",
    noClauses: "No clauses found", checkWording: "Check the wording",
  },
  es: {
    typical: "Precio normal", above: "Por encima de lo usual", rough: "Comparación aproximada", suspicious: "Sospechosamente barato",
    farBelow: "Por debajo de lo usual: verifique antes de pagar", below: "Por debajo de lo usual", unknown: "Faltan datos",
    notRun: "No se revisó", likely: "Probable estafa", some: "Algunas señales de alerta", none: "Sin señales de alerta",
    fix: "Corregir antes de firmar", ask: (n: number) => `Pregunte sobre ${n} cláusula${n === 1 ? "" : "s"}`, standard: "Parece estándar", noLease: "Sin contrato todavía",
    noClauses: "No se encontraron cláusulas", checkWording: "Revise el texto",
  },
};

export function priceVerdict(p: PriceCheck, lang: Lang = "en"): Verdict {
  const w = W[lang];
  switch (p.status) {
    case "typical":
      return { word: w.typical, tone: "ok" };
    case "rough":
      return { word: w.rough, tone: "nil" };
    case "above":
      return { word: w.above, tone: "warn" };
    case "below":
      // "Suspiciously cheap" needs cheap rent plus another scam sign; cheap alone just says to verify.
      if (p.suspicious) return { word: w.suspicious, tone: "stop" };
      return p.farBelow ? { word: w.farBelow, tone: "warn" } : { word: w.below, tone: "warn" };
    default:
      return { word: w.unknown, tone: "nil" };
  }
}

export function scamVerdict(s: ScamCheck, lang: Lang = "en"): Verdict {
  const w = W[lang];
  if (s.status === "not_run") return { word: w.notRun, tone: "nil" };
  if (s.status === "likely") return { word: w.likely, tone: "stop" };
  if (s.status === "some") return { word: w.some, tone: "warn" };
  return { word: w.none, tone: "ok" };
}

export function leaseVerdict(l: LeaseCheck, lang: Lang = "en"): Verdict {
  const w = W[lang];
  const asks = l.findings.filter((f) => f.severity === "ask" && f.evidence[0]?.counted).length;
  switch (l.status) {
    case "fix":
      return { word: w.fix, tone: "stop" };
    case "ask":
      return asks > 0 ? { word: w.ask(asks), tone: "warn" } : { word: w.checkWording, tone: "warn" };
    case "standard":
      // Green only when we actually checked something; an empty lease read isn't approval.
      return l.findings.some((f) => f.evidence[0]?.counted) ? { word: w.standard, tone: "ok" } : { word: w.noClauses, tone: "nil" };
    default:
      return { word: w.noLease, tone: "nil" };
  }
}
