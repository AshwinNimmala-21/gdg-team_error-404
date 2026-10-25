// Drives the running app with the installed Chrome: clicks each sample at 375px and 1280px,
// checks for horizontal scroll, and saves screenshots.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve(process.argv[3] ?? "docs/screenshots");
mkdirSync(out, { recursive: true });

const samples = ["Blacksburg summer sublet", "Photo of a lease page", "Arlington 1-bedroom", "Facebook deal", "Hidden AI instructions"];
const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "1280", width: 1280, height: 900 },
];

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  await page.screenshot({ path: `${out}/${vp.name}-empty.png`, fullPage: true });
  for (const [i, s] of samples.entries()) {
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 60_000 }),
      page.getByRole("button", { name: new RegExp(s) }).click(),
    ]);
    await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor({ timeout: 60_000 });
    await page.waitForTimeout(700); // let the stamp animation settle
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const stamps = await page.locator(".stamp").allInnerTexts();
    console.log(`${vp.name}px sample ${i + 1} (${s}): stamps=[${stamps.join(" | ")}] horizontalOverflow=${overflow}px`);
    if (overflow > 0) failures++;
    await page.screenshot({ path: `${out}/${vp.name}-sample${i + 1}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(failures ? `FAIL: ${failures} views overflow horizontally` : "PASS: no horizontal overflow");
process.exit(failures ? 1 : 0);
