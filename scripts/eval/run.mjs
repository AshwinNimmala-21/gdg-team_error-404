// Offline evaluation: Clearlease (/api/check) vs a keyword-only baseline on scripts/eval/dataset.jsonl.
// Usage: node scripts/eval/run.mjs <runName> [baseUrl] [--holdout] [--set=easy|hard]
//   --set=hard uses scripts/eval/hard.jsonl (adversarial items, incl. screenshots). The baseline only sees `text`,
//   so for screenshot items it sees nothing, like grep on an image.
//   Without --holdout, holdout items are still run, but their results go to a separate file and are not printed.
//   Local runs need a raised limit: RATE_LIMIT_PER_MIN=1000 npm run dev   (never set this on Cloud Run).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const showHoldout = args.includes("--holdout");
const set = (args.find((a) => a.startsWith("--set=")) ?? "--set=easy").slice(6);
const kindOnly = (args.find((a) => a.startsWith("--kind=")) ?? "").slice(7); // e.g. --kind=lease
const [run = "adhoc", base = "http://localhost:3000"] = args.filter((a) => !a.startsWith("--"));
const items = readFileSync(set === "easy" ? "scripts/eval/dataset.jsonl" : `scripts/eval/${set}.jsonl`, "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((it) => !kindOnly || it.kind === kindOnly);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// --pace=N waits N seconds between items, to stay under a free-tier rate limit (default 1.5 s).
const paceMs = Number((args.find((a) => a.startsWith("--pace=")) ?? "--pace=1.5").slice(7)) * 1000;

// ---- Keyword-only baseline: flags a listing if any scam keyword appears. No model, no rules, no price data.
// Frozen after run "before"; never edit (see the file's note).
const { keywords: KEYWORDS } = JSON.parse(readFileSync("scripts/eval/baseline-keywords.json", "utf8"));
const keywordHits = (text) => KEYWORDS.filter((k) => text.toLowerCase().includes(k));

async function check(text, imagePath) {
  const body = { text };
  if (imagePath) body.image = { mimeType: "image/jpeg", data: readFileSync(imagePath).toString("base64") };
  for (let attempt = 0; attempt < 3; attempt++) {
    const t0 = Date.now();
    const res = await fetch(`${base}/api/check`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, ms: Date.now() - t0, j };
    if (res.status === 429 || res.status >= 500) { await sleep(5000 * (attempt + 1)); continue; }
    return { ok: false, error: `${res.status} ${j?.error?.code}` };
  }
  return { ok: false, error: "gave up after 3 tries" };
}

const rows = [];
for (const it of items) {
  const r = await check(it.text, it.image);
  const row = { id: it.id, kind: it.kind, label: it.label, category: it.category, holdout: Boolean(it.holdout), keywords: keywordHits(it.text) };
  if (!r.ok) row.error = r.error;
  else {
    const { j } = r;
    row.mode = j.meta.mode;
    row.ms = r.ms;
    row.price = j.price.status;
    row.priceWord = j.price.status === "below" ? (j.price.farBelow ? "far-below" : "below") : j.price.status;
    row.suspicious = j.price.suspicious;
    row.subletLine = /sublets often list below market/i.test(j.price.detail ?? "");
    row.scam = j.scam.status;
    row.flags = j.scam.flags.map((f) => f.id);
    row.kinds = j.read.kinds;
    row.rent = j.read.rent;
    row.question = j.inputType === "question"; // "what we can check" state instead of verdicts (Task A)
    row.conflicts = j.lease.findings.filter((f) => f.severity === "conflict" && f.evidence[0]?.counted).map((f) => f.type);
    if (it.kind === "lease") row.expect = it.expectConflicts;
  }
  rows.push(row);
  process.stderr.write(`${it.holdout && !showHoldout ? "." : `${it.id} ${row.error ?? `${row.scam} ${row.priceWord}`}\n`}`);
  await sleep(paceMs);
}
process.stderr.write("\n");

mkdirSync("scripts/eval/results", { recursive: true });
const tag = set === "easy" ? run : `${run}-${set}`;
writeFileSync(`scripts/eval/results/${tag}.json`, JSON.stringify(rows.filter((r) => !r.holdout), null, 1));
if (set === "easy") writeFileSync(`scripts/eval/results/${run}-holdout.json`, JSON.stringify(rows.filter((r) => r.holdout), null, 1));

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
  const ok = set.filter((r) => !r.error && (r.kind === "listing" || r.kind === "message"));
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
  // Before step 2, every "far below" price read "Suspiciously cheap"; after it, only price.suspicious does.
  const legitFarBelow = ok.filter((r) => r.label === "legit" && (r.suspicious ?? r.priceWord === "far-below")).map((r) => r.id);
  lines.push("", `Legit listings labelled "Suspiciously cheap": ${legitFarBelow.length ? legitFarBelow.join(", ") : "none"}.`);
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
const out = [`### Run "${run}", ${set} set (${new Date().toISOString().slice(0, 16)}Z, ${base})`, "", table("Development set", dev), "", leaseTable(dev)];
const modes = [...new Set(rows.map((r) => r.mode).filter(Boolean))];
const ms = dev.filter((r) => r.ms).map((r) => r.ms).sort((a, b) => a - b);
out.push("", `Modes: ${modes.join(", ")}. Median latency: ${ms.length ? (ms[ms.length >> 1] / 1000).toFixed(1) : "?"} s.`);
if (set !== "easy") {
  out.push("", "| Category | Items | Clearlease correct (any red flag = scam) | Baseline correct (any keyword = scam) |", "|---|---|---|---|");
  for (const cat of [...new Set(rows.map((r) => r.category))]) {
    const c = rows.filter((r) => r.category === cat && !r.error);
    const right = (f) => c.filter((r) => f(r) === (r.label === "scam")).length;
    out.push(`| ${cat} | ${c.length} | ${right((r) => r.scam === "likely" || r.scam === "some")} | ${right((r) => r.keywords.length > 0)} |`);
  }
}
if (set !== "easy") {} else if (showHoldout) out.push("", table("Holdout (never inspected while making changes)", rows.filter((r) => r.holdout)));
else out.push("", `Holdout: ${rows.filter((r) => r.holdout).length} items run and saved unread to scripts/eval/results/${run}-holdout.json.`);
if (set === "messy") {
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const qs = rows.filter((r) => r.label === "question");
  const rentItems = rows.filter((r) => byId[r.id].expectRent !== undefined);
  out.push(
    "",
    `Questions answered with the "what we can check" state: ${qs.filter((r) => r.question).length} of ${qs.length}. ` +
      `Rent read correctly: ${rentItems.filter((r) => r.rent === byId[r.id].expectRent).length} of ${rentItems.length}. ` +
      `Listings or messages shown as a question by mistake: ${rows.filter((r) => r.label !== "question" && r.question).length}.`,
    "",
    "| Item | Category | Label | Shown as | Scam | Rent read (expected) |",
    "|---|---|---|---|---|---|",
  );
  for (const r of rows)
    out.push(`| ${r.id} | ${r.category} | ${r.label} | ${r.error ?? (r.question ? "question" : "report")} | ${r.scam ?? ""}${r.flags?.length ? ` (${r.flags.length})` : ""} | ${r.rent ?? "none"}${byId[r.id].expectRent !== undefined ? ` (${byId[r.id].expectRent})` : ""} |`);
}
if (set === "student") {
  out.push("", "| Item | Category | Label | Price verdict | Scam | Sublet line shown |", "|---|---|---|---|---|---|");
  for (const r of rows) out.push(`| ${r.id} | ${r.category} | ${r.label} | ${r.suspicious ? "Suspiciously cheap" : r.priceWord ?? r.error} | ${r.scam ?? ""} | ${r.subletLine ? "yes" : "no"} |`);
}
console.log(out.join("\n"));
