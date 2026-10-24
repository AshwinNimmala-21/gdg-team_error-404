// Runs the lease photo N times and prints latency, tokens and clause results. Usage: node scripts/dev/bench-lease.mjs [n]
import { readFileSync } from "node:fs";
const n = Number(process.argv[2] ?? 2);
const body = { text: "", image: { mimeType: "image/jpeg", data: readFileSync("public/samples/lease-page.jpg").toString("base64") } };
for (let i = 0; i < n; i++) {
  const t = Date.now();
  const j = await (await fetch("http://localhost:3000/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
  if (j.error) { console.log("error", j.error); continue; }
  const sev = j.lease.findings.filter((f) => f.evidence[0].counted).map((f) => `${f.type}:${f.severity}`).sort().join(",");
  console.log(`${j.meta.model} run${i + 1}: ${Date.now() - t}ms in=${j.meta.usage?.promptTokens} out=${j.meta.usage?.outputTokens} status=${j.lease.status} clauses=${j.lease.findings.length} counted=[${sev}] read=${JSON.stringify([j.read.rent, j.read.bedrooms, j.read.zip])}`);
}
