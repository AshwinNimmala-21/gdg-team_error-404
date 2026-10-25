// Offline evaluation: Clearlease (/api/check) vs a keyword-only baseline on scripts/eval/dataset.jsonl.
// Usage: node scripts/eval/run.mjs <runName> [baseUrl] [--holdout]
//   Without --holdout, holdout items are still run, but their results go to a separate file and are not printed.
//   Local runs need a raised limit: RATE_LIMIT_PER_MIN=1000 npm run dev   (never set this on Cloud Run).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const showHoldout = args.includes("--holdout");
const [run = "adhoc", base = "http://localhost:3000"] = args.filter((a) => !a.startsWith("--"));
const items = readFileSync("scripts/eval/dataset.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Keyword-only baseline: flags a listing if any scam keyword appears. No model, no rules, no price data.
// Frozen after run "before"; never edit (see the file's note).
const { keywords: KEYWORDS } = JSON.parse(readFileSync("scripts/eval/baseline-keywords.json", "utf8"));
const keywordHits = (text) => KEYWORDS.filter((k) => text.toLowerCase().includes(k));

async function check(text) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const t0 = Date.now();
    const res = await fetch(`${base}/api/check`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, ms: Date.now() - t0, j };
    if (res.status === 429 || res.status >= 500) { await sleep(5000 * (attempt + 1)); continue; }
    return { ok: false, error: `${res.status} ${j?.error?.code}` };
  }
  return { ok: false, error: "gave up after 3 tries" };
}

const rows = [];
for (const it of items) {
  const r = await check(it.text);
  const row = { id: it.id, kind: it.kind, label: it.label, holdout: it.holdout, keywords: keywordHits(it.text) };
  if (!r.ok) row.error = r.error;
  else {
    const { j } = r;
    row.mode = j.meta.mode;
    row.ms = r.ms;
    row.price = j.price.status;
    row.priceWord = j.price.status === "below" ? (j.price.farBelow ? "far-below" : "below") : j.price.status;
    row.scam = j.scam.status;
    row.flags = j.scam.flags.map((f) => f.id);
    row.conflicts = j.lease.findings.filter((f) => f.severity === "conflict" && f.evidence[0]?.counted).map((f) => f.type);
    if (it.kind === "lease") row.expect = it.expectConflicts;
  }
  rows.push(row);
  process.stderr.write(`${it.holdout && !showHoldout ? "." : `${it.id} ${row.error ?? `${row.scam} ${row.priceWord}`}\n`}`);
  await sleep(1500);
}
process.stderr.write("\n");

mkdirSync("scripts/eval/results", { recursive: true });
writeFileSync(`scripts/eval/results/${run}.json`, JSON.stringify(rows.filter((r) => !r.holdout), null, 1));
writeFileSync(`scripts/eval/results/${run}-holdout.json`, JSON.stringify(rows.filter((r) => r.holdout), null, 1));

// ---- Metrics
function scores(set, isPositive) {
  const pos = set.filter((r) => r.label === "scam");
  const neg = set.filter((r) => r.label === "legit");
  const tp = pos.filter(isPositive).length;
  const fp = neg.filter(isPositive).length;
  const flagged = tp + fp;
  return {
    precision: flagged ? tp / flagged : NaN,
    recall: pos.length ? tp / pos.length : NaN,
    falseAlarms: `${fp} of ${neg.length}`,
    n: `${pos.length} scam / ${neg.length} legit`,
  };
}
const pct = (x) => (Number.isNaN(x) ? "n/a" : `${Math.round(x * 100)}%`);
function table(label, set) {
  const ok = set.filter((r) => !r.error && r.kind === "listing");
  const systems = [
    ["Clearlease: \"Likely scam\"", (r) => r.scam === "likely"],
    ["Clearlease: any red flag (Some or Likely)", (r) => r.scam === "likely" || r.scam === "some"],
    ["Keyword baseline: any keyword", (r) => r.keywords.length > 0],
  ];
  const lines = [`**${label}** (${scores(ok, () => false).n}; errors: ${set.filter((r) => r.error).length})`, "", "| System | Precision | Recall | False alarms on legit listings |", "|---|---|---|---|"];
  for (const [name, f] of systems) {
    const s = scores(ok, f);
    lines.push(`| ${name} | ${pct(s.precision)} | ${pct(s.recall)} | ${s.falseAlarms} |`);
  }
  const legitFarBelow = ok.filter((r) => r.label === "legit" && r.priceWord === "far-below").map((r) => r.id);
  lines.push("", `Legit listings priced "far below" (would read "Suspiciously cheap"): ${legitFarBelow.length ? legitFarBelow.join(", ") : "none"}.`);
  const missed = ok.filter((r) => r.label === "scam" && r.scam !== "likely" && r.scam !== "some").map((r) => r.id);
  const alarms = ok.filter((r) => r.label === "legit" && (r.scam === "likely" || r.scam === "some")).map((r) => `${r.id} (${r.flags.join(", ")})`);
  lines.push(`Missed scams (no red flag): ${missed.join(", ") || "none"}. False alarms: ${alarms.join("; ") || "none"}.`);
  return lines.join("\n");
}
function leaseTable(set) {
  const leases = set.filter((r) => r.kind === "lease" && !r.error);
  let exp = 0, hit = 0, extra = 0;
  const lines = ["| Lease | Expected conflicts | Found conflicts |", "|---|---|---|"];
  for (const r of leases) {
    exp += r.expect.length;
    hit += r.expect.filter((t) => r.conflicts.includes(t)).length;
    extra += r.conflicts.filter((t) => !r.expect.includes(t)).length;
    lines.push(`| ${r.id} | ${r.expect.join(", ") || "none"} | ${r.conflicts.join(", ") || "none"} |`);
  }
  return [`Clause-conflict recall: ${hit} of ${exp}. Unexpected conflicts: ${extra}.`, "", ...lines].join("\n");
}

const dev = rows.filter((r) => !r.holdout);
const out = [`### Run "${run}" (${new Date().toISOString().slice(0, 16)}Z, ${base})`, "", table("Development set", dev), "", leaseTable(dev)];
const modes = [...new Set(rows.map((r) => r.mode).filter(Boolean))];
const ms = dev.filter((r) => r.ms).map((r) => r.ms).sort((a, b) => a - b);
out.push("", `Modes: ${modes.join(", ")}. Median latency: ${ms.length ? (ms[ms.length >> 1] / 1000).toFixed(1) : "?"} s.`);
if (showHoldout) out.push("", table("Holdout (never inspected while making changes)", rows.filter((r) => r.holdout)));
else out.push("", `Holdout: ${rows.filter((r) => r.holdout).length} items run and saved unread to scripts/eval/results/${run}-holdout.json.`);
console.log(out.join("\n"));
