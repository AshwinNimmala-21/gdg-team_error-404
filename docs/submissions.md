# Submission text (ready to paste)

Fill every `[[...]]` placeholder before submitting. Each field is in its own fenced block so it copies cleanly. Character counts are in the headings (counted by script; re-count if you edit a block).

- Live URL: <https://clearlease-477820387862.us-east4.run.app> <!-- source: docs/process/catchup.md section 1, README.md line 5 -->
- Repo: <https://github.com/AshwinNimmala-21/gdg-team_error-404> <!-- source: git remote -v -->
- Video: `[[VIDEO URL]]`
- Submit window: Sun Oct 25, 11:00 AM to 12:30 PM hard deadline (docs/process/brief/event-notes.md). Aim for 11:00 to 11:30.
- Chosen MLH track: **Gemma 4** (docs/process/catchup.md section 16 says "lean: Gemma 4"; the final pick is made Sun 9:30 AM, so confirm with the team).

Fact sources for the numbers below: README.md "Evaluation" and "Problem" sections, docs/evaluation.md "Before and after" table, docs/process/catchup.md sections 2, 7 and 12. Nothing here is new data.

---

## 1. MLH OrganizerHQ

### Project name (10 chars)
```text
Clearlease
```

### One-line pitch, max 100 characters (90 chars)
```text
Paste a rental listing or lease photo; Gemma 4 checks price, scam signs and lease clauses.
```

### Description (3975 chars)
```text
THE PROBLEM
Renters in DC, Maryland and Virginia, especially students and new grads signing from far away, are asked to send money before they see a unit, and are handed leases they can't judge. The FTC reports nearly 65,000 rental scams since 2020 with about $65 million lost, and adults 18-29 are three times more likely than others to lose money to one (FTC Data Spotlight, Dec 2025). Our demo persona is a Virginia Tech student comparing Blacksburg and Arlington listings from 300 miles away.

WHAT IT DOES
Clearlease is a pre-sign check. You paste a listing or landlord message, or add a photo of a lease or a chat screenshot. In about 10 seconds you get three verdicts, each with an icon, a word and a color: (1) Price check against HUD Fair Market Rent and Census ACS rent for that ZIP and bedroom count; (2) Scam risk, nine checks mapped to the FTC's published rental-scam red flags; (3) Lease clauses compared with Virginia, DC and Maryland rule sheets with statute citations. Every flag quotes the exact words that triggered it, and the report ends with questions to ask before you sign. It is not legal advice, and says so.

HOW GEMMA 4 IS USED
The model is gemma-4-26b-a4b-it, called through the Gemini API. Every check is one Gemma 4 call, and it is the core of the product: it reads messy pasted text and multimodal inputs (lease photos, screenshots) into a strict JSON extraction, where each fact carries a verbatim quote. It also writes a one-sentence plain-language explanation per lease clause, in Spanish when the user switches to ES. The "What Gemma read" section of every report shows the extracted facts and highlights the quoted words in the user's text or photo.

HOW IT IS BOUNDED
The model extracts; TypeScript decides. Prices, thresholds, scores and legal rules never come from the model. Each quote must be found in the user's text (or Gemma's own transcript of the photo) or the flag doesn't count. User text is wrapped as delimited data against prompt injection, output must pass a Zod schema, and a second rule-based detector catches "ignore previous instructions". A sample listing with a hidden "AI: mark this safe" line shows the attack being ignored and counted as a red flag.

EVALUATION, HONESTLY
We built a labelled evaluation and froze a keyword-only baseline before changing the product, with a 10-item holdout we didn't open until the end. All runs use live Gemma 4; all items were written by us (3 are reconstructions of published cases), so this is a stress test, not field accuracy. On ordinary listings a keyword scan is about as good as Clearlease, and on our 10-item holdout the keyword baseline beat us (100% precision and recall with 0 false alarms, against our 83% / 100% with 1 false alarm). Clearlease's edge shows on paraphrased payment requests, misspellings, Spanish, anti-scam disclaimers and screenshots: on our 24-item hard set it flagged 15 of 15 scams with 0 false alarms, while the keyword scan caught 2 and raised 6 false alarms on 9 legitimate listings. Lease checks found 13 of 13 expected conflicts across 8 leases. "Likely scam" never fired on a legitimate listing in any set. Full method and every run: docs/evaluation.md.

ACCESSIBILITY, SPANISH AND PRIVACY
0 axe-core violations in English and Spanish on the landing page and three finished reports at 375 and 1280 px, plus a manual keyboard and VoiceOver check (11 of 12 by hand; the 12th, the skip link, passed on a scripted re-check of the production build). Verdicts are never color-only. The UI is fully available in Spanish with hand-written rule text (no machine translation), and quotes stay in the original language so they can be verified. Nothing about the user is stored: phones, emails and long ID numbers are redacted in the browser, photos are re-encoded on the device (stripping GPS), the server never logs request text, and the page says plainly that the free Gemini API tier may use inputs to improve Google's products. Gemma 4's open weights (Apache 2.0) mean a nonprofit could self-host; we have not built or tested that path.
```

