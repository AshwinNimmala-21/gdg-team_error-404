import { normalize } from "@/lib/rules/quotes";

// Find each quote inside the original text so the UI can mark it. Matching uses the same
// normalization as the grounding check (lib/rules/quotes.ts), with an index map back to the original.

const ALLOWED = /[\p{L}\p{N}$%@.'"\-/]/u;

function normalizeWithMap(src: string): { norm: string; map: number[] } {
  let norm = "";
  const map: number[] = [];
  let lastSpace = true;
  for (let i = 0; i < src.length; i++) {
    let c = src[i].toLowerCase();
    if (/[‘’‚‛′`]/.test(c)) c = "'";
    else if (/[“”„‟″]/.test(c)) c = '"';
    else if (/[‐-―−]/.test(c)) c = "-";
    if (!ALLOWED.test(c)) {
      if (!lastSpace) {
        norm += " ";
        map.push(i);
        lastSpace = true;
      }
      continue;
    }
    norm += c;
    map.push(i);
    lastSpace = false;
  }
  return { norm, map };
}

/** Sorted, merged [start, end) ranges in `src` covering each quote (or each "..." piece of it). */
export function highlightRanges(src: string, quotes: string[]): [number, number][] {
  const { norm, map } = normalizeWithMap(src);
  const found: [number, number][] = [];
  for (const quote of quotes) {
    const pieces = normalize(quote)
      .replace(/^\.+|\.+$/g, "")
      .split("...")
      .map((p) => p.trim())
      .filter((p) => p.length >= 3);
    let from = 0;
    for (const p of pieces) {
      const i = norm.indexOf(p, from);
      if (i < 0) break;
      found.push([map[i], map[i + p.length - 1] + 1]);
      from = i + p.length;
    }
  }
  found.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of found) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}
