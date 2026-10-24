// Fingerprints for the anonymous community flag counter. Shared by browser and server.
// We never store addresses or contacts, only keyed hashes of these normalized forms.

const STREET_WORDS: Record<string, string> = {
  street: "st",
  avenue: "ave",
  road: "rd",
  boulevard: "blvd",
  drive: "dr",
  lane: "ln",
  court: "ct",
  place: "pl",
  terrace: "ter",
  parkway: "pkwy",
  highway: "hwy",
  north: "n",
  south: "s",
  east: "e",
  west: "w",
  northeast: "ne",
  northwest: "nw",
  southeast: "se",
  southwest: "sw",
};

/** "123 Sample Street, Apt 4B, Arlington, VA 22201" → "123 sample st|22201". Null if there's no street number + ZIP. */
export function normalizeAddress(address: string | null, zip: string | null): string | null {
  if (!address || !zip) return null;
  const street = address
    .toLowerCase()
    .split(",")[0]
    .replace(/(?:\b(?:apt|apartment|unit|suite|ste)\b\.?|#)\s*[\w-]+/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => STREET_WORDS[w] ?? w)
    .join(" ");
  return /^\d+[a-z]? [a-z0-9]/.test(street) ? `${street}|${zip}` : null;
}

/** Emails lowercased; phone numbers reduced to their last 10 digits. */
export function normalizeContact(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (s.includes("@")) return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(s) ? `email:${s}` : null;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 10 ? `phone:${digits.slice(-10)}` : null;
}

export const HASH_RE = /^[a-f0-9]{64}$/;

/** SHA-256 hex in the browser (Web Crypto) or Node 20+ (global crypto.subtle). */
export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
