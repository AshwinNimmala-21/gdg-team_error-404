// In-memory sliding window per client key. Good enough for one Cloud Run instance; it resets on
// restart and isn't shared across instances. Cloud Run's max-instances setting (docs/DEPLOY.md)
// caps the worst case.

const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 10, now = Date.now()): { ok: boolean; retryAfterS: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterS: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return { ok: true, retryAfterS: 0 };
}

/**
 * Client key for rate limiting. Clients can put anything at the front of X-Forwarded-For, so we use
 * the rightmost entry, which Google's front end appends on Cloud Run. Used only in memory, never stored.
 */
export function clientKey(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  const last = xff
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .at(-1);
  return last || headers.get("x-real-ip") || "local";
}
