import { createHmac, timingSafeEqual } from "node:crypto";
import type { Firestore } from "@google-cloud/firestore";
import { HASH_RE, normalizeAddress, sha256Hex } from "@/lib/community";

// Anonymous community flag counter in Firestore. Each document id is HMAC-SHA256(COMMUNITY_SALT,
// sha256(normalized address or contact)); fields are only { count, firstSeen }. No raw text,
// images or IPs. Off unless COMMUNITY_SALT is set; any Firestore error or timeout is skipped silently.

const COLLECTION = "community_flags";
const TIMEOUT_MS = 2500;

let db: Firestore | null | undefined;

export const communityEnabled = () => Boolean(process.env.COMMUNITY_SALT?.trim());

async function getDb(): Promise<Firestore | null> {
  if (db !== undefined) return db;
  if (!communityEnabled()) return (db = null);
  try {
    const { Firestore } = await import("@google-cloud/firestore");
    // Application Default Credentials: the Cloud Run service account in production.
    db = new Firestore({ databaseId: process.env.FIRESTORE_DATABASE_ID || undefined, ignoreUndefinedProperties: true });
  } catch {
    db = null;
  }
  return db;
}

function withTimeout<T>(p: Promise<T>): Promise<T | null> {
  return Promise.race([p.catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), TIMEOUT_MS))]);
}

export interface CommunityKey {
  id: string;
  kind: "address" | "contact";
}

/** Turn the listing's address and the browser-hashed contacts into keyed document ids. */
export async function communityKeys(address: string | null, zip: string | null, contactHashes: string[]): Promise<CommunityKey[]> {
  const salt = process.env.COMMUNITY_SALT?.trim();
  if (!salt) return [];
  const keyed = (h: string) => createHmac("sha256", salt).update(h).digest("hex");
  const keys: CommunityKey[] = [];
  const addr = normalizeAddress(address, zip);
  if (addr) keys.push({ id: keyed(await sha256Hex(addr)), kind: "address" });
  for (const h of contactHashes.filter((x) => HASH_RE.test(x)).slice(0, 5)) keys.push({ id: keyed(h), kind: "contact" });
  return keys;
}

export interface CommunityCounts {
  address: number;
  contact: number;
  firstSeen: string | null;
}

export async function readCounts(keys: CommunityKey[]): Promise<CommunityCounts | null> {
  const store = await getDb();
  if (!store || keys.length === 0) return null;
  const snaps = await withTimeout(store.getAll(...keys.map((k) => store.collection(COLLECTION).doc(k.id))));
  if (!snaps) return null;
  const out: CommunityCounts = { address: 0, contact: 0, firstSeen: null };
  snaps.forEach((s, i) => {
    if (!s.exists) return;
    const count = Number(s.get("count")) || 0;
    const kind = keys[i].kind;
    out[kind] = Math.max(out[kind], count);
    const first = s.get("firstSeen") as string | undefined;
    if (first && (!out.firstSeen || first < out.firstSeen)) out.firstSeen = first;
  });
  return out;
}

/** Add one anonymous flag to each key. Returns false when the counter is off or Firestore didn't answer. */
export async function addFlag(ids: string[]): Promise<boolean> {
  const store = await getDb();
  if (!store) return false;
  const valid = ids.filter((id) => HASH_RE.test(id)).slice(0, 6);
  if (!valid.length) return false;
  const today = new Date().toISOString().slice(0, 10);
  const done = await withTimeout(
    store.runTransaction(async (tx) => {
      const refs = valid.map((id) => store.collection(COLLECTION).doc(id));
      const snaps = await tx.getAll(...refs);
      snaps.forEach((s, i) => {
        if (s.exists) tx.update(refs[i], { count: (Number(s.get("count")) || 0) + 1 });
        else tx.set(refs[i], { count: 1, firstSeen: today });
      });
      return true;
    }),
  );
  return done === true;
}

const TOKEN_TTL_MS = 30 * 60 * 1000;

/** Short-lived proof that these ids came from a real /api/check response (stops arbitrary-id flagging). */
export function signIds(ids: string[], now = Date.now()): string {
  const salt = process.env.COMMUNITY_SALT?.trim() ?? "";
  const mac = createHmac("sha256", salt).update(`${[...ids].sort().join(",")}|${now}`).digest("hex");
  return `${now}.${mac}`;
}

export function verifyIds(ids: string[], token: string, now = Date.now()): boolean {
  const [ts, mac] = token.split(".");
  const issued = Number(ts);
  if (!Number.isFinite(issued) || now - issued > TOKEN_TTL_MS || issued > now + 60_000 || !mac) return false;
  const expected = signIds(ids, issued).split(".")[1];
  return expected.length === mac.length && timingSafeEqual(Buffer.from(expected), Buffer.from(mac));
}
