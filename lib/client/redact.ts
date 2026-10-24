// Runs in the browser before anything is sent. Removes contact details and ID/account numbers
// from pasted text. Scam signals survive ("text me at [phone removed]" still reads as off-platform).

const PATTERNS: { kind: "email" | "phone" | "ssn" | "number"; re: RegExp; label: string }[] = [
  { kind: "email", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, label: "[email removed]" },
  { kind: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g, label: "[number removed]" },
  { kind: "phone", re: /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\b\d{3})[\s.-]?\d{3}[\s.-]\d{4}\b/g, label: "[phone removed]" },
  { kind: "number", re: /\b\d(?:[ -]?\d){9,18}\b/g, label: "[number removed]" },
];

export interface Redaction {
  text: string;
  removed: number;
  contacts: string[];
}

export function redact(input: string): Redaction {
  let text = input;
  let removed = 0;
  const contacts: string[] = [];
  for (const p of PATTERNS) {
    text = text.replace(p.re, (m) => {
      removed++;
      if (p.kind === "email" || p.kind === "phone") contacts.push(m);
      return p.label;
    });
  }
  return { text, removed, contacts };
}
