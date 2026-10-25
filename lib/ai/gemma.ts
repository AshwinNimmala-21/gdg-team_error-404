import {
  ApiError,
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type Part,
} from "@google/genai";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { EXTRACTION_JSON_SCHEMA, ExtractionSchema, type Extraction } from "./schema";

export const DEFAULT_MODEL = "gemma-4-26b-a4b-it";
export const modelId = () => process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL;

// Each attempt gets its own timeout (a lease photo takes ~34 s, text ~12 s). The overall deadline
// keeps a request with retries under Cloud Run's --timeout 120 (docs/DEPLOY.md).
export const ATTEMPT_MS = { text: 30_000, image: 55_000 };
const DEADLINE_MS = 110_000;
// Transient failures (5xx, network, timeout) are retried up to twice with jittered backoff.
const MAX_RETRIES = 2;
const BACKOFF_MS = 800;

export class ExtractionError extends Error {
  constructor(
    public code: "model_busy" | "model_failed" | "invalid_output",
    message: string,
  ) {
    super(message);
  }
}

// Gemma's JSON-schema support on the Gemini API isn't documented (docs/research/help-links.md), so we
// try the strictest request first and step down on a 400 or unparseable output. Every request starts
// at level 0: one flaky 400 must never downgrade later requests.
export type Level = 0 | 1 | 2;

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
  sleep?: (ms: number) => Promise<void>;
  log?: (msg: string) => void;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// One extraction: step down levels on 400 / invalid output, retry transient failures at the same level.
export async function generateWithRetries(generate: Generate, opts: RetryOptions): Promise<Omit<GemmaResult, "model">> {
  const deadline = Date.now() + (opts.deadlineMs ?? DEADLINE_MS);
  const sleep = opts.sleep ?? wait;
  const log = opts.log ?? (() => {});
  let level: Level = 0;
  let retries = 0;

  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) throw new ExtractionError("model_failed", "Gemma took too long to answer.");
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
        if (err.status === 429) throw new ExtractionError("model_busy", "Gemma is busy right now.");
        if (err.status === 400 && level < 2) {
          level = (level + 1) as Level; // step down: drop schema / thinking config
          continue;
        }
        if (err.status < 500) throw new ExtractionError("model_failed", `Gemma request failed (${err.status}).`);
        transient = `Gemma request failed (${err.status}).`;
      } else if (err instanceof ExtractionError) {
        if (err.code === "invalid_output") log(`level=${level} invalid_output retry=${retries}`);
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
    if (retries >= MAX_RETRIES) throw new ExtractionError("model_failed", transient);
    retries++;
    await sleep(BACKOFF_MS * 2 ** (retries - 1) * (0.75 + Math.random() * 0.5));
  }
}

export async function extractWithGemma(input: {
  text: string;
  image?: { mimeType: string; data: string };
  lang?: "en" | "es";
}): Promise<GemmaResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new ExtractionError("model_failed", "No Gemini API key is configured.");
  const ai = new GoogleGenAI({ apiKey });
  const model = modelId();

  const generate: Generate = (level, signal) => {
    const prompt = buildUserPrompt(input.text, Boolean(input.image), input.lang) + (level === 0 ? "" : SCHEMA_IN_PROMPT);
    const parts: Part[] = [];
    if (input.image) parts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.data } });
    parts.push({ text: prompt });
    return ai.models.generateContent({ model, contents: [{ role: "user", parts }], config: configFor(level, signal) });
  };
  const r = await generateWithRetries(generate, {
    attemptMs: input.image ? ATTEMPT_MS.image : ATTEMPT_MS.text,
    log: (msg) => console.error(`gemma error: model=${model} ${msg}`),
  });
  return { ...r, model };
}
