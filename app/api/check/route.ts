import { CheckFailure, MAX_IMAGE_BYTES, MAX_TEXT, runCheck } from "@/lib/server/check";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import type { CheckError } from "@/lib/types";

// Base64 image + text + JSON overhead.
const MAX_BODY_BYTES = Math.ceil(MAX_IMAGE_BYTES * 1.37) + MAX_TEXT * 4 + 64 * 1024;

const fail = (code: CheckError["error"]["code"], message: string, status: number, headers: HeadersInit = {}) =>
  Response.json({ error: { code, message } } satisfies CheckError, { status, headers: { "Cache-Control": "no-store", ...headers } });

class TooLarge extends Error {}

/** Reads the body as a stream and stops as soon as it passes the cap, so a huge upload is never buffered. */
async function readLimited(request: Request, max: number): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new TooLarge();
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers), Number(process.env.RATE_LIMIT_PER_MIN) || 10);
  if (!limit.ok)
    return fail("rate_limited", `Too many checks in a minute. Try again in ${limit.retryAfterS} seconds.`, 429, {
      "Retry-After": String(limit.retryAfterS),
    });

  const tooLarge = () => fail("too_large", "That upload is too large. Try a screenshot or a smaller photo.", 413);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return tooLarge();

  let body: unknown;
  try {
    body = JSON.parse(await readLimited(request, MAX_BODY_BYTES));
  } catch (err) {
    if (err instanceof TooLarge) return tooLarge();
    return fail("bad_input", "Something in the request wasn't valid. Reload the page and try again.", 400);
  }

  try {
    const result = await runCheck(body);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof CheckFailure) return fail(err.code, err.message, err.status);
    // Never log the request body or the model output: they contain the user's text.
    console.error("check failed:", err instanceof Error ? err.name : "unknown error");
    return fail("model_failed", "Something went wrong on our side. Try again in a moment.", 500);
  }
}
