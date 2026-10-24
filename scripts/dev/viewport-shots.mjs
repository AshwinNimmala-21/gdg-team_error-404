// Viewport-sized (not full-page) screenshots for quick review. Usage: node scripts/dev/viewport-shots.mjs <outDir>
import { chromium } from "playwright-core";
const out = process.argv[2];
const browser = await chromium.launch({ channel: "chrome" });
for (const [w, h] of [[1280, 800], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  await page.screenshot({ path: `${out}/vp-${w}-empty.png` });
  await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/check")), page.getByRole("button", { name: /Facebook deal/ }).first().click()]);
  await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor();
  await page.waitForTimeout(800);
  await page.getByRole("heading", { name: "Your pre-sign report" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById("report-title")?.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `${out}/vp-${w}-scam.png` });
  await page.close();
}
await browser.close();
