// Prints live details per sample: latency, tokens, flags, clause severities.
import { readFileSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const redact = (t) => t.replace(/(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\b\d{3})[\s.-]?\d{3}[\s.-]\d{4}\b/g, "[phone removed]");
for (const [id, file, img] of [["scam-facebook", "scam-facebook.txt"], ["lease-photo", null, "lease-page.jpg"], ["injection", "injection.txt"]]) {
  const body = { text: file ? redact(readFileSync(`public/samples/${file}`, "utf8")) : "" };
  if (img) body.image = { mimeType: "image/jpeg", data: readFileSync(`public/samples/${img}`).toString("base64") };
  const j = await (await fetch(`${base}/api/check`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
  if (j.error) { console.log(id, j.error); continue; }
  console.log(`${id}: ${j.meta.model} ${j.meta.latencyMs}ms tokens=${JSON.stringify(j.meta.usage)} imageRead=${j.meta.imageRead}`);
  console.log(`  flags=${j.scam.flags.map((f) => f.id).join(",")} dropped=${j.scam.dropped.length} ai=${j.aiInstructions.detected}`);
  console.log(`  lease=${j.lease.status} ${j.lease.findings.map((f) => `${f.type}:${f.severity}${f.evidence[0].counted ? "" : "(uncounted)"}`).join(", ")}`);
  console.log(`  notes=${JSON.stringify(j.meta.notes)}`);
}
