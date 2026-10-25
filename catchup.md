# Catch-up for Yoshwan: everything since your handoff (Sat 9:15 PM → handoff, Sun ~3:00 AM)

Written by Ashwin with Claude Code. **This is the single handoff document.** Your laptop takes over the overnight queue from here; your Claude Code session should read this whole file first, then follow "Remaining instructions (verbatim)" (section 15). Your handoff commit was `c5c8adc`; your last commits after it were `0d0ff70` (owner relocating *to* a place still counts as away) and `bde37c3` (log invalid-output step-downs). Everything below came after those.

## TL;DR
- **All work is on branch `dev`, pushed. Last code commit: `9d22833`** (this handoff doc is committed right after it). `main` is unchanged since your last commit (`bde37c3`). `dev` contains all of `main` plus every commit from tonight.
- **Your stashed tag restyle (`stash@{0}`) will conflict** with tonight's changes to `components/Report.tsx` and `app/globals.css`. Details in "Merge notes" below.
- **Gate at `9d22833` (Sun 2:51 AM), all green:**
  - **92 unit tests** pass (14 files); lint clean; `npm run build` OK.
  - `node scripts/e2e.mjs http://localhost:3000`: **5/5 PASS live**.
  - `node scripts/e2e-es.mjs`: **6/6 PASS** on the production build and the dev server.
  - axe-core: **0 violations** in English and Spanish (8 scans each, 375 and 1280 px).
- The overnight queue is handed over: **Tasks C, A, B and D4 and the Finish steps are not started** (section 14). Their exact instructions are in section 15.
- The ownership rule was lifted for tonight (you were offline), so `lib/`, `app/api/` and `components/` were edited. Everything is listed below so you can review it.

---

## 1. Deploy (done before the overnight sprint)
- Ashwin deployed to Cloud Run with `docs/DEPLOY.md`. Live URL: `https://clearlease-477820387862.us-east4.run.app`. `node scripts/e2e.mjs <URL>` passed 4/4 live at the time.
- `docs/DEPLOY.md`: added `RATE_LIMIT_PER_MIN=30` to `--set-env-vars` (judges share venue Wi-Fi). Your `--timeout 120` was already there; the merge kept your wording.
- README: live URL near the top. `docs/submissions.md` and `docs/video-script.md` were created as stubs (URL + headings only; the drafts are still to do).
- gcloud is now installed on Ashwin's Mac (`brew install --cask gcloud-cli`).

## 2. Evaluation (new): `scripts/eval/`, `docs/evaluation.md`
Built *before* changing any product code, so there's a real before/after.
- **`scripts/eval/dataset.jsonl` ("easy" set):** 22 scams, 20 legitimate listings, 8 leases. Every item has a `source`.
  - 3 scams are reconstructions of real published cases: UIUC police (Facebook sublet, Zelle), CBS Detroit (Zelle sublease, keys "mailed"), and WDBJ7 (Roanoke renter who toured the house and still lost $4,700). None publishes the listing text, so we wrote text matching the described facts and labelled it "reconstruction".
  - Everything else is labelled `synthetic`.
  - **10 items are a holdout**, marked before the first run and never opened until the final run.
  - 3 leases (x06–x08) were added *after* the lease fix, to test it on unseen wording.
- **`scripts/eval/hard.jsonl` (24 items, added after Ashwin flagged the easy set as too easy and circular):** payment requests that avoid keywords ("send it through the app I'll text you", "PP F&F", CashApp $tag), misspellings ("Z.e.l.l.e", "0verseas"), Spanish scams, legitimate listings with anti-scam disclaimers ("we never accept Zelle"), and **6 screenshot images** rendered by `scripts/eval/render-hard-images.mjs`.
- **`scripts/eval/student.jsonl` (8 items):** per-bedroom and per-person student rentals, sublets, and scams priced per bedroom.
- **Keyword baseline:** `scripts/eval/baseline-keywords.json`, 33 keywords, **frozen** after the first run (never edit it).
- **Runner:** `node scripts/eval/run.mjs <runName> [url] [--holdout] [--set=easy|hard|student] [--kind=lease]`. Local runs need `RATE_LIMIT_PER_MIN=1000 npm run dev`. Results are in `scripts/eval/results/*.json`.
- **Final numbers** (all live Gemma; full tables in `docs/evaluation.md` and the README "Evaluation" section):

| Set | Clearlease (any red flag) before → after | Keyword baseline |
|---|---|---|
| Easy (17 scam / 15 legit) | precision 77% → 89%, false alarms 5 → 2, recall 100% | 94% precision, 100% recall, 1 false alarm |
| Holdout (5 / 5) | false alarms 2 → 1, recall 100% | **100% / 100% / 0. The baseline beats us here.** |
| Hard (15 / 9) | false alarms 1 → 0, recall 100% | 25% precision, 13% recall, 6 false alarms |
| Leases | 7 of 9 conflicts found → **13 of 13**, 0 unexpected | n/a |
| Legit listings labelled "Suspiciously cheap" | 6 → **0** | n/a |

  - "Likely scam" never fired on a legitimate listing in any set.
  - The README says honestly that on ordinary listings a keyword scan is about as good. Our edge is paraphrase, negation, Spanish, screenshots and leases.

