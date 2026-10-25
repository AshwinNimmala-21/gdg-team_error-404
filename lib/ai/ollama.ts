// Self-hosted Gemma 4 through Ollama's OpenAI-compatible endpoint (GEMMA_PROVIDER=ollama).
// Same prompt, schema, quote verification and rules as the hosted path; only the transport differs.
// HTTP errors become @google/genai ApiErrors, so generateWithRetries treats them exactly like the Gemini API's.
import { ApiError } from "@google/genai";
import type { Generate, Level } from "./gemma";
import { EXTRACTION_JSON_SCHEMA } from "./schema";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434/v1";
export const DEFAULT_OLLAMA_MODEL = "gemma4:26b";

export interface OllamaInput {
  system: string;
  /** The user prompt for this level (level 1+ includes the schema as text). */
  prompt: (level: Level) => string;
  image?: { mimeType: string; data: string };
}

type Content = string | ({ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } })[];
export interface OllamaRequest {
  model: string;
  temperature: number;
  max_tokens: number;
  stream: false;
  messages: { role: "system" | "user"; content: Content }[];
  response_format?: { type: "json_schema"; json_schema: { name: string; schema: unknown } } | { type: "json_object" };
  /** "none" turns Gemma 4's thinking off (like the hosted path's minimal thinking at level 0); much faster locally. */
  reasoning_effort?: "none";
}

/** The chat-completions request for one attempt. Level 0 asks for the JSON schema, level 1 for any JSON, level 2 for text. */
export function ollamaRequest(model: string, level: Level, input: OllamaInput): OllamaRequest {
  const text = { type: "text" as const, text: input.prompt(level) };
  const content = input.image
    ? [{ type: "image_url" as const, image_url: { url: `data:${input.image.mimeType};base64,${input.image.data}` } }, text]
    : [text];
  return {
    model,
    temperature: 0,
    max_tokens: 8192,
    stream: false,
    messages: [
      { role: "system", content: input.system },
      { role: "user", content },
    ],
    ...(level === 0
      ? { response_format: { type: "json_schema", json_schema: { name: "extraction", schema: EXTRACTION_JSON_SCHEMA } }, reasoning_effort: "none" as const }
      : level === 1
        ? { response_format: { type: "json_object" } }
        : {}),
  };
}

export function ollamaGenerate(opts: { baseUrl: string; model: string; input: OllamaInput; fetchImpl?: typeof fetch }): Generate {
  const doFetch = opts.fetchImpl ?? fetch;
  const url = `${opts.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  return async (level, signal) => {
    const res = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(ollamaRequest(opts.model, level, opts.input)),
      signal,
    });
    if (!res.ok) throw new ApiError({ message: `Ollama request failed (${res.status})`, status: res.status });
    const j = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: j.choices?.[0]?.message?.content ?? "",
      usageMetadata: j.usage ? { promptTokenCount: j.usage.prompt_tokens, candidatesTokenCount: j.usage.completion_tokens } : undefined,
    };
  };
}
