// Renders the screenshot items in scripts/eval/hard.jsonl to JPEGs with the installed Chrome.
// Usage: node scripts/eval/render-hard-images.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const css = `body{margin:0;background:#f2f3f5;font:16px/1.4 -apple-system,Helvetica,Arial,sans-serif;color:#111}
.chat,.post{width:380px;margin:14px;background:#fff;border-radius:12px;padding:12px 14px;box-shadow:0 1px 2px #0002}
.hd{font-size:12px;color:#666;margin-bottom:8px}
.chat p{margin:6px 0;padding:8px 11px;border-radius:16px;max-width:80%;width:fit-content}
.them{background:#e9e9eb}.me{background:#3b7ddd;color:#fff;margin-left:auto!important}
.post p{margin:0}`;
const items = readFileSync("scripts/eval/hard.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((i) => i.image);
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 410, height: 200 }, deviceScaleFactor: 2 });
for (const it of items) {
  await page.setContent(`<meta charset=utf-8><style>${css}</style>${it.html}`);
  await page.locator(".chat,.post").first().screenshot({ path: it.image, type: "jpeg", quality: 85 });
  console.log("wrote", it.image);
}
await browser.close();
