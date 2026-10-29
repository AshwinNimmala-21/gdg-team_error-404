import {
  ApiError,
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type Part,
} from "@google/genai";
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL, ollamaGenerate } from "./ollama";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { EXTRACTION_JSON_SCHEMA, ExtractionSchema, type Extraction } from "./schema";

export const DEFAULT_MODEL = "gemma-4-26b-a4b-it";

/** GEMMA_PROVIDER=ollama runs Gemma 4 on your own machine (Ollama); anything else uses the Gemini API, the default. */
export type Provider = "gemini" | "ollama";
export const providerFromEnv = (): Provider => (process.env.GEMMA_PROVIDER?.trim().toLowerCase() === "ollama" ? "ollama" : "gemini");
export const modelId = () => process.env.GEMMA_MODEL?.trim() || (providerFromEnv() === "ollama" ? DEFAULT_OLLAMA_MODEL : DEFAULT_MODEL);

// Each attempt gets its own timeout (a lease photo takes ~34 s, text ~12 s). The overall deadline
// keeps a request with retries under Cloud Run's --timeout 120 (docs/DEPLOY.md).
export const ATTEMPT_MS = { text: 30_000, image: 55_000 };
const DEADLINE_MS = 110_000;
// Transient failures (5xx, network, timeout) are retried up to four times with jittered backoff (0.8, 1.6, 3.2, 6.4 s).
// Measured Oct 29: the hosted API's 500s often come back to back in about 1 s each, so two retries could be spent in
// 3 seconds with 100 s of the deadline left. The deadline still caps the total.
const MAX_RETRIES = 4;
const BACKOFF_MS = 800;
// One wait-and-retry on a 429 (per-minute quota), then "busy". Doesn't count against MAX_RETRIES.
const BUSY_WAIT_MS = 4_000;

export class ExtractionError extends Error {
  constructor(
    public code: "model_busy" | "model_failed" | "invalid_output",
    message: string,
  ) {
    super(message);
  }
}

// Three request levels, strictest first; we step down on a 400 or unparseable output, never sticky across requests.
// 0: API-enforced JSON schema. 1: JSON mode with the schema in the prompt. 2: plain text with the schema in the prompt.
// Every level's answer goes through the same Zod schema and quote checks.
export type Level = 0 | 1 | 2;

// Measured Oct 24–25: the Gemini API rejected level 0 for gemma-4-26b-a4b-it with HTTP 400 on 46 of 46 calls, with or
// without the thinking setting, so every check paid for a failed call first. The hosted path therefore starts at
// level 1 (which produced every successful answer). Ollama accepts level 0, so the self-hosted path starts there.
export const GEMINI_START_LEVEL: Level = 1;

function configFor(level: Level, signal: AbortSignal): GenerateContentConfig {
  const base: GenerateContentConfig = {
    systemInstruction: SYSTEM_PROMPT,
    temperature: 0,
    maxOutputTokens: 8192,
    abortSignal: signal,
  };
  if (level === 0)
    return {
      ...base,
      responseMimeType: "application/json",
      responseJsonSchema: EXTRACTION_JSON_SCHEMA,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    };
  if (level === 1) return { ...base, responseMimeType: "application/json" };
  return base;
}

const SCHEMA_IN_PROMPT = `\n\nReturn a JSON object that matches this JSON Schema exactly:\n${JSON.stringify(EXTRACTION_JSON_SCHEMA)}`;

export function parseModelJson(raw: string): Extraction {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new ExtractionError("invalid_output", "The model didn't return JSON.");
  let json: unknown;
  try {
    json = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    throw new ExtractionError("invalid_output", "The model returned malformed JSON.");
  }
  const parsed = ExtractionSchema.safeParse(json);
  if (!parsed.success) throw new ExtractionError("invalid_output", "The model's answer didn't match the expected format.");
  return parsed.data;
}

export interface GemmaResult {
  extraction: Extraction;
  usage: { promptTokens: number; outputTokens: number } | null;
  model: string;
}

export type Generate = (level: Level, signal: AbortSignal) => Promise<Pick<GenerateContentResponse, "text" | "usageMetadata">>;

