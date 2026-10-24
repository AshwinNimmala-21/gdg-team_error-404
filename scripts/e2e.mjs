// API end-to-end check of the 4 demo samples against a running server.
// Usage: node scripts/e2e.mjs [baseUrl]   (exit code 1 on any mismatch)
import { readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
// Same contact redaction the browser applies before sending (lib/client/redact.ts).
const redact = (t) =>
  t
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]")
    .replace(/(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\b\d{3})[\s.-]?\d{3}[\s.-]\d{4}\b/g, "[phone removed]");

const cases = [
  { id: "fine-arlington", file: "fine-arlington.txt", price: ["typical"], scam: "none_found", lease: "not_provided" },
  { id: "scam-facebook", file: "scam-facebook.txt", price: ["below"], scam: "likely", lease: "not_provided", flags: 7 },
  { id: "lease-photo", image: "lease-page.jpg", price: ["typical"], scam: "none_found", lease: "fix" },
  { id: "injection", file: "injection.txt", price: ["below"], scam: "likely", lease: "not_provided", ai: true },
];

let failed = 0;
for (const c of cases) {
  const body = { text: c.file ? redact(readFileSync(`public/samples/${c.file}`, "utf8")) : "", sampleId: c.id };
  if (c.image) body.image = { mimeType: "image/jpeg", data: readFileSync(`public/samples/${c.image}`).toString("base64") };
  const res = await fetch(`${base}/api/check`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await res.json();
  const problems = [];
  if (!res.ok) problems.push(`HTTP ${res.status} ${j?.error?.code}`);
  else {
    if (!c.price.includes(j.price.status)) problems.push(`price ${j.price.status}`);
    if (j.scam.status !== c.scam) problems.push(`scam ${j.scam.status}`);
    if (j.lease.status !== c.lease) problems.push(`lease ${j.lease.status}`);
    if (c.flags && j.scam.flagged !== c.flags) problems.push(`flags ${j.scam.flagged}`);
    if (c.ai && !j.aiInstructions.detected) problems.push("injection not detected");
  }
  failed += problems.length ? 1 : 0;
  console.log(`${problems.length ? "FAIL" : "PASS"} ${c.id}: ${res.ok ? `${j.meta.mode}, ${j.price.headline} | ${j.scam.headline} | ${j.lease.headline}` : ""} ${problems.join(", ")}`);
}
process.exit(failed ? 1 : 0);
