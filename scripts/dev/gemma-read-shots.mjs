// Screenshots the "What Gemma read" section for a text sample and the lease photo, with the quotes drawer open.
// Usage: node scripts/dev/gemma-read-shots.mjs [baseUrl] [outDir]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "docs/screenshots";
const browser = await chromium.launch({ channel: "chrome" });
for (const [vp, sample, name] of [[1280, "Facebook deal", "gemma-read-text"], [375, "Photo of a lease page", "gemma-read-photo"]]) {
  const page = await browser.newPage({ viewport: { width: vp, height: 900 } });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("[data-ready]").waitFor();
  await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }), page.getByRole("button", { name: new RegExp(sample) }).first().click()]);
  const sec = page.locator("section", { has: page.getByRole("heading", { name: "What Gemma read" }) });
  await sec.waitFor({ timeout: 90_000 });
  await sec.locator("summary").click();
  await sec.screenshot({ path: `${out}/${name}-${vp}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const markBg = await sec.locator("mark").first().evaluate((m) => getComputedStyle(m).backgroundColor);
  console.log(name, vp, "markBg:", markBg, "marks:", await sec.locator("mark").count(), "overflow:", overflow);
  await page.close();
}
await browser.close();