export interface RetryOptions {
  attemptMs: number;
  deadlineMs?: number;
  /** The first level to try (default 0). */
  startLevel?: Level;
  sleep?: (ms: number) => Promise<void>;
  log?: (msg: string) => void;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// One extraction: step down levels on 400 / invalid output, retry transient failures at the same level.
export async function generateWithRetries(generate: Generate, opts: RetryOptions): Promise<Omit<GemmaResult, "model">> {
  const deadline = Date.now() + (opts.deadlineMs ?? DEADLINE_MS);
  const sleep = opts.sleep ?? wait;
  const log = opts.log ?? (() => {});
  let level: Level = opts.startLevel ?? 0;
  let retries = 0;
  let busyRetried = false;
  // Once the model has answered with something unusable, a later failure means "couldn't read", not "couldn't reach".
  let sawInvalid = false;
  const failed = (message: string) =>
    sawInvalid ? new ExtractionError("invalid_output", "The model's answer wasn't usable.") : new ExtractionError("model_failed", message);

  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) throw failed("Gemma took too long to answer.");
    const signal = AbortSignal.timeout(Math.min(opts.attemptMs, remaining));
    let transient: string;
    try {
      const res = await generate(level, signal);
      const extraction = parseModelJson(res.text ?? "");
      const u = res.usageMetadata;
      return {
        extraction,
        usage: u ? { promptTokens: u.promptTokenCount ?? 0, outputTokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0) } : null,
      };
    } catch (err) {
      if (signal.aborted) {
        log(`level=${level} timeout retry=${retries}`);
        transient = "Gemma took too long to answer.";
      } else if (err instanceof ApiError) {
        // Status code only: never the prompt or the response.
        log(`level=${level} status=${err.status} retry=${retries}`);
        if (err.status === 429) {
          // Rate limited (a free-tier key is shared by everyone using the site): wait once, then give up.
          if (busyRetried || deadline - Date.now() < BUSY_WAIT_MS + 5_000) throw new ExtractionError("model_busy", "Gemma is busy right now.");
          busyRetried = true;
          await sleep(BUSY_WAIT_MS);
          continue;
        }
        if (err.status === 400 && level < 2) {
          level = (level + 1) as Level; // step down: drop schema / thinking config
          continue;
        }
        if (err.status < 500) throw failed(`Gemma request failed (${err.status}).`);
        transient = `Gemma request failed (${err.status}).`;
      } else if (err instanceof ExtractionError) {
        if (err.code === "invalid_output") {
          log(`level=${level} invalid_output retry=${retries}`);
          sawInvalid = true;
        }
        if (err.code === "invalid_output" && level < 2) {
          level = (level + 1) as Level;
          continue;
        }
        throw err;
      } else {
        log(`level=${level} network retry=${retries}`);
        transient = "Couldn't reach Gemma.";
      }
    }
    if (retries >= MAX_RETRIES) throw failed(transient);
    retries++;
    await sleep(BACKOFF_MS * 2 ** (retries - 1) * (0.75 + Math.random() * 0.5));
  }
}

export async function extractWithGemma(input: {
  text: string;
  image?: { mimeType: string; data: string };
  lang?: "en" | "es";
}): Promise<GemmaResult> {
  const model = modelId();
  const log = (msg: string) => console.error(`gemma error: model=${model} ${msg}`);
  const promptFor = (level: Level) => buildUserPrompt(input.text, Boolean(input.image), input.lang) + (level === 0 ? "" : SCHEMA_IN_PROMPT);

  if (providerFromEnv() === "ollama") {
    // Self-hosted: no API key, and a local machine is slower than the hosted API, so attempts get more time.
    const generate = ollamaGenerate({
      baseUrl: process.env.GEMMA_BASE_URL?.trim() || DEFAULT_OLLAMA_URL,
      model,
      input: { system: SYSTEM_PROMPT, prompt: promptFor, image: input.image },
    });
    const r = await generateWithRetries(generate, { attemptMs: input.image ? 240_000 : 120_000, deadlineMs: 300_000, log });
    return { ...r, model };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new ExtractionError("model_failed", "No Gemini API key is configured.");
  const ai = new GoogleGenAI({ apiKey });

  const generate: Generate = (level, signal) => {
    const parts: Part[] = [];
    if (input.image) parts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.data } });
    parts.push({ text: promptFor(level) });
    return ai.models.generateContent({ model, contents: [{ role: "user", parts }], config: configFor(level, signal) });
  };
  const r = await generateWithRetries(generate, { attemptMs: input.image ? ATTEMPT_MS.image : ATTEMPT_MS.text, log, startLevel: GEMINI_START_LEVEL });
  return { ...r, model };
}
