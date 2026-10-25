// Spanish-mode end-to-end check. For every sample (and one pasted listing): switch to Español, run it, then check
//   (a) the ES toggle is still pressed and <html lang="es">, and
//   (b) no visible English is left in the report, outside quotes (which must stay in the original language) and an
//       allowlist of proper nouns, codes and citations.
// Usage: node scripts/e2e-es.mjs [baseUrl] [--report]   (exit 1 on any failure; --report lists strings without failing)
import { chromium } from "playwright-core";

const base = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "http://localhost:3000";
const reportOnly = process.argv.includes("--report");

const SAMPLES = [
  "Subarriendo de verano en Blacksburg",
  "Foto de una página del contrato",
  "1 recámara en Arlington",
  "Oferta en Facebook",
  "Instrucciones ocultas para la IA",
];
const PASTED =
  "Apartamento de 1 recámara en Silver Spring, MD 20910. Renta $1,600 al mes. Visitas en persona los sábados. Depósito al firmar el contrato.";

// Common English words; a sentence with two or more of them (and outside a quote) counts as English.
const EN_WORDS = new Set(
  "the and you your is are of to for with this that we our not be can it if on at by from or an have has was were will would should before after only may than more less into its about rent lease landlord deposit price check scam usual range below above notice clause law tenant".split(
    " ",
  ),
);
// Allowed English-looking tokens: proper nouns, product and agency names, codes, units.
const ALLOW = [
  /\bClearlease\b/g, /\bGemma\b/g, /\bGemini\b/g, /\bGoogle\b/g, /\bHUD\b/g, /\bFTC\b/g, /\bFMR\b/g, /\bACS\b/g, /\bDCHD\b/g, /\bDHCD\b/g,
  /\bVirginia Tech\b/g, /\bBlacksburg\b/g, /\bArlington\b/g, /\bClarendon\b/g, /\bBallston\b/g, /\bVirginia\b/g, /\bMaryland\b/g, /\bDC\b/g,
  /\bZelle\b/g, /\bWhatsApp\b/g, /\bGroupMe\b/g, /\bFacebook\b/g, /\bWestern Union\b/g, /\bVenmo\b/g,
  /gemma-[\w.-]+/g, /\bVa\. Code[^,;)]*/g, /\bD\.C\. Code[^,;)]*/g, /\bMd\. Code[^,;)]*/g, /\b\d+ DCMR[^,;)]*/g, /§+[^,;)]*/g,
  /\bZIP\b/g, /\bFY\d{4}\b/g, /\bVT\b/g, /\bMD\b/g, /\bVA\b/g, /\bSSN\b/g, /\bLIHTC\b/g, /https?:\S+/g,
];

function englishSentences(text) {
  let t = text;
  for (const re of ALLOW) t = t.replace(re, " ");
  return t
    .split(/(?<=[.!?:])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => {
      const words = s.toLowerCase().match(/[\p{L}']+/gu) ?? []; // whole words, accents included ("así" is not "as")
      return words.filter((w) => EN_WORDS.has(w)).length >= 2;
    });
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("[data-ready]").waitFor();
await page.getByRole("button", { name: "Español" }).click();

let failed = 0;
const runs = [...SAMPLES.map((s) => ({ name: s, sample: s })), { name: "Pasted listing (Spanish)", pasted: PASTED }];
for (const run of runs) {
  if (run.sample) {
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }),
      page.getByRole("button", { name: new RegExp(run.sample) }).first().click(),
    ]);
  } else {
    await page.getByLabel(/Texto del anuncio/).fill(run.pasted);
    await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/check"), { timeout: 90_000 }),
      page.getByRole("button", { name: /Revisar este anuncio/ }).click(),
    ]);
  }
  await page.locator("article").first().waitFor({ timeout: 90_000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));

  const pressed = await page.getByRole("button", { name: "Español" }).getAttribute("aria-pressed");
  const lang = await page.evaluate(() => document.documentElement.lang);
  // Visible report text, minus quotes (blockquote, mark, [data-quote]) which must stay in the original language.
  const text = await page.locator("article").first().evaluate((el) => {
    // Visible text, one line per text node, skipping quotes, the user's own text, code and screen-reader-only spans.
    // The map widget itself is Google's UI (labels, its own error text); our caption around it is still checked.
    const skip = "blockquote, mark, [data-quote], code, .sr-only, svg, figure > [role=img]";
    const out = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest(skip)) continue;
      const s = n.textContent.replace(/\s+/g, " ").trim();
      if (s) out.push(s);
    }
    return out.join("\n");
  });
  const english = englishSentences(text);
  const toggleOk = pressed === "true" && lang === "es";
  const ok = toggleOk && english.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${run.name}: aria-pressed=${pressed} html lang=${lang}, English sentences: ${english.length}`);
  for (const s of english.slice(0, reportOnly ? 100 : 8)) console.log(`    EN: ${s.slice(0, 160)}`);
}
if (errors.length) console.log("page errors:", errors);
await browser.close();
process.exit(failed && !reportOnly ? 1 : 0);
