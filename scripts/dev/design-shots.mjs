// Before/after design screenshots at 375 and 1280.
// Usage: node scripts/dev/design-shots.mjs <outDir> [baseUrl]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const out = process.argv[2];
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

async function run(page, sample) {
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }),
    page.getByRole("button", { name: new RegExp(sample) }).first().click(),
  ]);
  await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor({ timeout: 90_000 });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById("report-title")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(200);
}

for (const [w, h] of [
  [375, 812],
  [1280, 860],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  await page.screenshot({ path: `${out}/${w}-1-empty.png` });
  await run(page, "Facebook deal");
  await page.screenshot({ path: `${out}/${w}-2-scam-verdicts.png` });
  if (w === 375) await page.screenshot({ path: `${out}/${w}-2b-scam-full.png`, fullPage: true });
  await run(page, "Photo of a lease page");
  await page.screenshot({ path: `${out}/${w}-3-lease-verdicts.png` });
  await page.evaluate(() => document.getElementById("s3")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/${w}-4-lease-clauses.png` });
  await page.close();
}
await browser.close();
console.log("saved to", out);