## 3. Price changes: `lib/rules/price.ts`, `lib/rules/scam.ts`, `lib/rules/check.ts`, `lib/client/verdicts.ts`
- **Cheap alone is not a scam sign (bias fix).** Far below the range with no other red flag now reads **"Below usual range: verify before paying"**, with neutral copy (shared rooms, older units and income-restricted units are often priced like this). It reads **"Suspiciously cheap"**, and the `priceFarBelow` scam flag counts, only when at least one other verified scam signal fired.
  - New field: `PriceCheck.suspicious`.
  - Motivation: in the first eval, 4 of 5 false alarms came from price alone.
  - Tests: `lib/rules/__tests__/price-bias.test.ts`.
- **Per-bedroom and per-person rent (student market):**
  - New optional extraction fields in `lib/ai/schema.ts`: `listing.priceBasis` (`whole_unit | per_bedroom | per_person`), `listing.unitBedrooms`, `listing.shortTerm` (a signal). They have Zod defaults, so old saved extractions still parse. The prompt in `lib/ai/prompt.ts` got one extra sentence for these.
  - If the basis is per bedroom or per person, has a verified quote and the unit has 2+ bedrooms, `resolveFacts` uses the **whole unit's** bedroom count for the benchmarks, and `computePrice` divides both edges by that count. The evidence labels it "(approximation)".
  - **Only the "far below" direction is checked** (Ashwin's call: area benchmarks ÷ bedrooms understate near-campus rents). Otherwise there's a new status **`"rough"`** with the verdict "Rough comparison" and this line: "Rough comparison only: per-bedroom rents near campus often run above an even split of area averages. Compare 2–3 nearby listings and ask what's included." It never says "Above usual range" for per-bedroom rent.
  - The FactsBar shows e.g. "$650/mo per bedroom · 4-bedroom (whole unit)".
- **Sublets and short-term rentals:** if `shortTerm` is verified and the price is below the range, the detail adds "Summer sublets often list below market; price alone isn't a red flag here." Combined with the bias fix, price alone never escalates.
  - Tests: `lib/rules/__tests__/student-market.test.ts`.
- The questions builder adds a "What's included in the rent…" question for `"rough"`.

## 4. Lease rule fixes: `lib/rules/lease.ts`, `lib/data/rule-sheets.ts`
Motivated by two misses in the first eval run; the causes were fixed in general, not item by item.
- **A deposit stated as a fact is now checked.** Gemma often puts "Security deposit: $3,000" into `listing.deposit`, not a `security_deposit` clause, so the cap check never ran. `depositAsClause()` now turns a verified deposit (quote found, number in quote) into a deposit finding when the input is a lease and no deposit clause exists. No double counting.
- **Blanket "tenant pays all repairs" is now a conflict in VA** (new rule-sheet field `blanketRepairsProhibited`), matched by a regex on the verified clause text ("all repairs", "regardless of cause", "whether or not caused…"). "Pay for damage you cause" stays "ask". DC already conflicted via `maintenanceWaiverProhibited`. **MD stays "ask".**
- **Verified against official sources before coding:**
  - VA deposit cap 2 months: § 55.1-1226(A).
  - VA repairs: §§ 55.1-1220(A)(2) and (4), and 55.1-1208(C). § 55.1-1220(D) allows *specified* repairs by written good-faith agreement, which is why only blanket clauses conflict.
  - **MD deposit cap is 1 month** (§ 8-203(b)(1), with a 2-month exception for utility-assistance tenants), *not* 2×. Our sheet already said 1, so it was kept.
  - DC cap 1 month (14 DCMR § 308.2, per DC RHC and OTA).
  - No MD statute was found that voids a repair-shifting clause (§ 8-211 is rent escrow).
- The VA `repairs_on_tenant` citation is now "Va. Code §§ 55.1-1220(A), 55.1-1208(C)".
- Tests: `lib/rules/__tests__/lease-gaps.test.ts`.

## 5. UI additions
- **"What Gemma read" section** (`components/GemmaRead.tsx`, `lib/client/highlight.ts`), between the lease section and the questions:
  - Lists every extracted fact with its quote, and how many quotes our code verified.
  - A drawer shows your text (as sent, after redaction), or Gemma's photo transcript next to a thumbnail, with every verified quote highlighted with `<mark>` plus screen-reader "quote start/end" markers.
  - Lease clauses are summarized in one line to avoid clutter.
  - New color token `--color-pen-tint: #dfe7fb`.
  - `Report` now takes `sourceText` and `imageUrl` props from `Checker`.
  - Tests: `lib/client/__tests__/highlight.test.ts`.
- **Blacksburg sample, first in the list:** `public/samples/blacksburg-sublet.txt` (fictional summer sublet, 24060, Zelle before viewing). The lease photo is second.
  - Changes: `SAMPLE_IDS` in `lib/types.ts`, mock extraction in `lib/ai/mock.ts`, `scripts/e2e.mjs` (now **5 cases**), `scripts/screenshots.mjs`, and a test in `samples.test.ts`.
  - Live result: about 45% below the range, 6–7 of 9 flags, Likely scam.
  - The README persona now leads with a VT student renting in Blacksburg; the Arlington job move is second.
- **Map for 24060:** `lib/data/map-centers.ts` shows downtown Blacksburg and the VT campus (midpoint of the Drillfield, 37.22751, -80.42189 per vt.edu, and downtown), zoom 14, **no pin**. Caption: "Area shown: … We map the area, not the exact address." Other ZIPs geocode as before.
- **Spanish (EN/ES toggle)** (`lib/i18n.ts`, `components/Lang.tsx`, `lib/client/rules-es.ts`, `lib/rules/questions-es.ts`):
  - **The toggle** sits in the header. It's two buttons in a labelled group with `aria-pressed`. The choice is saved via `useSyncExternalStore` + `localStorage`, with an in-memory fallback, and `<html lang>` switches.
  - **Gemma:** the request has an optional `lang`. In Spanish, the user prompt asks Gemma to write each clause's `plain` in Spanish ("usted"); quotes stay in the original language.
  - **Questions:** they're our templates, so they're hand-translated (`questions-es.ts`), with a test that fails if any template lacks a Spanish version.
  - **Translated:** labels, verdict words (`verdicts.ts` takes `lang`), scam flag labels, headlines and clause titles (`rules-es.ts`, falls back to English if unknown), the map caption and the community counter.
  - **Update (2:50 AM):** the first version left the long price explanation, legal reasons and evidence in English. That's now fixed; Spanish is end to end (section 12).
  - Not reviewed by a native speaker yet.
- **Questions:** `buildQuestions(price, scam, lease, lang)`; `SCAM_Q` and `leaseQuestion` are now exported for tests.

## 6. Bug fixed: map crash (found by the a11y audit)
- **Symptom:** on a production build, text sample → photo sample → the whole page showed Next.js's error screen (`Cannot read properties of undefined (reading 'then')`).
- **Cause:** after Maps rejects the key (a referrer it doesn't allow), `Geocoder.geocode()` returns `undefined`, and `ListingMap` called `.then` on it. The deployed site and `localhost:3000` weren't affected, because our Maps key only allows those two referrers; any other port or domain (e.g. a self-hoster, or `localhost:3100`) would have been.
- **Fix:** `lib/client/geocode.ts` → `geocodeZip()` never throws or rejects. `ListingMap` uses it, and also shows "The map couldn't load" when `useApiLoadingStatus()` reports an auth failure.
- **Regression tests:** `lib/client/__tests__/geocode.test.ts`. Verified to fail with the exact production error against the old logic. `scripts/a11y.mjs` also fails on any uncaught page error during text → photo → text.
- **Known and accepted (decision (a), documented in `docs/accessibility.md` and PLAN.md):** when the Maps key is rejected (only possible on referrers the key doesn't allow, i.e. anything except `localhost:3000` and our Cloud Run URL; seen on `localhost:3100`), a lease photo followed by the Blacksburg sample logs an uncaught `IntersectionObserver` error from inside Google's map script. The page keeps working. Two fix attempts didn't remove it. Options (b) one shared `APIProvider` and (c) hide the map after `gm_authFailure` are noted in PLAN.md if you want to take it.

## 7. Accessibility: `scripts/a11y.mjs`, `docs/accessibility.md`
- `axe-core` was added as a devDependency. It was already in the lockfile via the ESLint a11y plugin, so the lockfile diff is **one line**. Note that `npm install` on Ashwin's Mac (npm 11.9) strips the `libc` fields from about 70 lockfile entries; we restored your lockfile and did not commit that.
- **0 violations** in 8 scans (landing plus three finished reports, at 1280 and 375 px, every drawer open), on a production build, in **English and Spanish** (`--lang=es`).
- **Measured contrast** from the live CSS tokens: lowest text pair 5.71:1 (green on its tint), body text 16.45:1, links 7.63:1, highlights 13.29:1, form borders 6.60–7.48:1. The `rule` color (1.59:1) is decorative only.
- The README contrast claim was corrected from "5.9:1 or higher" to the measured 5.71:1.
- axe's "needs review" item is the main textarea; nothing overlaps it. Measured: typed text 16.45:1, placeholder 7.48:1.
- **Manual check by Ashwin: 12 of 12 pass** (keyboard K1–K6, VoiceOver V1–V6). K1 failed at first only because the URL had `#main` and the dev overlay was on; on a clean production load the first Tab lands on "Skip to the checker".

## 8. Deploy and setup docs
- **`scripts/deploy.sh`** (macOS/Linux):
  - Secrets come from the environment or hidden input, are passed to gcloud on **stdin**, and are never echoed or put in arguments.
  - Idempotent: APIs, roles and Firestore are only created if missing, a secret gets a new version only if the value changed, and an existing salt is kept.
  - Optional pieces (HUD, Census, Maps, Firestore) are skipped if not given.
  - `--dry-run` makes **zero** gcloud calls (verified with a fake `gcloud` on PATH).
  - **The real run is untested.**
- **README "Minimum setup":** only `GEMINI_API_KEY` is required. The Maps row explains that our key only allows `localhost:3000` and the Cloud Run URL, so self-hosters need their own key. Verified with a production build where HUD, Census, the community salt and Maps were blanked: 5/5 samples live, saved figures labelled, no counter, no map.
- **README "Self-host Gemma (Ollama)": explicitly untested and not wired in.** Ollama publishes `gemma4:26b` (16–19 GB, image input); we'd need an adapter in `lib/ai/gemma.ts`.
- `docs/DEPLOY.md` points macOS/Linux users to the script.

## 9. Docs
- **README:**
  - "Gemma 4 at a glance" near the top (for the Gemma 4 track).
  - New "Evaluation" section with the before/after table and an honest reading.
  - "Cheap isn't a crime" paragraph, student per-bedroom paragraph, "En español" paragraph, minimum setup, deploy script, Ollama section.
  - Accessibility results (axe EN/ES, manual 12/12).
  - Stale numbers fixed (81 tests, 5 samples, the injection demo is now sample 5).
- **`docs/validation.md`:** an interview table (8 rows plus a summary) and a **3-person usability test** template. Task, read aloud: "Is this listing safe?" It measures time to verdict, correctness, reason, confusion in their words, trust out of 5, and whether they understood "What Gemma read". **No answers were invented; it's still empty.**
- **`docs/evaluation.md`:** full method, sources, caveats and every run.
- **`docs/accessibility.md`:** audit, contrast table, regression notes, manual results, Spanish audit, known Maps issue.
- **PLAN.md:** an "Overnight sprint" checklist, all ticked, with commit hashes.

## 10. Merge notes for you
1. **Your stash `stash@{0}` (tag restyle)** touches `components/Report.tsx` and `app/globals.css`. Tonight's changes to `Report.tsx`:
   - all strings now come from `useLang()` (`t.*`)
   - verdict functions take `lang`
   - `GROUPS` uses `key` instead of `title`
   - `<GemmaRead>` was added before the questions
   - new props `sourceText` and `imageUrl`
   - `tr()` wraps rule sentences

   `globals.css` only gained `--color-pen-tint`. Easiest path: check out `dev`, then re-apply your stash and resolve. Any new strings in the tag component should go into `lib/i18n.ts` (EN and ES).
2. **Lockfile:** don't run a plain `npm install` on Ashwin's Mac and commit the result (it drops the `libc` fields). Use `npm ci`.
3. **`PriceCheck.status`** has a new value, `"rough"`. Anything that switches on price status should handle it.
4. **Sample IDs** now include `"blacksburg-sublet"`; e2e expects 5 cases.
5. **`dev` has not been merged into `main`.** Plan: merge before the 9:30 AM freeze so the submitted repo shows this work.

## 11. Still to do (people, not code)
- **Student interviews and the 3-person usability test** in `docs/validation.md` (stakeholder empathy, 5 points). Put 2 quotes in the README and 1 in the video.
- **Video script** (`docs/video-script.md`) and **submission text** (`docs/submissions.md`, MLH Gemma 4 track + codingjam.dev), both still stubs.
- A native Spanish speaker should skim the ES UI before the demo.

---

## 12. Since 1:30 AM: Spanish fix (`6d95c34`)
- **Bug report (Ashwin's manual test):** "switched to ES, clicked a sample, the page went back to English."
- **Reproduced first** with a new script, `scripts/e2e-es.mjs`, against the live site (the earlier partial Spanish). **The toggle never reset:** after every sample the ES button still had `aria-pressed="true"` and `<html lang="es">`. The English came from untranslated rule text (price explanation, evidence drawers, scam sources, legal reasons, help links) and from English sample listings. So there was no state bug to fix, and the ES e2e asserts the toggle state after every sample as the regression check.
- **Fix: Spanish end to end, no machine translation, verdict logic untouched.**
  - **Rule text:** `lib/client/rules-es.ts` holds hand-written templates ("usted" style, like consumidor.ftc.gov) for every sentence the rules, data files and server produce: price headline and detail (range line, per-bedroom approximation, "rough comparison", sublet line), scam flags and their evidence, every lease reason, all 26 legal summaries (statute citations kept exactly), help links, server notes, server and image errors, and FactsBar errors. Whole string first, then sentence by sentence; unknown text stays as-is, so nothing is hidden.
  - **Hook:** `useTr()` in `components/Lang.tsx` is applied in Report, Evidence, ClauseItem, Checker (errors), FactsBar (errors) and the help links.
  - **Quotes:** they stay in the original language and are labelled "Texto original:". Quote elements carry `data-quote`.
  - **Samples:** in Spanish mode the text samples load fictional Spanish listings from `public/samples/es/`. The lease photo stays English.
  - **Recorded answers:** `lib/ai/mock-es.ts` has Spanish recorded extractions for demo mode and the saved-answer fallback. `isUnchangedSample(id, text, hasImage, lang)` now takes the language.
  - **Spanish-aware checks** (English behaviour unchanged):
    - `bedroomsInQuote` accepts "una recámara", "dos recámaras" and "estudio".
    - `isOnlyRelocating` understands "se muda por trabajo" vs "fuera del país".
    - `findInjection` catches Spanish injection phrasing.
  - **Map:** the caption and label are in Spanish (`labelEs` in `lib/data/map-centers.ts`).
  - The "parts of this report are in English" footer notice was removed.
- **Checks:**
  - `lib/rules/__tests__/spanish.test.ts` (11 tests): each Spanish sample gives the same verdicts as the English one, every legal summary and help link has a template, and number templates format correctly.
  - ES e2e: 6/6 (5 samples plus a pasted Spanish listing).
  - axe ES and EN: 0 violations.
  - Eval re-run "after-es-fix": 0 verdict differences on the 40 items that completed. One holdout item errored on a Gemini 500, so that run has 49/50.
  - The detector still flags 31 English sentences on the old live site, which proves it works.
- **Not yet reviewed by a native Spanish speaker.**

## 13. Since 1:30 AM: open-source docs (D1–D3, `9d22833`)
Written by three parallel subagents (docs only), reviewed and committed by Ashwin's session.
- **D1, Gemma 4 license:** verified against official pages. Gemma 4 is **open weights under Apache 2.0**:
  - Google's launch blog says "Gemma 4 is released under a commercially permissive Apache 2.0 license".
  - The model card (ai.google.dev/gemma/docs/core/model_card_4) says "License: Apache 2.0".
  - Hugging Face `google/gemma-4-26B-A4B-it` is tagged apache-2.0 and isn't gated.

  The README license line now links the weights on Hugging Face, Kaggle and Ollama (`gemma4:26b`). Our claim was already right.
- **D2:**
  - **`CONTRIBUTING.md`:** setup, checks, eval rules, a 7-step "add a state" guide.
  - **`CODE_OF_CONDUCT.md`:** Contributor Covenant **3.0**, verbatim, with GitHub issue reporting and no invented email.
  - **`THIRD_PARTY_NOTICES.md`:** 155 production packages, built from installed `package.json` files.
    - **No license is incompatible with Apache-2.0.** Two LGPL-3.0 `@img/sharp-libvips` binaries come in via `next` → `sharp` and ship inside `.next/standalone` and the Docker image, not the repo; anyone distributing an image should keep their notices.
    - HUD and Census data are documented as US government works (17 U.S.C. § 105; HUD's web publication guide), with fetched sources.
- **D3, `docs/code-tour.md`:** a 5-stop walkthrough with file:line ranges and a "say this on camera" line per stop. **Line numbers were taken at `2306aa7`**; the Spanish fix moved some lines in `Report.tsx`, `Checker.tsx`, `scam.ts`, `quotes.ts` and `server/check.ts`, so refresh them before recording the video.
- **Found by D2, not yet fixed:** the Census API terms ask apps to show "This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau." It's only in THIRD_PARTY_NOTICES.md today. Suggested: add it, verbatim in English, to the report footer (with a Spanish translation beside it in ES mode) as part of Task C. See open questions.

## 14. Overnight queue: status

**Current state (Yoshwan's laptop, Sun 4:12 AM, branch `dev` at `4ef4ead`)**
1. One page (`app/(ui)/page.tsx` → `components/Checker.tsx`): text + photo + ZIP in, 5 one-click samples, EN/ES toggle (`components/Lang.tsx`, `lib/i18n.ts`).
2. The browser redacts contacts (`lib/client/redact.ts`) and shrinks photos (`lib/client/image.ts`), then sends one `POST /api/check` (`app/api/check/route.ts`), which applies the rate limit and body caps.
3. `lib/server/check.ts` validates, then runs Gemma (`lib/ai/gemma.ts`: levels 0→2 step-down, 2 retries on 5xx/network/timeout, no retry on 429). It falls back to a labelled saved answer for unchanged samples only, or uses demo mode (`lib/ai/mock.ts`, `mock-es.ts`).
4. Gemma only extracts: a strict Zod/JSON schema (`lib/ai/schema.ts`), a pinned prompt with `<untrusted_input>` delimiters (`lib/ai/prompt.ts`), and a quote for every fact.
5. `lib/rules/quotes.ts` drops any quote not found in the input or Gemma's photo transcript (NFKC, case and punctuation folded; **accents are not folded yet**, Task A).
6. `lib/rules/check.ts` resolves the facts. Price compares against the Census median (low edge) and HUD FY2027 FMR/SAFMR (high edge), live with a 3 s timeout, else saved (`lib/data/*`).
7. `lib/rules/price.ts`: below/typical/above/rough. "Suspiciously cheap" needs another signal; per-bedroom rent is divided by the unit's bedrooms.
8. `lib/rules/scam.ts`: 9 FTC-based checks, weights 1–2, tiers none/some/likely, "Not run" with no listing. A regex injection backstop; relocation that is only for work isn't counted.
9. `lib/rules/lease.ts` + `lib/data/rule-sheets.ts`: VA/DC/MD clause checks with citations. Deposit-as-fact cap and blanket-repairs rules.
10. `lib/rules/questions(-es).ts`: template questions. `lib/client/rules-es.ts`: hand-written Spanish for every rule sentence.
11. Report (`components/Report.tsx`): stamped verdict board (`Stamp.tsx`), sections with `<details>` evidence, "What Gemma read" (`GemmaRead.tsx`, `<mark>` highlights), questions, help links, a map (`ListingMap.tsx`) and the community counter (`Community.tsx`, Firestore keyed hashes).
12. Tests: 92 vitest (14 files). Gates: `scripts/e2e.mjs` (EN API, 5), `scripts/e2e-es.mjs` (ES browser, 6), `scripts/a11y.mjs` (axe + page errors), eval in `scripts/eval/` (easy/hard/student/holdout/leases, frozen keyword baseline).
13. The level-0 Gemma call (schema + minimal thinking) got a 400 on 44/44 calls in Yoshwan's Sat soak. Every check is 2 API calls (level 1 succeeds), which raises 429 risk. This is still open.
14. The map has `role="img"` on `dev`. Yoshwan's `inert`/`aria-hidden` fix (`e8a0352`) is on `main` only and comes in with the next `git pull origin main`.
15. Hosting: Cloud Run (`Dockerfile`, standalone output). `.env` is excluded from the image; Maps config is read per request.

**Git note (Yoshwan):** use `git pull --rebase=merges --autostash origin dev`. A plain `--rebase` tries to linearize the `main` → `dev` merge commit and stops on a conflict (happened at 4:21 AM; aborted cleanly, nothing lost).

**Baseline, Sun 4:03–4:11 AM, fresh production build on :3000, live Gemma** (every later gate is compared to this):
- `npm test` 92/92, lint clean, `npm run build` OK.
- e2e EN **5/5 live**; e2e ES **6/6**, 0 English sentences.
- axe **8 violations in EN and 8 in ES** (1 per scan × 8 scans). All are `label-content-name-mismatch` on the EN/ES toggle: visible "EN"/"ES" isn't part of the `aria-label` "English"/"Español" (WCAG 2.5.3). 0 uncaught page errors. *This contradicts the earlier "0 violations"; fixed in Task C.*
- The unstyled page at 3:30 AM was a stale `npm start` (PID 32756, started Sat 5:05 PM) serving an old build. Stopping only that PID, deleting `.next` and rebuilding fixed it; it was not a code bug.

| Task | Status | Commits / notes |
|---|---|---|
| Spanish fix | **Done** | `6d95c34` |
| D1 Gemma 4 license | **Done** | `9d22833` (Apache 2.0 verified; README download links) |
| D2 CONTRIBUTING / CODE_OF_CONDUCT / THIRD_PARTY_NOTICES | **Done** | `9d22833` |
| D3 code tour | **Done** | `9d22833` (refresh line numbers before the video) |
| C small polish | **Done** (Yoshwan, 4:21 AM) | "Read by Gemma 4" line links to and focuses "What Gemma read" (live mode only; verified in Task A's live gate). "Copy these questions" with a polite landlord message, aria-live, and a selectable fallback when the clipboard is blocked. Tagline "Virginia, DC and Maryland" (ES too). Census API notice verbatim (census.gov ToS, "Attribution"), with a Spanish translation beside it in ES. Also fixed the baseline axe failure (toggle label-in-name; 8+8 → 0+0) and English clause explanations in the Spanish saved/demo lease answer. e2e-es skip list updated for the inert map. Gate (demo mode): 93 tests, lint, build, e2e EN 5/5, ES 6/6, axe 0 EN+ES. |
| A real-world inputs | **Done** (Yoshwan, 4:57 AM, `a5d46c5`) | Questions get a "what we can check" panel (`components/QuestionHelp.tsx`, `inputType`) with any FTC signs they describe; accent-insensitive quote checks; "1.6k" and no-break-space rent formats; Spanish/Spanglish vocabulary in the prompt. `scripts/eval/messy.jsonl` (20 items) live before → after: questions handled 0/5 → 4/5; scam 100%/100%/0 false alarms and rent 11/11 unchanged. Gate: e2e EN 5/5 + ES 6/6 live, axe 0 EN+ES (plus the question panel). |
| B dark theme | Not started | |
| D4 self-hosted model (Ollama) | **Done** (Yoshwan, 5:06 AM) | `GEMMA_PROVIDER=ollama` + `GEMMA_BASE_URL` (`lib/ai/ollama.ts`, OpenAI-compatible endpoint, same retry ladder). Gemini default unchanged (tests + e2e EN 5/5, ES 6/6 live). Tested on Yoshwan's laptop (RTX 4050, Ollama 0.40.11, `OLLAMA_CONTEXT_LENGTH=16384`): e2b-it-qat 1/5 strict, e4b-it-qat 3/5 strict, photo works on both, 26B not tested. README "Self-host Gemma 4" has the table. |
| Finish 1–4 | Not started | |

## 15. Remaining instructions (verbatim)
Ashwin's overnight queue prompt, copied word for word. Spanish fix and D1–D3 are done (section 14); continue with Task C, then A, B, D4 and Finish (the prompt's order is A first; Ashwin's later instruction put C right after the Spanish fix since it's small). Same working rules, gates and git commands.

```text
Overnight queue: one plan for the rest of the night. Work continuously and as fast as you can WITHOUT lowering quality: no skipped tests, no shortcuts on design, accessibility or correctness. Speed comes only from the efficiency rules below.

When the current Spanish fix is done, don't stop for a redeploy: commit, push, and go straight into Task A.

WORKING RULES
- Git: after each task's gate passes, commit and push to dev yourself, without asking me. Use: git pull origin main --no-edit, then git pull --rebase --autostash origin dev, then git push origin dev. Never force-push. Never push to or merge into main. Never stage .claude/settings.json (I changed a permission locally). Don't deploy or run gcloud.
- Gate after each task: npm test, npm run lint, npm run build, e2e (EN 5/5 plus the ES e2e), and axe 0 violations for every theme and language the task touched, at 375 and 1280 px.
- Efficiency (no quality trade-off):
  - UI-only gates (Tasks B and C) run e2e and axe in demo mode (MOCK_AI=1). Anything touching the AI path runs live.
  - Run the full evaluation once at the end, 2–3 requests in parallel under the rate limit.
  - Start Task D1–D3 (docs only) right away in parallel subagents; they must not edit app code.
  - Time-boxes are maximums. Move on as soon as a gate passes.
- If a task can't pass its gate within its time-box, revert only that task's commits and record why. If you need a decision from me, write it under "Morning questions" in PLAN.md, take the safest option or skip that part, and keep going.
- Never invent data, sources, quotes or legal claims. Verify every statute, license or factual claim against an official source before it goes in.

TASK A: real-world inputs (≤ 50 min)
Real users won't paste neat listings. Build scripts/eval/messy.jsonl (about 20 synthetic, labelled items) and make the app handle them gracefully:
- One-line questions ("is $600 for a room near VT normal?", "landlord wants zelle before i see it, is that ok"), partial listings with no price or ZIP, emoji/caps/typos, copy-paste junk (nav text, "Reply", timestamps), and a chat screenshot.
- Spanish as people actually type it: missing accents ("deposito", "dueno"), Spanglish ("el landlord quiere el deposit por Zelle"), abbreviations (q, xq, tmb), regional words (renta/alquiler, depósito/fianza/garantía, dueño/casero/arrendador), number formats ("$1.650", "1650 al mes").
Fixes:
(1) If the input isn't a listing, message or lease (e.g. a general question), don't show empty verdicts. Show a short helpful state: what we can check and what to paste, plus the matching FTC tip if a red flag is mentioned (from our rule text only, never model-written advice).
(2) Quote verification ignores accents, case and whitespace (Unicode NFD, strip diacritics).
(3) Rent parsing handles those number formats.
(4) The extraction prompt lists the Spanish/Spanglish vocabulary.
Don't tune to individual items.

TASK B: dark theme (≤ 75 min)
- Follows the system setting by default, plus a Light/Dark toggle next to EN/ES (real buttons, aria-pressed, saved in localStorage with try/catch). Set data-theme before first paint with a tiny inline script (no flash), and set CSS color-scheme so form controls and scrollbars match.
- Keep the inspection-report identity: carbon paper at night, NOT "near-black + one acid accent", which docs/design-principles.md bans. Define dark values for every token (paper, sheet, ink, ink-soft, pen, rule, ok/warn/stop/none inks and tints, focus ring). Text ≥ 4.5:1; large text and UI parts ≥ 3:1. Compute the ratios and add a dark token table to design-principles.md. Stamps stay legible with the rough-ink filter.
- Google Map: use the API's dark color scheme if it works with our Map ID setup (verify in the installed @vis.gl/react-google-maps types/docs); otherwise keep the light map with a border. Never invert photos or sample images.
- Save Playwright screenshots of both themes to docs/screenshots/dark/.

TASK C: small polish (≤ 30 min)
- Make the "Read by Gemma 4 (model ID) in N s" line a link to "What Gemma read" (keyboard-focusable; move focus to that heading).
- Add a "Copy these questions" button under "Questions to ask before you sign": it copies a short, polite message to the landlord with the numbered questions, in the current language, with an aria-live "Copied" and a fallback if the clipboard is blocked.
- Change the tagline to "For renters in Virginia, DC and Maryland" (ES too).

TASK D: open-source readiness (≤ 60 min)
D1. Verify Gemma 4's actual license from Google's official Gemma pages. Fix README/docs if "Apache 2.0" is wrong. Describe it precisely ("open weights under <license>"), link it, and link where to download the weights.
D2. Add CONTRIBUTING.md (setup, tests, eval, how to add a state rule sheet), CODE_OF_CONDUCT.md (Contributor Covenant), and THIRD_PARTY_NOTICES.md from our dependency licenses. Flag anything incompatible with Apache-2.0. Note that HUD and Census data are US government works.
D3. docs/code-tour.md: a 5-stop walkthrough (input and redaction → Gemma extraction with schema and injection defense → quote verification → TypeScript rules → report), with file paths and line ranges. It doubles as the video's code-walkthrough outline.
D4. Self-hosted model path: add GEMMA_PROVIDER=gemini|ollama (OpenAI-compatible endpoint, GEMMA_BASE_URL, GEMMA_MODEL). Gemini stays the default, and its behavior must stay unchanged. If Ollama is installed or installable with Homebrew and a Gemma 4 model exists in the Ollama library, pull the smallest one that fits this Mac and run the 5 samples through it. Report honestly what works (it may be slower or miss flags). Otherwise implement the switch and label it untested. Update the README self-host section with the real result.

FINISH
1. Run the full evaluation live (easy, hard, holdout, student, messy, leases) and update docs/evaluation.md and the README tables.
2. Final gate on the production build: live mode, light and dark, EN and ES.
3. Write docs/morning.md: what changed (with commit hashes), current eval numbers, a 5-minute hand-check list, open questions, and the exact commands to deploy and to merge dev into main.
4. Push dev, then stop.
```

## 16. Decisions and why (Ashwin, tonight)
- **Kept the idea, no pivot.** Similar tools exist (rental-scam browser extensions, AI lease reviewers). Our edge: verified quotes, real HUD/Census numbers, state-law rules with citations, prompt-injection defense, screenshots and Spanish, and an honest evaluation against a keyword baseline. **Never claim "first" or "only".**
- **"Why not just ask Gemini?"** No prompt needed (paste or screenshot); the same checks every time; real local numbers; every claim quoted and verified; can't be talked into "safe"; redaction before sending.
- **The name stays Clearlease** (possible tagline: "see clearly before you sign").
- **No visual redesign.** Keep all 5 samples: judges need one-click paths, and the injection sample shows the guardrails live. Dark theme and small polish only.
- **Dropped a "No Section 8 / vouchers" fair-housing feature** because the legal details (small-landlord exemptions, MD and DC specifics) weren't verified. Roadmap slide only.
- **Maps `IntersectionObserver` error: option (a)**, accepted and documented (`docs/accessibility.md`). It only happens on referrers the Maps key doesn't allow.
- **Fun-UI ideas considered but not queued:** a scanner sweep over the lease photo during the wait, and Rough Notation hand-drawn highlights (license unverified). Optional, only if everything else is done.
- **MLH track not decided.** We qualify for Gemma 4, Open-Source AI, Google Cloud and UI/UX; score all four in the morning before picking. Lean: **Gemma 4**. Open-Source AI becomes a contender if the self-hosted Gemma path (D4) actually works.

## 17. Morning plan (before the 9:30 AM freeze)
1. Ashwin reads `docs/morning.md` (written by the Finish step), deploys from `dev` (**only Ashwin deploys**), runs `node scripts/e2e.mjs https://clearlease-477820387862.us-east4.run.app`, then merges `dev` into `main`.
2. Ashwin gives Yoshwan **Editor** access on the `clearlease-error404` Google Cloud project, if not done yet.
3. At the venue: the 3-person usability test, student quotes (`docs/validation.md`), and a native Spanish speaker's skim of the ES UI.
4. A side-by-side screenshot of the Gemini app vs. Clearlease on the same real listing. **Only report what actually happens.**
5. Record the video from a **live** run, not a "saved result" fallback (the report header says "Showing a saved result" when that happens; re-run if so).
6. Pick the track (section 16), then submit on **MLH OrganizerHQ** and **codingjam.dev** by **11:00**. After submitting, **rotate the API keys**.

## 18. Notes for Yoshwan's session
- **Env var names** (values live in `.env` / `.env.local`; never read, print or commit them): `GEMINI_API_KEY` (the only required one), `HUD_TOKEN`, `CENSUS_KEY`, `COMMUNITY_SALT`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`, `GEMMA_MODEL`, `MOCK_AI`, `RATE_LIMIT_PER_MIN`, `FIRESTORE_DATABASE_ID`. D4 would add `GEMMA_PROVIDER` and `GEMMA_BASE_URL`.
- **Run things:**
  - Dev server for checks: `RATE_LIMIT_PER_MIN=1000 npm run dev` (local only; never set this on Cloud Run).
  - Production build check: `npm run build && PORT=3100 RATE_LIMIT_PER_MIN=1000 npm start`. Note: the Maps key rejects port 3100, so the map shows "couldn't load" there (expected).
  - English e2e: `node scripts/e2e.mjs http://localhost:3000` (5 samples).
  - Spanish e2e: `node scripts/e2e-es.mjs http://localhost:3000` (add `--report` to list without failing).
  - axe: `node scripts/a11y.mjs http://localhost:3100` and `... --lang=es`. It also fails on uncaught page errors.
  - UI-only gates may use demo mode: `MOCK_AI=1 npm run dev`.
- **Eval:** `node scripts/eval/run.mjs <runName> [url] [--holdout] [--set=easy|hard|student] [--kind=lease]`. Results go to `scripts/eval/results/`; write-ups to `docs/evaluation.md`.
  - The 10 holdout items are only shown with `--holdout`; never use them to tune.
  - `scripts/eval/baseline-keywords.json` is **frozen**; never edit it.
  - Never tune prompts or rules to individual items.
- **Maps key** only allows `http://localhost:3000` and the run.app URL.
- **Use `npm ci`, not `npm install`.** `npm install` on Ashwin's Mac strips `libc` fields from the lockfile. axe-core was added as a one-line devDependency change.
- **Your `stash@{0}` (tag restyle) is outdated; don't pop it.** `Report.tsx`, `Checker.tsx` and `globals.css` changed a lot; re-implement from the screenshots if you still want it.
- **Gemini free tier occasionally fails** (we saw intermittent 400/500s tonight). The app retries, and for the built-in samples shows a labelled saved result ("Showing a saved result"). e2e counts "saved" as a FAIL, so re-run once before concluding anything.
- **Git:** `git pull origin main --no-edit`, then `git pull --rebase --autostash origin dev`, then `git push origin dev`. Never force-push, never push to or merge into `main` (Ashwin merges), never stage `.claude/settings.json`.
- **Open questions:**
  - Census API notice: add to the report footer (suggested in Task C)? It's required by the Census API terms if live Census data is used.
  - LGPL `sharp-libvips` in the Docker image: just keep the notices with any distributed image (no action for the source repo).
  - Refresh `docs/code-tour.md` line numbers before the video.
  - MLH track choice (section 16).

