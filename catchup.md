# Catch-up for Yoshwan: everything since your handoff (Sat 9:15 PM → Sun 1:30 AM)

Written by Ashwin with Claude Code. Your handoff commit was `c5c8adc`; your last commits after it were `0d0ff70` (owner relocating *to* a place still counts as away) and `bde37c3` (log invalid-output step-downs). Everything below came after those.

## TL;DR
- **All work is on branch `dev`, pushed. `main` is unchanged since your last commit (`bde37c3`).** `dev` contains all of `main` plus about 20 commits from tonight (82 files, about 6,300 lines added).
- **Your stashed tag restyle (`stash@{0}`) will conflict** with tonight's changes to `components/Report.tsx` and `app/globals.css`. Details in "Merge notes" below.
- Gate on the final commit: **81 unit tests pass**, lint clean, `npm run build` OK, `node scripts/e2e.mjs` **5/5 PASS live**, axe-core **0 violations** (English and Spanish).
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
  - **Still English:** the long price explanation, legal reasons and evidence. The report footer says so in Spanish.
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
