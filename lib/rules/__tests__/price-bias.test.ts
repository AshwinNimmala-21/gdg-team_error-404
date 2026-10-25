import { describe, expect, it } from "vitest";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";
import { priceVerdict } from "@/lib/client/verdicts";
import { savedBenchmarks } from "@/lib/data/benchmarks";
import type { Extraction } from "@/lib/types";
import { resolveFacts, runRules } from "../check";
import { FAR_BELOW_ALONE, FAR_BELOW_WITH_FLAGS } from "../price";
import { makeCorpus } from "../quotes";

// Cheap rent alone must not read as a scam: shared rooms, older units and income-restricted units are often
// priced far under the local range. "Suspiciously cheap" needs at least one other scam sign.

const TEXT = "1BR in Clarendon, Arlington VA 22201. $1,200/month. Tours at the leasing office. Send the deposit by Zelle before the viewing.";
const fine = SAMPLE_EXTRACTIONS["fine-arlington"];

function check(signals: Partial<Extraction["signals"]>) {
  const x: Extraction = {
    ...fine,
    listing: {
      ...fine.listing,
      rent: { amount: 1200, quote: "$1,200/month" },
      bedrooms: { count: 1, quote: "1BR in Clarendon" },
      zip: { value: "22201", quote: "Arlington VA 22201" },
      deposit: { amount: null, quote: null },
      applicationFee: { amount: null, quote: null },
    },
    signals: { ...fine.signals, ...signals },
  };
  const facts = resolveFacts(x, makeCorpus(TEXT, null));
  return runRules({ extraction: x, text: TEXT, facts, benchmarks: savedBenchmarks("22201", 1) });
}

describe("price bias: cheap alone is not a scam sign", () => {
  it("far below with no other sign says 'verify before paying', not 'Suspiciously cheap'", () => {
    const r = check({});
    expect(r.price.farBelow).toBe(true);
    expect(r.price.suspicious).toBe(false);
    expect(priceVerdict(r.price)).toEqual({ word: "Below usual range: verify before paying", tone: "warn" });
    expect(r.price.detail).toContain(FAR_BELOW_ALONE);
    expect(r.scam.flags.map((f) => f.id)).not.toContain("priceFarBelow");
    expect(r.scam.status).toBe("none_found");
  });

  it("far below plus another scam sign says 'Suspiciously cheap' and counts the price flag", () => {
    const r = check({ payBeforeViewing: { present: true, quote: "Send the deposit by Zelle before the viewing" } });
    expect(r.price.suspicious).toBe(true);
    expect(priceVerdict(r.price)).toEqual({ word: "Suspiciously cheap", tone: "stop" });
    expect(r.price.detail).toContain(FAR_BELOW_WITH_FLAGS);
    expect(r.scam.flags[0].id).toBe("priceFarBelow");
    expect(r.scam.status).toBe("likely"); // 2 + 2
  });

  it("a sign whose quote isn't in the text doesn't unlock 'Suspiciously cheap'", () => {
    const r = check({ pressure: { present: true, quote: "only today, many applicants" } });
    expect(r.price.suspicious).toBe(false);
    expect(r.scam.flags).toHaveLength(0);
  });
});
