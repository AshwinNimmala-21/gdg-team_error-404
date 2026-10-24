// Renders scripts/samples/lease-page.html to public/samples/lease-page.jpg with the installed Chrome.
// Usage: node scripts/render-lease-sample.mjs
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
import path from "node:path";

const src = path.resolve("scripts/samples/lease-page.html");
const out = path.resolve("public/samples/lease-page.jpg");
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 960, height: 400 }, deviceScaleFactor: 1.25 });
await page.goto(pathToFileURL(src).href);
await page.screenshot({ path: out, type: "jpeg", quality: 85, fullPage: true });
await browser.close();
console.log("wrote", out);
