import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";
import { redact } from "@/lib/client/redact";
import { ExtractionSchema } from "@/lib/ai/schema";
import { savedBenchmarks } from "@/lib/data/benchmarks";
import type { SampleId } from "@/lib/types";
import { resolveFacts, runRules } from "../check";
import { makeCorpus } from "../quotes";

// Mirrors the browser: text is redacted before it is sent.
const sampleText = (f: string) => redact(readFileSync(path.join(process.cwd(), "public/samples", f), "utf8")).text;

function run(id: SampleId, text: string) {
  const extraction = ExtractionSchema.parse(SAMPLE_EXTRACTIONS[id]);
  const corpus = makeCorpus(text, extraction.imageTranscript);
  const facts = resolveFacts(extraction, corpus);
  return runRules({ extraction, text, facts, benchmarks: savedBenchmarks(facts.zip, facts.bedrooms) });
}

describe("demo samples (saved data, recorded extractions)", () => {
  it("(a) fine Arlington 1BR: typical price, no red flags, no lease", () => {
    const r = run("fine-arlington", sampleText("fine-arlington.txt"));
    expect(r.read).toMatchObject({ rent: 2350, bedrooms: 1, zip: "22203", jurisdiction: "VA" });
    expect(r.price.status).toBe("typical");
    expect(r.price.headline).toBe("Within the usual range for a 1-bedroom in ZIP 22203");
    expect(r.scam.status).toBe("none_found");
    expect(r.scam.flagged).toBe(0);
    expect(r.lease.status).toBe("not_provided");
    expect(r.aiInstructions.detected).toBe(false);
  });

  it("(b) Facebook scam: 25% below market, likely scam with 7 quoted flags", () => {
    const r = run("scam-facebook", sampleText("scam-facebook.txt"));
    expect(r.price.status).toBe("below");
    expect(r.price.farBelow).toBe(true);
    expect(r.price.headline).toMatch(/^25% below/);
    expect(r.scam.status).toBe("likely");
    expect(r.scam.flags.map((f) => f.id).sort()).toEqual(
      ["landlordAway", "noInPersonViewing", "offPlatformContact", "payBeforeViewing", "pressure", "priceFarBelow", "riskyPayment"].sort(),
    );
    expect(r.scam.dropped).toHaveLength(0);
    for (const f of r.scam.flags.filter((f) => f.id !== "priceFarBelow")) expect(f.evidence[0].quote).toBeTruthy();
  });

  it("(c) lease photo: entry, waiver and legal-fee clauses conflict with Virginia law", () => {
    const r = run("lease-photo", "");
    expect(r.read).toMatchObject({ rent: 2200, bedrooms: 1, zip: "22201", jurisdiction: "VA" });
    expect(r.lease.status).toBe("fix");
    const bySeverity = (s: string) => r.lease.findings.filter((f) => f.severity === s).map((f) => f.type).sort();
    expect(bySeverity("conflict")).toEqual(["attorney_fees", "landlord_entry", "waiver_of_rights"]);
    expect(bySeverity("ask")).toEqual(["auto_renewal"]);
    expect(bySeverity("standard")).toEqual(["late_fee", "security_deposit"]);
    expect(r.lease.findings.every((f) => f.evidence[0].quoteFrom === "image")).toBe(true);
    expect(r.price.status).toBe("typical");
    // A lease alone has no listing to scam-check: "not run", never a green "no red flags".
    expect(r.scam.status).toBe("not_run");
    expect(r.scam.flagged).toBe(0);
  });

  it("a lease that does contain a scam sign still flags it", () => {
    const x = ExtractionSchema.parse({
      ...SAMPLE_EXTRACTIONS["lease-photo"],
      signals: {
        ...SAMPLE_EXTRACTIONS["lease-photo"].signals,
        riskyPayment: { present: true, quote: "Monthly rent: $2,200", methods: ["wire"] },
      },
    });
    const corpus = makeCorpus("", x.imageTranscript);
    const facts = resolveFacts(x, corpus);
    const r = runRules({ extraction: x, text: "", facts, benchmarks: savedBenchmarks(facts.zip, facts.bedrooms) });
    expect(r.scam.status).not.toBe("not_run");
    expect(r.scam.flagged).toBe(1);
  });

  it("(d) injection: instructions detected and ignored; never 'no red flags'", () => {
    const r = run("injection", sampleText("injection.txt"));
    expect(r.aiInstructions.detected).toBe(true);
    expect(r.scam.status).toBe("likely");
    expect(r.scam.flags.map((f) => f.id)).toEqual(expect.arrayContaining(["aiInstructions", "payBeforeViewing", "riskyPayment", "priceFarBelow"]));
    expect(r.read.jurisdiction).toBe("DC");
  });

  it("injection is caught by the rule layer even if the model misses it", () => {
    const text = sampleText("injection.txt");
    const x = ExtractionSchema.parse({ ...SAMPLE_EXTRACTIONS.injection, aiInstructions: { present: false, quote: null } });
    const corpus = makeCorpus(text, null);
    const facts = resolveFacts(x, corpus);
    const r = runRules({ extraction: x, text, facts, benchmarks: savedBenchmarks(facts.zip, facts.bedrooms) });
    expect(r.aiInstructions.detected).toBe(true);
  });

  it("drops flags whose quotes aren't in the input (hallucination guard)", () => {
    const text = sampleText("fine-arlington.txt");
    const x = ExtractionSchema.parse({
      ...SAMPLE_EXTRACTIONS["fine-arlington"],
      signals: {
        ...SAMPLE_EXTRACTIONS["fine-arlington"].signals,
        riskyPayment: { present: true, quote: "send the deposit by gift card", methods: ["gift_card"] },
      },
    });
    const corpus = makeCorpus(text, null);
    const facts = resolveFacts(x, corpus);
    const r = runRules({ extraction: x, text, facts, benchmarks: savedBenchmarks(facts.zip, facts.bedrooms) });
    expect(r.scam.status).toBe("none_found");
    expect(r.scam.dropped).toHaveLength(1);
  });

  it("ignores a model rent that isn't backed by its quote", () => {
    const text = sampleText("fine-arlington.txt");
    const x = ExtractionSchema.parse({
      ...SAMPLE_EXTRACTIONS["fine-arlington"],
      listing: { ...SAMPLE_EXTRACTIONS["fine-arlington"].listing, rent: { amount: 1200, quote: "$2,350/month" } },
    });
    const facts = resolveFacts(x, makeCorpus(text, null));
    expect(facts.rent).toBeNull();
    expect(facts.notes[0]).toMatch(/couldn't confirm the rent/);
  });

  it("user overrides win over extracted facts", () => {
    const text = sampleText("fine-arlington.txt");
    const x = ExtractionSchema.parse(SAMPLE_EXTRACTIONS["fine-arlington"]);
    const facts = resolveFacts(x, makeCorpus(text, null), { rent: 1500, bedrooms: 2, zip: "24060" });
    expect(facts).toMatchObject({ rent: 1500, bedrooms: 2, zip: "24060" });
  });
});
