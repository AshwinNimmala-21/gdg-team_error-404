import { z } from "zod";
import { HASH_RE } from "@/lib/community";
import { addFlag, communityEnabled } from "@/lib/server/community";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

const Body = z.object({ ids: z.array(z.string().regex(HASH_RE)).min(1).max(6) });

/** Adds one anonymous "I think this is a scam" flag to the given fingerprints. */
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!communityEnabled()) return Response.json({ ok: false, reason: "off" }, { status: 503, headers });
  if (!rateLimit(`flag:${clientKey(request.headers)}`, 5).ok) return Response.json({ ok: false, reason: "rate_limited" }, { status: 429, headers });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, reason: "bad_input" }, { status: 400, headers });
  const ok = await addFlag(parsed.data.ids);
  return Response.json({ ok }, { status: ok ? 200 : 503, headers });
}
