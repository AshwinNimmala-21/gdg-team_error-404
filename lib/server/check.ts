import { z } from "zod";
import { ExtractionError, extractWithGemma, modelId, providerFromEnv } from "@/lib/ai/gemma";
import { keywordExtract } from "@/lib/ai/mock";
import { sampleExtraction } from "@/lib/ai/mock-es";
import { ExtractionSchema, type Extraction } from "@/lib/ai/schema";
import { resolveBenchmarks } from "@/lib/data/benchmarks";
import { resolveFacts, runRules } from "@/lib/rules/check";
import { findQuote, makeCorpus } from "@/lib/rules/quotes";
import { HASH_RE } from "@/lib/community";
import { communityKeys, readCounts, signIds } from "./community";
import { SAMPLE_IDS, type CheckErrorCode, type CheckResult, type SampleId } from "@/lib/types";

export const MAX_TEXT = 12_000;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const zip = z.string().regex(/^\d{5}$/);

export const CheckRequestSchema = z.object({
  text: z.string().max(MAX_TEXT).optional(),
  image: z
    .object({
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      data: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/),
    })
    .optional(),
  zip: zip.optional().or(z.literal("")),
  overrides: z
    .object({
      rent: z.number().positive().max(100_000).optional(),
      bedrooms: z.number().int().min(0).max(10).optional(),
      zip: zip.optional(),
    })
    .optional(),
  extraction: z.unknown().optional(),
  sampleId: z.enum(SAMPLE_IDS).optional(),
  contactHashes: z.array(z.string().regex(HASH_RE)).max(5).optional(),
  lang: z.enum(["en", "es"]).optional(),
  fallback: z.literal("keywords").optional(),
});

