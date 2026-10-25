import { describe, expect, it } from "vitest";
import { CLAUSE_TYPES } from "@/lib/ai/schema";
import type { Jurisdiction, LeaseCheck, PriceCheck, ScamCheck } from "@/lib/types";
import { buildQuestions, leaseQuestion, SCAM_Q } from "../questions";
import { toSpanish } from "../questions-es";

// Every English question template must have a Spanish version, so Spanish mode never shows a stray English question.
const leaseIn = (jurisdiction: Jurisdiction | null) => ({ jurisdiction }) as LeaseCheck;

describe("Spanish question templates", () => {
  it("cover every scam question", () => {
    for (const q of Object.values(SCAM_Q)) {
      expect(toSpanish(q!.text), q!.text).not.toBeNull();
      expect(toSpanish(q!.why), q!.why).not.toBeNull();
    }
  });
  it("cover every lease question, for every severity and state", () => {
    for (const type of CLAUSE_TYPES)
      for (const sev of ["conflict", "ask"] as const)
        for (const j of ["VA", "DC", "MD", null] as const) {
          const q = leaseQuestion(type, sev, leaseIn(j));
          if (!q) continue;
          expect(toSpanish(q.text), q.text).not.toBeNull();
          expect(toSpanish(q.why), q.why).not.toBeNull();
        }
  });
  it("cover the general questions, and buildQuestions returns Spanish in 'es'", () => {
    const price = { status: "rough" } as PriceCheck;
    const scam = { flags: [] } as unknown as ScamCheck;
    const lease = { status: "not_provided", findings: [], jurisdiction: null } as unknown as LeaseCheck;
    const en = buildQuestions(price, scam, lease, "en");
    const es = buildQuestions(price, scam, lease, "es");
    expect(es).toHaveLength(en.length);
    for (const [i, q] of en.entries()) {
      expect(toSpanish(q.text), q.text).not.toBeNull();
      expect(es[i].text).toBe(toSpanish(q.text));
    }
    expect(buildQuestions({ status: "above" } as PriceCheck, scam, lease, "es").some((q) => q.text.startsWith("¿Qué incluye"))).toBe(true);
  });
  it("fills in the state name and hours", () => {
    expect(toSpanish("Virginia requires notice before a landlord enters.")).toBe("Virginia exige aviso antes de que el arrendador entre.");
    expect(toSpanish("your state limits how large a deposit can be.")).toBe("Su estado limita el monto del depósito.");
    expect(toSpanish("Will you change the entry clause to give me at least 48 hours' written notice?")).toMatch(/48 horas/);
  });
});
