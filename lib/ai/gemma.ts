import { ApiError, GoogleGenAI, ThinkingLevel, type GenerateContentConfig, type Part } from "@google/genai";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { EXTRACTION_JSON_SCHEMA, ExtractionSchema, type Extraction } from "./schema";

export const DEFAULT_MODEL = "gemma-4-26b-a4b-it";
export const modelId = () => process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL;

const TIMEOUT_MS = 45_000;

export class ExtractionError extends Error {
  constructor(
    public code: "model_busy" | "model_failed" | "invalid_output",
    message: string,
  ) {
    super(message);
  }
}

// Gemma's JSON-schema support on the Gemini API isn't documented (docs/research/help-links.md), so we
// try the strictest request first and step down on a 400. The working level is remembered per process.
type Level = 0 | 1 | 2;
let workingLevel: Level = 0;

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

export async function extractWithGemma(input: {
  text: string;
  image?: { mimeType: string; data: string };
}): Promise<GemmaResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new ExtractionError("model_failed", "No Gemini API key is configured.");
  const ai = new GoogleGenAI({ apiKey });
  const model = modelId();
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  for (let level = workingLevel; level <= 2; level++) {
    const prompt = buildUserPrompt(input.text, Boolean(input.image)) + (level === 0 ? "" : SCHEMA_IN_PROMPT);
    const parts: Part[] = [];
    if (input.image) parts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.data } });
    parts.push({ text: prompt });
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: configFor(level as Level, signal),
      });
      const extraction = parseModelJson(res.text ?? "");
      workingLevel = level as Level;
      const u = res.usageMetadata;
      return {
        extraction,
        model,
        usage: u ? { promptTokens: u.promptTokenCount ?? 0, outputTokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0) } : null,
      };
    } catch (err) {
      if (err instanceof ApiError) {
        // Status code and model only: never the prompt or the response.
        console.error(`gemma error: model=${model} level=${level} status=${err.status}`);
        if (err.status === 429) throw new ExtractionError("model_busy", "Gemma is busy right now.");
        if (err.status === 400 && level < 2) continue; // step down: drop schema / thinking config
        throw new ExtractionError("model_failed", `Gemma request failed (${err.status}).`);
      }
      if (err instanceof ExtractionError) {
        if (level < 2 && err.code === "invalid_output") continue;
        throw err;
      }
      if (signal.aborted) throw new ExtractionError("model_failed", "Gemma took too long to answer.");
      throw new ExtractionError("model_failed", "Couldn't reach Gemma.");
    }
  }
  throw new ExtractionError("invalid_output", "The model's answer didn't match the expected format.");
}