export class CheckFailure extends Error {
  constructor(
    public code: CheckErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Demo mode: asked for, or the hosted path has no key. A self-hosted model (GEMMA_PROVIDER=ollama) needs no key.
export const isMockMode = () =>
  process.env.MOCK_AI === "1" || (providerFromEnv() === "gemini" && !process.env.GEMINI_API_KEY?.trim());

/** True only when the request is still the built-in sample: every quote in its saved answer is in the text. */
export function isUnchangedSample(id: SampleId, text: string, hasImage: boolean, lang?: "en" | "es"): boolean {
  if (id === "lease-photo") return hasImage && !text.trim();
  if (hasImage) return false;
  const saved = sampleExtraction(id, lang);
  const quotes = [...Object.values(saved.listing), ...Object.values(saved.signals), saved.aiInstructions]
    .map((f) => f.quote)
    .filter((q): q is string => Boolean(q));
  const corpus = makeCorpus(text, null);
  return quotes.length > 0 && quotes.every((q) => findQuote(q, corpus) === "text");
}

export function modelFailure(err: unknown, input: { hasText: boolean }): CheckFailure {
  if (err instanceof ExtractionError) {
    if (err.code === "model_busy") return new CheckFailure("model_busy", "Gemma is busy right now. Wait a few seconds and try again.", 503);
    // The model answered, but not with anything we can check: say that, not "couldn't reach".
    if (err.code === "invalid_output")
      return new CheckFailure(
        "invalid_output",
        input.hasText ? "We couldn't read this text. Try pasting the listing itself." : "We couldn't read this photo. Try a clearer photo, or paste the text instead.",
        502,
      );
  }
  return new CheckFailure("model_failed", "We couldn't reach the AI model. Try again, or try one of the samples.", 502);
}

export async function runCheck(body: unknown): Promise<CheckResult> {
  const started = Date.now();
  const parsed = CheckRequestSchema.safeParse(body);
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some((i) => i.code === "too_big");
    throw tooLong
      ? new CheckFailure("too_large", `Text is limited to ${MAX_TEXT.toLocaleString()} characters. Paste the most important part.`, 413)
      : new CheckFailure("bad_input", "Something in the request wasn't valid. Reload the page and try again.", 400);
  }
  const req = parsed.data;
  const text = req.text ?? "";
  if (req.image && Math.floor((req.image.data.length * 3) / 4) > MAX_IMAGE_BYTES)
    throw new CheckFailure("too_large", "That image is over 8 MB. Try a screenshot or a smaller photo.", 413);
  if (!text.trim() && !req.image && !req.extraction)
    throw new CheckFailure("bad_input", "Paste a listing or add a photo first.", 400);

  const notes: string[] = [];
  let extraction: Extraction;
  let mode: CheckResult["meta"]["mode"];
  let usage: CheckResult["meta"]["usage"] = null;
  let imageRead = false;
  const mock = isMockMode();
  let model = mock ? "demo mode (no model call)" : modelId();
  let fallback: CheckResult["meta"]["fallback"];

  if (req.extraction !== undefined) {
    // Rescore: the user edited rent / bedrooms / ZIP. No model call. A keyword-fallback result stays one.
    const x = ExtractionSchema.safeParse(req.extraction);
    if (!x.success) throw new CheckFailure("bad_input", "Couldn't update the check. Run it again.", 400);
    extraction = x.data;
    mode = "rules-only";
    fallback = req.fallback;
  } else if (mock) {
    mode = "mock";
    if (req.sampleId) {
      extraction = sampleExtraction(req.sampleId, req.lang);
      imageRead = req.sampleId === "lease-photo";
    } else {
      extraction = keywordExtract(text);
      if (req.image) notes.push("Demo mode can't read photos. Paste the text, or run Clearlease with a Gemini API key.");
    }
  } else {
    try {
      const r = await extractWithGemma({ text, image: req.image, lang: req.lang });
      extraction = r.extraction;
      usage = r.usage;
      imageRead = Boolean(req.image);
      mode = "live";
    } catch (err) {
      // Retries are spent. A built-in sample gets its saved answer, labelled in the UI; user input never does.
      if (req.sampleId && isUnchangedSample(req.sampleId, text, Boolean(req.image), req.lang)) {
        extraction = sampleExtraction(req.sampleId, req.lang);
        imageRead = req.sampleId === "lease-photo";
        mode = "saved";
      } else if (text.trim()) {
        // Typed text still gets a check: the keyword extractor and the same rules, labelled as a keyword check (never as
        // Gemma's reading), with the scam verdict capped to what keywords can support. Keywords can't read a photo.
        console.error(`check: keyword fallback after ${err instanceof ExtractionError ? err.code : "unknown error"}`);
        extraction = keywordExtract(text);
        mode = "rules-only";
        fallback = "keywords";
        model = "keyword check (no model call)";
        if (req.image) notes.push("The quick keyword check can't read photos, so only your text was checked.");
      } else {
        throw modelFailure(err, { hasText: false });
      }
    }
  }

  const corpus = makeCorpus(text, extraction.imageTranscript);
  const facts = resolveFacts(extraction, corpus, req.overrides, req.zip || undefined);
  // Address fingerprints only from a fresh model read whose address text is itself in the input (never from a rescore).
  const addr = extraction.listing.address;
  const address = mode !== "rules-only" && findQuote(addr.quote, corpus) && findQuote(addr.value, corpus) ? addr.value : null;
  const keys = await communityKeys(address, facts.zip, req.contactHashes ?? []);
  const [benchmarks, counts] = await Promise.all([resolveBenchmarks(facts.zip, facts.bedrooms), readCounts(keys)]);
  const result = runRules({ extraction, text, facts, benchmarks, lang: req.lang, keywordOnly: fallback === "keywords" });
  const dataLive = Boolean(benchmarks.fmr?.live || benchmarks.census?.live);

  return {
    inputType: result.inputType,
    read: result.read,
    price: result.price,
    scam: result.scam,
    lease: result.lease,
    questions: result.questions,
    aiInstructions: result.aiInstructions,
    community: counts ? { ids: keys.map((k) => k.id), token: signIds(keys.map((k) => k.id)), ...counts } : null,
    help: result.help,
    meta: {
      model,
      mode,
      ...(fallback ? { fallback } : {}),
      dataLive,
      latencyMs: Date.now() - started,
      usage,
      imageRead,
      notes: [...notes, ...result.notes],
    },
    extraction,
  };
}
