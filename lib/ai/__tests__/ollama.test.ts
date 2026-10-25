import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_MODEL, generateWithRetries, modelId, providerFromEnv } from "@/lib/ai/gemma";
import { SAMPLE_EXTRACTIONS } from "@/lib/ai/mock";
import { DEFAULT_OLLAMA_MODEL, ollamaGenerate, ollamaRequest, type OllamaRequest } from "@/lib/ai/ollama";
import { isMockMode } from "@/lib/server/check";

const ENV = ["GEMMA_PROVIDER", "GEMMA_MODEL", "GEMINI_API_KEY", "MOCK_AI"] as const;
const saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const input = { system: "SYS", prompt: (level: number) => `P${level}`, image: { mimeType: "image/jpeg", data: "QUJD" } };
const okBody = { choices: [{ message: { content: JSON.stringify(SAMPLE_EXTRACTIONS["fine-arlington"]) } }], usage: { prompt_tokens: 10, completion_tokens: 20 } };

/** A fake fetch that plays a script of HTTP statuses and records each request body. */
function fakeFetch(statuses: number[]) {
  const bodies: OllamaRequest[] = [];
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    bodies.push(JSON.parse(String(init.body)));
    const status = statuses[bodies.length - 1] ?? 200;
    return new Response(status === 200 ? JSON.stringify(okBody) : "{}", { status });
  }) as unknown as typeof fetch;
  return { fetchImpl, bodies };
}
const run = (statuses: number[]) => {
  const f = fakeFetch(statuses);
  const generate = ollamaGenerate({ baseUrl: "http://x/v1/", model: "gemma4:e2b", input, fetchImpl: f.fetchImpl });
  return { f, result: generateWithRetries(generate, { attemptMs: 1_000, sleep: async () => {} }) };
};

describe("provider switch", () => {
  it("defaults to the Gemini API with the hosted model, unchanged", () => {
    delete process.env.GEMMA_PROVIDER;
    delete process.env.GEMMA_MODEL;
    expect(providerFromEnv()).toBe("gemini");
    expect(modelId()).toBe(DEFAULT_MODEL);
    process.env.GEMMA_PROVIDER = "something-else";
    expect(providerFromEnv()).toBe("gemini");
  });
  it("GEMMA_PROVIDER=ollama picks Ollama and its model default; GEMMA_MODEL still wins", () => {
    process.env.GEMMA_PROVIDER = "Ollama";
    delete process.env.GEMMA_MODEL;
    expect(providerFromEnv()).toBe("ollama");
    expect(modelId()).toBe(DEFAULT_OLLAMA_MODEL);
    process.env.GEMMA_MODEL = "gemma4:e2b-it-qat";
    expect(modelId()).toBe("gemma4:e2b-it-qat");
  });
  it("a self-hosted model needs no Gemini key, so it isn't demo mode", () => {
    delete process.env.MOCK_AI;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMMA_PROVIDER;
    expect(isMockMode()).toBe(true);
    process.env.GEMMA_PROVIDER = "ollama";
    expect(isMockMode()).toBe(false);
    process.env.MOCK_AI = "1";
    expect(isMockMode()).toBe(true);
  });
});

describe("Ollama request", () => {
  it("level 0 asks for the JSON schema, level 1 for JSON, level 2 for text; the image goes as a data URL", () => {
    const r0 = ollamaRequest("m", 0, input);
    expect(r0.response_format).toMatchObject({ type: "json_schema", json_schema: { name: "extraction" } });
    expect(ollamaRequest("m", 1, input).response_format).toEqual({ type: "json_object" });
    expect(ollamaRequest("m", 2, input).response_format).toBeUndefined();
    expect(r0.messages[0]).toEqual({ role: "system", content: "SYS" });
    expect(r0.messages[1].content).toEqual([
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,QUJD" } },
      { type: "text", text: "P0" },
    ]);
    expect(r0.temperature).toBe(0);
    expect(r0.reasoning_effort).toBe("none");
    expect(ollamaRequest("m", 1, input).reasoning_effort).toBeUndefined();
  });
});

describe("Ollama through the same retry ladder", () => {
  it("parses the answer and token usage", async () => {
    const { result } = run([]);
    await expect(result).resolves.toMatchObject({ extraction: { inputKinds: ["listing"] }, usage: { promptTokens: 10, outputTokens: 20 } });
  });
  it("retries a 5xx at the same level", async () => {
    const { f, result } = run([503]);
    await result;
    expect(f.bodies.map((b) => b.response_format?.type)).toEqual(["json_schema", "json_schema"]);
  });
  it("steps down on a 400 (e.g. no JSON-schema support)", async () => {
    const { f, result } = run([400]);
    await result;
    expect(f.bodies.map((b) => b.response_format?.type ?? "none")).toEqual(["json_schema", "json_object"]);
  });
  it("does not retry a 429", async () => {
    const { f, result } = run([429]);
    await expect(result).rejects.toMatchObject({ code: "model_busy" });
    expect(f.bodies).toHaveLength(1);
  });
});
