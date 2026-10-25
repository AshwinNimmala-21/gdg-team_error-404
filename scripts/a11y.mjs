// Accessibility audit: runs axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on the landing page and on finished
// reports at desktop and phone widths, with every <details> opened, and measures contrast for the color tokens.
// Also a UI regression check: it clicks text → photo → text samples and fails on any uncaught page error
// (the Oct 24 map crash showed up exactly in that order). Best run against a production build: `npm run build && PORT=3100 npm start`.
// Usage: node scripts/a11y.mjs [baseUrl]   (exit code 1 on any axe violation or page error)
import { chromium } from "playwright-core";
import { createRequire } from "node:module";

const base = process.argv[2] ?? "http://localhost:3000";
const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const viewports = [
  { name: "desktop 1280", width: 1280, height: 900 },
  { name: "phone 375", width: 375, height: 812 },
];
const samples = ["Blacksburg summer sublet", "Photo of a lease page", "Hidden AI instructions"];

async function scan(page, label) {
  await page.addScriptTag({ path: axePath });
  const r = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags } }), TAGS);
  console.log(`${label}: ${r.violations.length} violations, ${r.passes.length} rules passed, ${r.incomplete.length} need review`);
  for (const v of r.violations) {
    console.log(`  ✗ [${v.impact}] ${v.id}: ${v.help}`);
    for (const n of v.nodes.slice(0, 4)) console.log(`      ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`);
  }
  for (const v of r.incomplete.filter((v) => v.id === "color-contrast"))
    for (const n of v.nodes) console.log(`  ? color-contrast, manual review: ${n.target.join(" ")} (${n.any[0]?.message ?? ""})`);
  return r.violations.length;
}

const browser = await chromium.launch({ channel: "chrome" });
let total = 0;
const pageErrors = [];
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.emulateMedia({ reducedMotion: "reduce" }); // no stamp animation mid-scan
  page.on("pageerror", (e) => pageErrors.push(`${vp.name}: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  total += await scan(page, `${vp.name}, landing`);
  for (const s of samples) {
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }),
      page.getByRole("button", { name: new RegExp(s) }).first().click(),
    ]);
    await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor({ timeout: 90_000 });
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    total += await scan(page, `${vp.name}, report: ${s} (all drawers open)`);
  }
  await page.close();
}

// Contrast of the design tokens, read from the live CSS (WCAG 2.x relative luminance).
const page = await browser.newPage();
await page.goto(base, { waitUntil: "networkidle" });
const tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const names = ["ink", "ink-soft", "pen", "pen-dark", "pen-tint", "sheet", "paper", "ok", "ok-tint", "warn", "warn-tint", "stop", "stop-tint", "nil", "nil-tint", "rule"];
  return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(`--color-${n}`).trim()]));
});
await browser.close();
const lum = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b] = full.match(/../g).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const pairs = [
  ["ink", "sheet", "body text"], ["ink", "paper", "body text on page background"], ["ink-soft", "sheet", "secondary text"],
  ["ink-soft", "paper", "secondary text on page background"], ["pen", "sheet", "links and buttons"], ["sheet", "pen", "white text on blue button"],
  ["ink", "pen-tint", "highlighted quotes"], ["ok", "sheet", "Typical / No red flags"], ["warn", "sheet", "Below range / Some red flags"],
  ["stop", "sheet", "Likely scam / Fix before signing"], ["ok", "ok-tint", "green note"], ["warn", "warn-tint", "amber note"],
  ["stop", "stop-tint", "red note"], ["nil", "nil-tint", "Not run"], ["rule", "sheet", "decorative dividers and card outlines (no WCAG minimum)"], ["ink-soft", "sheet", "form-field borders (non-text, 3:1 needed)"],
];
console.log("\n| Foreground | Background | Used for | Ratio | WCAG AA |\n|---|---|---|---|---|");
for (const [f, b, use] of pairs) {
  const r = ratio(tokens[f], tokens[b]);
  const need = use.includes("no WCAG minimum") ? 0 : use.includes("non-text") ? 3 : 4.5;
  const verdict = need === 0 ? "n/a (decorative)" : `${r >= need ? "pass" : "FAIL"} (needs ${need}:1)`;
  console.log(`| ${f} ${tokens[f]} | ${b} ${tokens[b]} | ${use} | ${r.toFixed(2)}:1 | ${verdict} |`);
}
for (const e of pageErrors) console.log(`  ✗ page error: ${e}`);
console.log(total ? `\nFAIL: ${total} axe violations` : "\nPASS: 0 axe violations");
console.log(pageErrors.length ? `FAIL: ${pageErrors.length} uncaught page errors` : "PASS: 0 uncaught page errors (text → photo → text)");
process.exit(total || pageErrors.length ? 1 : 0);
