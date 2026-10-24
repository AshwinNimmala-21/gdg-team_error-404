import { CheckFailure, MAX_IMAGE_BYTES, MAX_TEXT, runCheck } from "@/lib/server/check";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import type { CheckError } from "@/lib/types";

// Base64 image + text + JSON overhead.
const MAX_BODY_BYTES = Math.ceil(MAX_IMAGE_BYTES * 1.37) + MAX_TEXT * 4 + 64 * 1024;

const fail = (code: CheckError["error"]["code"], message: string, status: number, headers: HeadersInit = {}) =>
  Response.json({ error: { code, message } } satisfies CheckError, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers));
  if (!limit.ok)
    return fail("rate_limited", `You've run 10 checks in a minute. Try again in ${limit.retryAfterS} seconds.`, 429, {
      "Retry-After": String(limit.retryAfterS),
    });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return fail("too_large", "That upload is too large. Try a screenshot or a smaller photo.", 413);

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return fail("too_large", "That upload is too large. Try a screenshot or a smaller photo.", 413);
    body = JSON.parse(raw);
  } catch {
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
