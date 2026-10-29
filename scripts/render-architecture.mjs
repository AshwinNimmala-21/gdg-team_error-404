// Renders docs/diagram/architecture.html to docs/architecture.png (3200×1430: 1600×715 CSS px at 2×).
// Usage: node scripts/render-architecture.mjs   (needs network for the Inter and JetBrains Mono web fonts)
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 715 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(resolve("docs/diagram/architecture.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Fail loudly instead of shipping a clipped diagram.
const overflow = await page.evaluate(() => Math.max(...[...document.querySelectorAll("li, .step p, .legend")].map((e) => e.getBoundingClientRect().bottom)));
const legendTop = await page.evaluate(() => document.querySelector(".legend").getBoundingClientRect().top);
const notesBottom = await page.evaluate(() => Math.max(...[...document.querySelectorAll(".notes li")].map((e) => e.getBoundingClientRect().bottom)));
if (overflow > 715 || notesBottom > legendTop - 12) {
  console.error(`layout doesn't fit: lowest element ${overflow}px, notes end ${notesBottom}px, legend at ${legendTop}px`);
  process.exit(1);
}
await page.screenshot({ path: "docs/architecture.png" });
await browser.close();
console.log("wrote docs/architecture.png");
