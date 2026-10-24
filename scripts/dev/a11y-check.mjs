// Quick a11y regression: tab through the report's verdict board, check reduced motion disables the stamp animation.
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("[data-ready]").waitFor();
await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/check")), page.getByRole("button", { name: /Facebook deal/ }).first().click()]);
await page.getByRole("heading", { name: "Your pre-sign report" }).waitFor();
await page.waitForTimeout(300);
console.log("focused after result:", await page.evaluate(() => document.activeElement?.textContent));
const names = [];
for (let i = 0; i < 3; i++) {
  await page.keyboard.press("Tab");
  names.push(await page.evaluate(() => `${document.activeElement?.tagName} ${document.activeElement?.getAttribute("href")} "${document.activeElement?.textContent}"`));
}
console.log("tab order:", names);
console.log("stamp animation under reduced motion:", await page.evaluate(() => getComputedStyle(document.querySelector(".stamp")).animationName));
console.log("verdict list label:", await page.getByRole("list", { name: "Verdicts" }).count());
await browser.close();
