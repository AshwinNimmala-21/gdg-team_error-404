import type { LeaseCheck, PriceCheck, ScamCheck } from "@/lib/types";

export type Tone = "ok" | "warn" | "stop" | "nil";
export interface Verdict {
  word: string;
  tone: Tone;
}

export function priceVerdict(p: PriceCheck): Verdict {
  switch (p.status) {
    case "typical":
      return { word: "Typical", tone: "ok" };
    case "above":
      return { word: "Above usual range", tone: "warn" };
    case "below":
      return p.farBelow ? { word: "Suspiciously cheap", tone: "stop" } : { word: "Below usual range", tone: "warn" };
    default:
      return { word: "Not enough info", tone: "nil" };
  }
}

export function scamVerdict(s: ScamCheck): Verdict {
  if (s.status === "not_run") return { word: "Not run", tone: "nil" };
  if (s.status === "likely") return { word: "Likely scam", tone: "stop" };
  if (s.status === "some") return { word: "Some red flags", tone: "warn" };
  return { word: "No red flags found", tone: "ok" };
}

export function leaseVerdict(l: LeaseCheck): Verdict {
  const asks = l.findings.filter((f) => f.severity === "ask" && f.evidence[0]?.counted).length;
  switch (l.status) {
    case "fix":
      return { word: "Fix before signing", tone: "stop" };
    case "ask":
      return { word: `Ask about ${asks} clause${asks === 1 ? "" : "s"}`, tone: "warn" };
    case "standard":
      return { word: "Looks standard", tone: "ok" };
    default:
      return { word: "No lease yet", tone: "nil" };
  }
}
