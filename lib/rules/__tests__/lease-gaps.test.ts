import { describe, expect, it } from "vitest";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";
import type { Extraction, Jurisdiction } from "@/lib/types";
import { computeLease } from "../lease";
import { makeCorpus } from "../quotes";

// General fixes motivated by eval run "before" (docs/evaluation.md): a deposit stated as a plain fact in a lease
// wasn't checked against the state cap, and a "tenant pays all repairs" clause was only an "ask".
const base = SAMPLE_EXTRACTIONS["fine-arlington"];

function lease(text: string, opts: { deposit?: [number, string]; clauses?: Extraction["clauses"] }, j: Jurisdiction, rent: number) {
  const x: Extraction = {
    ...base,
    inputKinds: ["lease"],
    listing: { ...base.listing, deposit: opts.deposit ? { amount: opts.deposit[0], quote: opts.deposit[1] } : { amount: null, quote: null } },
    clauses: opts.clauses ?? [],
  };
  return computeLease(x, makeCorpus(text, null), j, rent);
}
const repairs = (quote: string): Extraction["clauses"][number] => ({
  type: "repairs_on_tenant", quote, plain: "You pay for repairs.", noticeHours: null, noticeDays: null, graceDays: null, amount: null, percent: null,
});

describe("deposit stated as a fact in the lease", () => {
  it("VA: a deposit of 2.5× rent conflicts with the 2-month cap even when it isn't extracted as a clause", () => {
    const t = "Lease for 22203. Monthly rent: $1,200. Security deposit due at signing: $3,000.";
    const r = lease(t, { deposit: [3000, "Security deposit due at signing: $3,000"] }, "VA", 1200);
    const f = r.findings.find((f) => f.type === "security_deposit")!;
    expect(f.severity).toBe("conflict");
    expect(f.law?.citation).toMatch(/55\.1-1226/);
    expect(r.status).toBe("fix");
  });
  it("VA: exactly 2× rent is within the cap", () => {
    const t = "Monthly rent: $1,200. Security deposit: $2,400.";
    expect(lease(t, { deposit: [2400, "Security deposit: $2,400"] }, "VA", 1200).findings[0].severity).toBe("standard");
  });
  it("DC and MD: more than 1 month's rent conflicts", () => {
    const t = "Monthly rent: $1,500. Security deposit: $2,000.";
    for (const j of ["DC", "MD"] as const) expect(lease(t, { deposit: [2000, "Security deposit: $2,000"] }, j, 1500).findings[0].severity).toBe("conflict");
  });
  it("ignores a deposit whose quote isn't in the text, and doesn't double-count a deposit clause", () => {
    const t = "Monthly rent: $1,500.";
    expect(lease(t, { deposit: [5000, "Deposit: $5,000"] }, "VA", 1500).findings).toHaveLength(0);
    const withClause = lease("Security deposit: $2,000. Rent $1,500.", {
      deposit: [2000, "Security deposit: $2,000"],
      clauses: [{ type: "security_deposit", quote: "Security deposit: $2,000", plain: "x", noticeHours: null, noticeDays: null, graceDays: null, amount: 2000, percent: null }],
    }, "VA", 1500);
    expect(withClause.findings.filter((f) => f.type === "security_deposit")).toHaveLength(1);
  });
});

describe("tenant pays all repairs", () => {
  const blanket = "Tenant shall pay for all repairs to the furnace, water heater and wiring, regardless of cause.";
  it("VA: a blanket repair clause conflicts (Va. Code §§ 55.1-1220(A), 55.1-1208(C))", () => {
    const f = lease(blanket, { clauses: [repairs(blanket)] }, "VA", 1200).findings[0];
    expect(f.severity).toBe("conflict");
    expect(f.law?.citation).toBe("Va. Code §§ 55.1-1220(A), 55.1-1208(C)");
  });
  it("VA: paying for damage you cause is only an 'ask'", () => {
    const narrow = "Tenant shall pay for repairs of damage caused by Tenant or Tenant's guests.";
    expect(lease(narrow, { clauses: [repairs(narrow)] }, "VA", 1200).findings[0].severity).toBe("ask");
  });
  it("MD: stays 'ask' (no verified Maryland statute voids it)", () => {
    expect(lease(blanket, { clauses: [repairs(blanket)] }, "MD", 1200).findings[0].severity).toBe("ask");
  });
});
