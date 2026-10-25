import { describe, expect, it } from "vitest";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";
import { priceVerdict } from "@/lib/client/verdicts";
import { savedBenchmarks } from "@/lib/data/benchmarks";
import type { Extraction } from "@/lib/types";
import { resolveFacts, runRules } from "../check";
import { SUBLET_LINE } from "../price";
import { makeCorpus } from "../quotes";

const fine = SAMPLE_EXTRACTIONS["fine-arlington"];

function check(text: string, listing: Partial<Extraction["listing"]>, signals: Partial<Extraction["signals"]> = {}, overrides = {}) {
  const x: Extraction = {
    ...fine,
    listing: {
      ...fine.listing,
      deposit: { amount: null, quote: null },
      applicationFee: { amount: null, quote: null },
      ...listing,
    },
    signals: { ...fine.signals, ...signals },
  };
  const facts = resolveFacts(x, makeCorpus(text, null), overrides);
  return runRules({ extraction: x, text, facts, benchmarks: savedBenchmarks(facts.zip, facts.bedrooms) });
}

describe("per-bedroom and per-person rent", () => {
  const TEXT = "Room in a 4-bedroom student apartment, Blacksburg VA 24060. $650 per bedroom per month. Tours at the leasing office.";
  const room = {
    rent: { amount: 650, quote: "$650 per bedroom" },
    bedrooms: { count: 1, quote: "Room in a 4-bedroom" },
    zip: { value: "24060", quote: "Blacksburg VA 24060" },
    priceBasis: { value: "per_bedroom" as const, quote: "$650 per bedroom per month" },
    unitBedrooms: { count: 4, quote: "Room in a 4-bedroom" },
  };

  it("compares per-bedroom rent with the 4-bedroom benchmark divided by 4, labelled as an approximation", () => {
    const r = check(TEXT, room);
    const b = savedBenchmarks("24060", 4);
    expect(r.read.bedrooms).toBe(4);
    const lows = [b.fmr!.amount, b.censusBedroom?.amount].filter((n): n is number => typeof n === "number").map((n) => n / 4);
    expect(r.price.range!.low).toBeCloseTo(Math.min(...lows));
    expect(r.price.headline).toMatch(/one bedroom's share of a 4-bedroom in ZIP 24060/);
    expect(r.price.detail).toMatch(/divided by 4, an approximation/);
    expect(r.price.evidence.some((e) => e.label === "Rent is per bedroom" && e.counted)).toBe(true);
    expect(r.price.evidence.some((e) => /÷ 4 bedrooms = per-bedroom share \(approximation\)/.test(e.value ?? ""))).toBe(true);
  });

  it("without the per-bedroom basis, the same $650 is compared with a whole unit (the old behaviour)", () => {
    const r = check(TEXT, { ...room, priceBasis: { value: null, quote: null } });
    expect(r.read.bedrooms).not.toBe(4); // "Room in a 4-bedroom" doesn't prove 1 bedroom, so it's dropped
    expect(r.price.headline).not.toMatch(/share/);
  });

  it("ignores a per-bedroom basis whose quote isn't in the text", () => {
    const r = check(TEXT, { ...room, priceBasis: { value: "per_bedroom", quote: "rent is by the bed" } });
    expect(r.price.headline).not.toMatch(/share/);
  });

  it("handles per-person rent the same way, worded per person", () => {
    const t = "5-bedroom house near campus, Blacksburg 24060. $575 per person per month.";
    const r = check(t, {
      rent: { amount: 575, quote: "$575 per person" },
      bedrooms: { count: 5, quote: "5-bedroom house" },
      zip: { value: "24060", quote: "Blacksburg 24060" },
      priceBasis: { value: "per_person", quote: "$575 per person per month" },
      unitBedrooms: { count: 5, quote: "5-bedroom house" },
    });
    expect(r.price.headline).toMatch(/one person's share of a 5-bedroom/);
    expect(r.price.detail).toMatch(/Per-person figures/);
  });
});

describe("sublets and short-term rentals", () => {
  const TEXT = "Summer sublet, Blacksburg VA 24060: my 1BR apartment, $300/month, May to August. Happy to show it.";
  const sublet = {
    rent: { amount: 300, quote: "$300/month" },
    bedrooms: { count: 1, quote: "my 1BR apartment" },
    zip: { value: "24060", quote: "Blacksburg VA 24060" },
    shortTerm: { present: true, quote: "Summer sublet" },
  };

  it("adds the sublet line and doesn't escalate on price alone", () => {
    const r = check(TEXT, sublet);
    expect(r.price.status).toBe("below");
    expect(r.price.detail).toContain(SUBLET_LINE);
    expect(r.price.suspicious).toBe(false);
    expect(priceVerdict(r.price).word).not.toBe("Suspiciously cheap");
    expect(r.scam.status).toBe("none_found");
  });

  it("still escalates when a real scam sign comes with it", () => {
    const t = `${TEXT} Zelle the first month before you see it.`;
    const r = check(t, sublet, { payBeforeViewing: { present: true, quote: "Zelle the first month before you see it" } });
    expect(r.price.detail).toContain(SUBLET_LINE);
    expect(r.scam.status).not.toBe("none_found");
  });

  it("doesn't add the line for a normal 12-month listing", () => {
    const r = check(TEXT, { ...sublet, shortTerm: { present: false, quote: null } });
    expect(r.price.detail).not.toContain(SUBLET_LINE);
  });
});
