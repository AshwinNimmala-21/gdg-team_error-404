// In-memory sliding window per client key. Good enough for one Cloud Run instance; it resets on
// restart and isn't shared across instances, which is fine for a cost guard on a free tool.

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

/** Cloud Run puts the client IP first in X-Forwarded-For. Used only as an in-memory key, never stored. */
export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}