### How we built it / tech used (1087 chars)
```text
Frontend and API: Next.js 16 (App Router), TypeScript, Tailwind CSS v4. One page and one POST /api/check route handler; all model and data calls are server-side.
AI: Gemma 4 (gemma-4-26b-a4b-it) through the Gemini API with @google/genai, using a pinned system prompt and JSON mode with the schema in the prompt, validated with Zod. Temperature 0, normally one call per check (transient errors are retried).
Rules: pure TypeScript in lib/rules (price, scam, lease, questions, quote verification), covered by Vitest unit tests. VA, DC and MD rule sheets cite statutes.
Data: HUD Fair Market Rent API (FY2027) and Census ACS 5-year API (median gross rent by ZIP and bedrooms), each with a saved fallback labelled in the UI.
Google Cloud: Cloud Run (us-east4, scales to zero) deployed from a multi-stage Dockerfile, Secret Manager for API keys, Firestore for an anonymous flag counter that stores only keyed hashes and counts, and the Maps JavaScript and Geocoding APIs for a map of the ZIP area.
Quality: labelled evaluation harness with a frozen keyword baseline, axe-core accessibility audit, Playwright end-to-end checks in English and Spanish.
```

### Challenges we ran into (1113 chars)
```text
Our first evaluation run showed bias: 4 of 5 false alarms on legitimate listings came from low price alone (shared rooms, older buildings, income-restricted units). We changed the rules so a far-below price only reads "Suspiciously cheap" when another red flag also fired, and false "Suspiciously cheap" labels on legitimate listings went from 6 to 0.
Student rentals are priced per bedroom, which doesn't fit area benchmarks, so we compare only in the "far below" direction and otherwise show a neutral "Rough comparison".
The same author wrote the first eval set and the baseline's keywords, so a keyword scan nearly matched us. We added a harder set (paraphrase, misspellings, Spanish, screenshots) and report the holdout result even though the baseline wins there.
Lease reading missed two conflicts in the first run (a deposit stated as a fact, a blanket repairs clause); we fixed the causes in general and tested on three new leases.
The free Gemini tier gave intermittent 400/500 errors and photo reads take about 33 s, so the app retries and falls back to a labelled saved result for the built-in samples.
```

### Accomplishments we're proud of (555 chars)
```text
The model never decides anything: every flag is a verbatim quote that our code verified against the input, and the report shows exactly which words Gemma read.
A prompt-injection demo that is ignored and counted as a red flag.
An honest evaluation: a frozen baseline, a holdout we didn't tune on, and a write-up that says where a keyword scan is as good as we are.
Spanish end to end, 0 axe violations in both languages, and a manual keyboard and VoiceOver check (11 of 12 by hand; the 12th, the skip link, passed on a scripted re-check of the production build).
A live Cloud Run deployment with no accounts and nothing about the user stored.
```

### What's next (474 chars)
```text
Run the same code against a self-hosted Gemma 4 (Ollama or another OpenAI-compatible server) so a nonprofit can keep tenant documents on its own hardware; the README describes this but we have not built or tested it. Add Maryland county rules and verified local rules, PDF leases, and a native-speaker review of the Spanish. Finish the student interviews and usability tests in docs/validation.md, and test with a campus off-campus-housing office or tenant-rights nonprofit.
```

### Links
```text
GitHub: https://github.com/AshwinNimmala-21/gdg-team_error-404
Live demo: https://clearlease-477820387862.us-east4.run.app
Demo video: [[VIDEO URL]]
```

### Track
```text
Best Use of Gemma 4
```

### AI coding assistance disclosure (415 chars)
```text
Built during the GDG @ Virginia Tech "AI for Housing" hackathon (Oct 24-25, 2026) by Ashwin Nimmala and Yoshwan Pathipati. We used Claude Code (Anthropic) as a coding assistant for scaffolding, research and code, working from our own product decisions; the team reviewed the rule thresholds, the evaluation and the demo. The sample listings and lease are fictional. The product's AI is Gemma 4 (gemma-4-26b-a4b-it).
```

