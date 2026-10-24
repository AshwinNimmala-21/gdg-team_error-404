// README screenshots: desktop scam report + phone lease report. Usage: node scripts/dev/readme-shots.mjs [baseUrl]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
async function shot(w, h, sample, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }), page.getByRole("button", { name: new RegExp(sample) }).first().click()]);
  await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor({ timeout: 90_000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  if (w < 600) await page.evaluate(() => document.getElementById("report-title")?.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `docs/screenshots/${file}` });
  await page.close();
}
await shot(1280, 900, "Facebook deal", "desktop-scam.png");
await shot(390, 844, "Photo of a lease page", "phone-lease.png");
await browser.close();
console.log("ok");
