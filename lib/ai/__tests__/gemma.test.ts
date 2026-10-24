import { ApiError } from "@google/genai";
import { describe, expect, it } from "vitest";
import { generateWithRetries, type Generate, type Level } from "@/lib/ai/gemma";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";

const OK = { text: JSON.stringify(SAMPLE_EXTRACTIONS["fine-arlington"]), usageMetadata: undefined };
const noSleep = async () => {};

// A fake model call that plays a script of outcomes and records the level of each attempt.
function scripted(outcomes: ("ok" | "bad-json" | number | "network" | "hang")[]) {
  const levels: Level[] = [];
  const generate: Generate = (level, signal) => {
    levels.push(level);
    const next = outcomes[levels.length - 1] ?? "ok";
    if (next === "ok") return Promise.resolve(OK);
    if (next === "bad-json") return Promise.resolve({ text: "The user wants me to…", usageMetadata: undefined });
    if (next === "network") return Promise.reject(new TypeError("fetch failed"));
    if (next === "hang")
      return new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted"))));
    return Promise.reject(new ApiError({ message: "x", status: next }));
  };
  return { generate, levels };
}

const run = (g: Generate, attemptMs = 1_000) => generateWithRetries(g, { attemptMs, sleep: noSleep });

describe("generateWithRetries", () => {
  it("retries a 5xx at the same level, then succeeds", async () => {
    const s = scripted([503, "ok"]);
    await expect(run(s.generate)).resolves.toMatchObject({ extraction: { inputKinds: ["listing"] } });
    expect(s.levels).toEqual([0, 0]);
  });

  it("retries network errors at most twice", async () => {
    const s = scripted(["network", "network", "network", "ok"]);
    await expect(run(s.generate)).rejects.toMatchObject({ code: "model_failed", message: "Couldn't reach Gemma." });
    expect(s.levels).toHaveLength(3);
  });

  it("retries an attempt that hits its own timeout", async () => {
    const s = scripted(["hang", "ok"]);
    await expect(run(s.generate, 20)).resolves.toHaveProperty("extraction");
    expect(s.levels).toEqual([0, 0]);
  });

  it("steps down on a 400 or unparseable output without spending a retry", async () => {
    const s = scripted([400, "bad-json", 502, "ok"]);
    await expect(run(s.generate)).resolves.toHaveProperty("extraction");
    expect(s.levels).toEqual([0, 1, 2, 2]);
  });

  it("starts every request at level 0 (a step-down is never sticky)", async () => {
    const first = scripted([400, "ok"]);
    await run(first.generate);
    expect(first.levels).toEqual([0, 1]);
    const second = scripted(["ok"]);
    await run(second.generate);
    expect(second.levels).toEqual([0]);
  });

  it("does not retry a 429 or another 4xx", async () => {
    const busy = scripted([429, "ok"]);
    await expect(run(busy.generate)).rejects.toMatchObject({ code: "model_busy" });
    expect(busy.levels).toHaveLength(1);
    const denied = scripted([403, "ok"]);
    await expect(run(denied.generate)).rejects.toMatchObject({ code: "model_failed" });
    expect(denied.levels).toHaveLength(1);
  });
});
