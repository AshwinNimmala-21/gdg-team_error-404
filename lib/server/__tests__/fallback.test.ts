import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { redact } from "@/lib/client/redact";

// The live model always fails in these tests: every attempt ends in model_failed.
vi.mock("@/lib/ai/gemma", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/gemma")>();
  return {
    ...actual,
    extractWithGemma: vi.fn(async () => {
      throw new actual.ExtractionError("model_failed", "Couldn't reach Gemma.");
    }),
  };
});

const { isUnchangedSample, runCheck } = await import("@/lib/server/check");

// What the browser sends for a sample: the file text after contact redaction.
const sample = (file: string) => redact(readFileSync(`public/samples/${file}`, "utf8")).text;
const fakeImage = { mimeType: "image/jpeg" as const, data: "AAAA" };

beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-key"; // not mock mode: take the live path, which fails
  delete process.env.MOCK_AI;
  delete process.env.HUD_TOKEN;
  delete process.env.CENSUS_KEY;
  delete process.env.COMMUNITY_SALT;
});

describe("isUnchangedSample", () => {
  it("accepts each built-in sample as the browser sends it", () => {
    expect(isUnchangedSample("fine-arlington", sample("fine-arlington.txt"), false)).toBe(true);
    expect(isUnchangedSample("scam-facebook", sample("scam-facebook.txt"), false)).toBe(true);
    expect(isUnchangedSample("injection", sample("injection.txt"), false)).toBe(true);
    expect(isUnchangedSample("lease-photo", "", true)).toBe(true);
  });

  it("rejects an edited sample, a sample with an added photo, and a lease sample with text", () => {
    const edited = sample("scam-facebook.txt").replace("Western Union", "Zelle");
    expect(isUnchangedSample("scam-facebook", edited, false)).toBe(false);
    expect(isUnchangedSample("fine-arlington", sample("fine-arlington.txt"), true)).toBe(false);
    expect(isUnchangedSample("lease-photo", "my own lease text", true)).toBe(false);
    expect(isUnchangedSample("lease-photo", "", false)).toBe(false);
  });
});

describe("saved result when the live model fails", () => {
  it("serves the saved answer for an unchanged sample, marked as saved", async () => {
    const r = await runCheck({ text: sample("scam-facebook.txt"), sampleId: "scam-facebook" });
    expect(r.meta.mode).toBe("saved");
    expect(r.scam.status).toBe("likely");
  });

  it("serves the lease photo sample's saved answer", async () => {
    const r = await runCheck({ text: "", image: fakeImage, sampleId: "lease-photo" });
    expect(r.meta.mode).toBe("saved");
    expect(r.lease.status).toBe("fix");
  });

  it("never serves a saved answer for user input", async () => {
    await expect(runCheck({ text: "1BR in Arlington 22201, $1,900/month. Tours on Saturday." })).rejects.toMatchObject({
      code: "model_failed",
    });
  });

  it("never serves a saved answer for an edited sample", async () => {
    const edited = sample("fine-arlington.txt").replace("$2,350/month", "$1,200/month");
    await expect(runCheck({ text: edited, sampleId: "fine-arlington" })).rejects.toMatchObject({ code: "model_failed" });
  });
});