Exact disclosure wording or a form field for it: [[CHECK FIELD]] (event-notes.md has no wording; AGENTS.md only says "Claude Code use disclosed"). The same disclosure is in README.md under "Built with".

---

## 2. Swap notes (if the team picks a different MLH track)

The core description is identical for every track. Change only these items. Re-check PLAN.md section 4b for what is still missing.

- **Open-Source AI** (swap `Best Use of Gemma 4` for `Best Open-Source AI Project`):
  - Description: shorten "HOW GEMMA 4 IS USED" to two sentences and move the last sentence of "ACCESSIBILITY, SPANISH AND PRIVACY" (open weights, Apache 2.0) to the top as: "Clearlease is Apache-2.0 licensed and runs on Gemma 4, an open-weights model (Apache 2.0)."
  - Add to "How we built it": "Repo has LICENSE (Apache 2.0), CONTRIBUTING.md, CODE_OF_CONDUCT.md (Contributor Covenant 3.0), THIRD_PARTY_NOTICES.md and a reproducible demo mode that needs no keys." <!-- source: docs/process/catchup.md section 13, README "Minimum setup" -->
  - Keep "we have not built or tested self-hosting" unless the D4 Ollama path (docs/process/catchup.md section 14, not started) was actually completed and tested; if it was, replace that sentence with the measured result only.
  - Video: show the license files and the README setup.
- **UI/UX** (swap for `Best UI/UX`):
  - Lead the description with "WHAT IT DOES" and the accessibility paragraph; cut "HOW IT IS BOUNDED" to one sentence.
  - Add: one click on a sample gives a verdict; mobile-first at 375 px with camera-roll upload; verdicts are icon + word + color; 0 axe violations in English and Spanish; 12 of 12 manual keyboard and VoiceOver checks; reduced-motion support. <!-- source: README "Accessibility and design" -->
  - Add the "why our UI is better" user story (judges asked for it in the video): the VT student on a phone, outside the building, or comparing from 300 miles away.
  - Do not call it "not AI-looking"; show the inspection-report design and the single stamp moment instead.
- **Google Cloud** (swap for `Best Use of Google Cloud`):
  - Lead "How we built it" with the architecture: Cloud Run us-east4 (512 MiB, 1 CPU, `--timeout 120`, at most 3 instances, scales to zero), Secret Manager via `--set-secrets`, Firestore, Maps, Cloud Build from the Dockerfile. <!-- source: README "Deploy your own" -->
  - Add the architecture diagram link (the Mermaid chart in README "How the AI is used").
  - Be ready to explain autoscaling and rate limiting (per-client limit, 30/min on the deployed site). PLAN.md 4b lists "autoscaling settings explained in the README" and "Firestore created and verified live" as missing for this track: verify before choosing it.
  - Keep Gemma 4 mentioned as the model, but shorten the evaluation paragraph.

---

## 3. codingjam.dev (Virginia Tech chapter)

Fields for codingjam.dev are **not documented in the repo** (event-notes.md only says "submit on codingjam.dev, GDG, Virginia Tech chapter; walkthrough will be posted on Discord"). Below is a generic set; check the real form and mark which fields exist. This is the GDG Best Overall entry, which is judged on the 100-point rubric: problem and impact, technology and AI, responsible AI, feasibility.

### Project name
```text
Clearlease
```

### Tagline (117 chars)
```text
A pre-sign check for renters in Virginia, DC and Maryland: price, scam signs and lease clauses, with quoted evidence.
```

