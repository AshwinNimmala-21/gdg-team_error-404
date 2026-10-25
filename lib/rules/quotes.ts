// Grounding check: a quote from the model only counts if it actually appears in what the user gave us.

export interface Corpus {
  text: string;
  image: string;
}

/** "depósito" → "deposito", "dueño" → "dueno": people often type Spanish without accents, and models add them back. */
export function foldAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}+/gu, "").normalize("NFC");
}

export function normalize(s: string): string {
  return foldAccents(s.toLowerCase().normalize("NFKC"))
    .replace(/[‘’‚‛′`]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\p{L}\p{N}$%@.'"\-/]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function makeCorpus(text: string | undefined, imageTranscript: string | null | undefined): Corpus {
  return { text: normalize(text ?? ""), image: normalize(imageTranscript ?? "") };
}

/**
 * Where the quote was found, or null. Models sometimes trim or add an ellipsis, so we also accept
 * a quote whose pieces (split on "...") each appear in order.
 */
export function findQuote(quote: string | null | undefined, corpus: Corpus): "text" | "image" | null {
  if (!quote) return null;
  const q = normalize(quote).replace(/^\.+|\.+$/g, "").trim();
  if (q.length < 3) return null;
  for (const where of ["text", "image"] as const) {
    const hay = corpus[where];
    if (!hay) continue;
    if (hay.includes(q)) return where;
    const parts = q.split("...").map((p) => p.trim()).filter((p) => p.length >= 3);
    if (parts.length > 1) {
      let from = 0;
      let ok = true;
      for (const p of parts) {
        const i = hay.indexOf(p, from);
        if (i < 0) {
          ok = false;
          break;
        }
        from = i + p.length;
      }
      if (ok) return where;
    }
  }
  return null;
}

/** True when the digits of `n` (e.g. 1650, "1,650", "$1.650") appear in the quote. */
export function numberInQuote(n: number | null, quote: string | null): boolean {
  if (n === null || !quote) return false;
  // Thousands separators: "1,650", "$1.650", "1.650$", and the no-break spaces some Spanish keyboards insert ("1 650").
  const digits = quote.replace(/(\d)[,.  ](?=\d{3}\b)/g, "$1");
  if (new RegExp(`(^|[^\\d])${String(n).replace(".", "\\.")}([^\\d]|$)`).test(digits)) return true;
  // Thousands shorthand: "$1.6k", "2k", "1,65k".
  for (const m of quote.matchAll(/(\d+(?:[.,]\d+)?)\s?k\b/gi)) {
    if (Math.round(parseFloat(m[1].replace(",", ".")) * 1000) === n) return true;
  }
  return false;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];
// Spanish listings: "una recámara", "dos recámaras", "estudio".
const NUMBER_WORDS_ES = ["cero", "una?|uno", "dos", "tres", "cuatro", "cinco", "seis"];

/** Bedrooms can be written "1BR", "one-bedroom", "studio", or in Spanish "una recámara" / "estudio". */
export function bedroomsInQuote(n: number | null, quote: string | null): boolean {
  if (n === null || !quote) return false;
  const q = quote.toLowerCase();
  if (n === 0 && /studio|efficiency|estudio/.test(q)) return true;
  return (
    numberInQuote(n, quote) ||
    (NUMBER_WORDS[n] !== undefined && new RegExp(`\\b${NUMBER_WORDS[n]}\\b`).test(q)) ||
    (NUMBER_WORDS_ES[n] !== undefined && new RegExp(`(^|[^\\p{L}])(${NUMBER_WORDS_ES[n]})(?![\\p{L}])`, "u").test(q))
  );
}
