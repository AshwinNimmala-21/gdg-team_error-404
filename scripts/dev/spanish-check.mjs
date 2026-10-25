// Spanish mode check: toggles ES, runs two samples, prints what a renter would see. Usage: node scripts/dev/spanish-check.mjs [baseUrl] [outDir]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3];
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("[data-ready]").waitFor();
await page.getByRole("button", { name: "Español" }).click();
console.log("html lang:", await page.evaluate(() => document.documentElement.lang), "| h1:", await page.locator("h1").innerText());
for (const sample of ["Foto de una página del contrato", "Subarriendo de verano en Blacksburg"]) {
  await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }), page.getByRole("button", { name: new RegExp(sample) }).first().click()]);
  const report = page.getByRole("heading", { name: "Su informe antes de firmar" });
  await report.waitFor({ timeout: 90_000 });
  await page.waitForTimeout(800);
  console.log(`\n== ${sample}`);
  console.log("stamps:", (await page.locator(".stamp").allInnerTexts()).map((s) => s.replace(/\n/g, ": ")).join(" | "));
  console.log("section headings:", (await page.locator("article h3").allInnerTexts()).join(" | "));
  const plains = await page.locator("#s3 li > p.mt-0\\.5").allInnerTexts();
  if (plains.length) console.log("clause explanations (Gemma):", plains.slice(0, 3));
  console.log("questions:", (await page.locator("ol li p.font-semibold").allInnerTexts()).slice(0, 3));
  if (out) await page.screenshot({ path: `${out}/es-${sample.startsWith("Foto") ? "lease" : "sublet"}.png`, fullPage: true });
}
console.log("\npage errors:", errors.length ? errors : "none");
await browser.close();