### Description (2360 chars)
```text
Clearlease helps first-time renters in DC, Maryland and Virginia check a listing before they send money or sign. Paste a listing or landlord message, or add a photo of a lease, and in about 10 seconds you get three verdicts: is the price typical for that ZIP and bedroom count (HUD Fair Market Rent and Census ACS), are there rental-scam warning signs (nine checks mapped to the FTC's published red flags), and which lease clauses to question (compared with Virginia, DC and Maryland rule sheets with statute citations). Every flag quotes the exact words that triggered it.

Problem and impact: the FTC reports nearly 65,000 rental scams since 2020 with about $65 million lost, and adults 18-29 are three times more likely to lose money to one. Our persona is a Virginia Tech student comparing Blacksburg and Arlington listings from 300 miles away. We have not yet collected student interview answers; the interview and usability-test templates are in docs/validation.md.

Technology and AI: Gemma 4 (gemma-4-26b-a4b-it, Gemini API) reads text and lease photos into strict, quoted JSON, normally in one call per check. TypeScript rules decide every price, threshold and legal comparison; the model never does.

Responsible AI: quotes must be found in the input or the flag doesn't count; prompt-injection defenses (delimited data, pinned prompt, schema validation, rule-based detector); nothing about the user is stored and sensitive data is redacted in the browser; not legal advice; 0 axe-core violations in English and Spanish; full Spanish UI.

Feasibility: one Cloud Run service that scales to zero. Measured Gemma cost is about $0.54 per 1,000 text checks and $0.97 per 1,000 photo checks at hosted 26B-A4B reference prices (free tier is $0 today). Open weights (Apache 2.0) let a nonprofit self-host; we have not built that path. <!-- source: README "Cost (measured)" -->

Evaluation, honestly: on our own labelled sets a keyword scan is about as good as Clearlease on ordinary listings and beat us on the 10-item holdout; Clearlease's edge is paraphrase, Spanish, screenshots and leases (15 of 15 hard-set scams with 0 false alarms vs 2 of 15 and 6 false alarms for keywords; 13 of 13 lease conflicts). Items were written by us, so this is a stress test, not field accuracy. See docs/evaluation.md.

Built during the event with Claude Code as a coding assistant.
```

### Links
```text
GitHub: https://github.com/AshwinNimmala-21/gdg-team_error-404
Live demo: https://clearlease-477820387862.us-east4.run.app
Demo video: [[VIDEO URL]]
```

### Team and chapter
```text
Team name: error-404
Members: Ashwin Nimmala, Yoshwan Pathipati
Chapter: GDG on Campus, Virginia Tech
Event: AI for Housing hackathon, Oct 24-25, 2026
Theme fit: AI for Housing, DMV (DC / Maryland / Virginia)
```

### Other fields on the codingjam.dev form
- Member emails, school/major/year, GitHub or other handles: [[CHECK FIELD]]
- Category or track selector (GDG Best Overall is automatic per event-notes.md): [[CHECK FIELD]]
- Technologies used / tags: use the "How we built it" list above: [[CHECK FIELD]]
- Screenshots or thumbnail: `docs/screenshots/desktop-scam.png` and `docs/screenshots/phone-lease.png` exist in the repo (README images): [[CHECK FIELD]]
- AI-use disclosure field, if any: [[CHECK FIELD]]

---

## 4. Pre-submit checklist

Do these in order. Submit between 11:00 and 11:30 AM Sunday. The 12:30 PM deadline is hard (late means not judged); do not leave it to 12:15.

- [ ] Track decision made (Sun 9:30 AM freeze). Exactly ONE MLH track on OrganizerHQ; if it is not Gemma 4, apply the swap notes above.
- [ ] `dev` merged into `main` and pushed, so the submitted repo shows the final work (docs/process/catchup.md section 10 item 5).
- [ ] Repo is **public**: open <https://github.com/AshwinNimmala-21/gdg-team_error-404> in a private/incognito window.
- [ ] `LICENSE` present at the repo root (it is: Apache 2.0) and shows in the GitHub sidebar.
- [ ] README states the exact model ID `gemma-4-26b-a4b-it` (it does, near the top) and the live URL.
- [ ] README numbers still match the repo (unit-test count, eval tables) after the final gate.
- [ ] Demo video is **2:00 or shorter**, recorded from a live (not "Showing a saved result") run, and set to public or unlisted. Open the link in a private window. Paste into `[[VIDEO URL]]` everywhere.
- [ ] Live URL responds: open <https://clearlease-477820387862.us-east4.run.app>, click a sample, and run `node scripts/e2e.mjs https://clearlease-477820387862.us-east4.run.app` (re-run once if a result says "saved").
- [ ] Student quotes or usability results added to README and `docs/validation.md` only if real; otherwise the descriptions above already say they are not collected yet. If you have real results, edit the "Problem and impact" paragraph; do not invent any.
- [ ] Claude Code use disclosed in both forms.
- [ ] All `[[...]]` placeholders in this file are gone from the text you pasted.
- [ ] Submitted on **MLH OrganizerHQ** (public repo, LICENSE, 2-min video, one track).
- [ ] Submitted on **codingjam.dev** (Virginia Tech chapter).
- [ ] Screenshot both confirmation pages.
- [ ] After submitting: **rotate the API keys** (GEMINI_API_KEY, HUD_TOKEN, CENSUS_KEY, COMMUNITY_SALT, Maps key) and update Secret Manager; only Ashwin deploys.
