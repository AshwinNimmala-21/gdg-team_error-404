# LLM council report: what to change in the next 12 hours

Sat Oct 24 2026, 6 PM. Covers the 12 hours until Sun 6 AM. Feature freeze is Sun 9:30 AM, and submission closes at 12:30 PM.

**Question:** "What should team error-404 change in the next 12 hours to maximize the odds of winning GDG Best Overall (rubric in AGENTS.md) and one MLH track?"

**Method**
- **Stage 1:** four members answered independently and in parallel.
- **Stage 2:** each member ranked the other three answers, relabelled W/X/Y/Z at random.
- **Stage 3:** the chairman synthesized the result and re-checked every claim the plan depends on.

The review was read-only. The only files written are this report and `docs/screenshots/council-review/`. No code was changed, nothing was committed, and nothing was sent to `/api/flag`.

| Member | Model | Role |
|---|---|---|
| A | fable | Hackathon judge: rubric scorecard and placement |
| B | opus | Product and pitch strategist: story, 2-minute demo, wow moment |
| C | sonnet | Skeptical engineer and security reviewer: what breaks live, grounding, privacy, deploy |
| D | opus | Designer and accessibility expert: UI/UX track, mobile, WCAG, AI-look check |

## Bottom line

The product is top-3 material, but the project can't be judged yet.
- The GitHub repo is **private**.
- There is no deployed URL and no video.
- `docs/validation.md` is empty.
- 3 of 11 live Gemma calls failed during this review.

None of these is a feature problem. Fix logistics and reliability tonight, gather student quotes before people go to sleep, and record the video on the live URL tomorrow morning. Don't build new features.

## Evidence the chairman collected

**Screenshots:** live mode, `gemma-4-26b-a4b-it`, live HUD and Census data. Each sample was run on a fresh page. The files are in `docs/screenshots/council-review/`.

| Sample | 375 px | 1280 px | Stamps (Price · Scam · Lease) |
|---|---|---|---|
| 1 Arlington 1-bedroom | OK, 10.2 s | Failed, then OK on retry (10.2 s) | Typical · No red flags found · No lease yet |
| 2 Facebook deal | OK, 11.9 s | OK, 12.0 s | Suspiciously cheap · Likely scam · No lease yet |
| 3 Photo of a lease page | OK, 34.2 s | OK, 34.4 s | Typical · No red flags found · Fix before signing |
| 4 Hidden AI instructions | OK, 12.0 s | Failed, then OK on retry (11.9 s) | Suspiciously cheap · Likely scam · No lease yet |

Failures showed "We couldn't reach the AI model" (`1280-sample1-error.png`, `1280-sample4-error.png`). Counting an earlier run, **3 of 11 live calls failed**. Neither width overflows horizontally. The repo's `scripts/screenshots.mjs` crashed on the first failure, so the chairman used a retrying copy in the scratchpad.

**Claims the chairman checked directly:**
- **Repo visibility:** `gh repo view` reports `AshwinNimmala-21/gdg-team_error-404` as **PRIVATE**, with an Apache-2.0 license detected.
- **Root cause of the failures:** `lib/ai/gemma.ts` creates one `AbortSignal.timeout` for all attempts (`:74`). It keeps a process-wide `workingLevel` that only moves down (`:22`, `:88`). An `ApiError` other than 400 or 429, or a network error, throws `model_failed` on the first try (`:101`, `:108`).
- **Deploy settings:** `docs/DEPLOY.md:96` uses `--timeout 60 --max-instances 3` and sets no `--min-instances`.
- **False reassurance:** `lib/client/verdicts.ts:25` shows the green "No red flags found" stamp whenever the status is `none_found`, even when only a lease was given.
- **Sample 4 over-flag:** `public/samples/injection.txt:4` says "Owner is relocating for work", and `1280-sample4.png` counts it as the weight-2 "owner out of town or overseas" flag.
- **Contrast claim:** `README.md:103` claims "5.7:1 or higher on every pair". D measured 4.77:1 and 4.82:1, caused by the `opacity-80` and `opacity-90` classes.
- **Free-tier honesty:** the README already states that Google may use free-tier inputs (`README.md:95`), so C's privacy concern is mostly handled.
- **Docker:** a local build already happened (PLAN.md status line 14), so C's "run docker build" item is done.
- **Git history is clean of secrets:** no `AIza…` keys, no HUD JWTs and no committed `.env` files in any commit. The only `KEY=` matches are Secret Manager references such as `GEMINI_API_KEY=GEMINI_API_KEY:latest`.
- **Judging format:** per `docs/brief/event-notes.md:36-38`, judging works from the 2-minute video and the README. The Open-Source AI judges gave "AI scam detector for leasing" as their own example idea (`:26`).

**Uncommitted work:** `components/Report.tsx`, `app/globals.css` and the untracked `components/VerdictTags.tsx` are another session's in-progress work. This review doesn't touch them.

## Stage 1: each member's top 3 (raw answers in Appendix B)

| Member | #1 | #2 | #3 |
|---|---|---|---|
| A (judge) | Make the repo public | Deploy and put the URL in the README | 3–5 student answers in `validation.md` |
| B (pitch) | Interview 6–8 VT students tonight | Retry on 5xx and network errors | Deploy |
| C (engineer) | Fix retries, timeouts and the sticky downgrade in `gemma.ts` | Labelled recorded fallback for sample clicks | Deploy with `--min-instances 1`, `--timeout 120`, `RATE_LIMIT_PER_MIN=30` |
| D (design) | Retry, then a labelled recorded fallback for samples | Honest photo wait (about 30 s, "still reading") | Neutral scam stamp when only a lease was given |

## Stage 2: anonymous peer review (raw reviews in Appendix C)

Each cell shows rank, then accuracy/impact (1–10). Reviewers didn't rate their own answer.

| Answer (member) | by A | by B | by C | by D | Mean rank | Mean accuracy | Mean impact |
|---|---|---|---|---|---|---|---|
| W (B, pitch) | 1st, 8/8 | — | 2nd, 8/8 | 1st, 9/9 | **1.3** | 8.3 | 8.3 |
| Y (A, judge) | — | 1st, 8/9 | 1st, 9/10 | 2nd, 7/9 | **1.3** | 8.0 | **9.3** |
| Z (C, engineer) | 2nd, 9/6 | 2nd, 8/7 | — | 3rd, 9/7 | 2.3 | **8.7** | 6.7 |
| X (D, design) | 3rd, 8/4 | 3rd, 9/5 | 3rd, 8.5/6 | — | 3.0 | 8.5 | 5.0 |

**How the review changed things:**
- All three other members moved A's private-repo finding to the top.
- All four adopted C's diagnosis of `gemma.ts`.
- D, the most accurate on details, ranked last because its top 10 was entirely polish while the project still can't be submitted.
- Every revised top 3 now converges on the same three items:
  - a public repo and a deploy;
  - reliability fixes in `gemma.ts`;
  - student validation tonight.

**Peer corrections the chairman accepted:**
- **A, "13 of 13 signals caught on the samples":** that would be testing against our own answer key. Use held-out inputs instead (B, C).
- **A, "keep the sample buttons usable while loading":** this would race results onto the screen, because `Checker.tsx:76` blocks concurrent checks on purpose (D).
- **A, "only an sr-only status during the 33 s wait":** wrong. There is a visible loading panel (D).
- **B, "about $1 per 1,000 checks on Cloud Run":** this mixes token cost with hosting cost (C, D).
- **B, "+4–5 on problem definition from interviews":** the gain is on stakeholder empathy (1c) plus about 1 point on measurable impact (1b) (A).
- **B's mini-eval:** 20 live calls on a flaky shared key is the wrong priority tonight (A). See ruling 1.
- **C, add a README cost line:** it already exists (`README.md:80-89`) (A).
- **C, gate the lease `plain` text:** unverified clauses already show under "Not counted" (`lease.ts:96-108`, `Report.tsx:244`). Low value (A, B, D).
- **C, run a local `docker build`:** already done (chairman, PLAN.md).
- **D, the lease-only stamp in 0.3 h:** it needs `read.kinds` plumbed through the rules, so about 0.5 h (A).

## Disagreements and rulings

1. **Mini-eval of Gemma vs regex: B says do it (+4); A says it's a bad priority.**
   - **Ruling:** do a small version, and only after items 1–6.
   - Use 8 held-out inputs: 2 negations ("we never accept wire"), 2 paraphrases, 2 honest listings, 1 photo and 1 injection.
   - Run them locally against the existing `keywordExtract` (`lib/ai/mock.ts:179`), with `RATE_LIMIT_PER_MIN` raised. Never run them on the deployed URL.
   - This is the honest version of A's "impact line". AI necessity is the largest rubric line (15), and this is the only evidence for it beyond our own claims.
2. **Recorded fallback: D and C say ship it; C's peer review says it hides the failure rate.**
   - **Ruling:** ship both, in order. First the real retry fix (item 2), then the fallback (item 3).
   - The fallback applies only to sample clicks, never to user input, and always shows a visible label: "Gemma didn't answer in time; showing a recorded live reading from Oct 24."
   - Never let the demo mode badge appear in the video.
3. **Interviews vs reliability as #1: B and D put interviews first; A and C put repo, deploy and reliability first.**
   - **Ruling:** run them in parallel tonight. They have different owners, and interviews can only happen while people are awake. Ashwin starts texting at 6:15 PM, and Yoshwan works on `gemma.ts`.
4. **Privacy work: C says 0.5 h of fixes; A, B and D say it's mostly done.**
   - **Ruling:** a 10-minute wording pass only, folded into item 10:
     - redaction covers pasted text only;
     - photos are sent as they are, so cover names and signatures;
     - `Checker.tsx:288` says "dropped after the check", which sits next to the Google free-tier notice, so reword it to "we don't keep it; Google's free tier may";
     - mention the localStorage flag IDs.
5. **Map: D says move it or make it `inert`; A and B say don't touch it.**
   - **Ruling:** spend 15 minutes making it `aria-hidden` and `inert` and dropping `role="img"`. That fixes a real axe failure.
   - Leave it out of the video. Don't move it, and don't do any other map work.
6. **Lease-only scam stamp: D says fix it; nobody else saw it.**
   - **Ruling:** fix it. A green "No red flags found" on input that was never scam-checked is false reassurance. That is a safety-and-grounding flaw, the exact thing this rubric line punishes.
7. **The "relocating" over-flag: B and D found it.**
   - **Ruling:** tighten the `landlordAway` description in `lib/ai/prompt.ts`: moving for work isn't being unavailable to show the unit.
   - Rerun the 4 samples twice live. Revert if any expected stamp changes.
   - Don't edit the sample to hide the bug.
8. **MLH track:** see the next section. All four members say Gemma 4. D adds a conditional switch.

## The plan: 12 items, ranked

Effort is in hours. Risk is the chance the change itself breaks something.

| # | Change | Rubric points or track it moves | Effort | Risk | Owner |
|---|---|---|---|---|---|
| 1 | **Make the GitHub repo public** (the history scan is clean, see above). Confirm LICENSE and README render. | MLH eligibility (hard requirement), 4c documentation can't be read without it, Open-Source eligibility | 0.1 | Low | Ashwin (repo owner) |
| 2 | **Fix `gemma.ts` reliability:** retry the same level once on 5xx and network errors after 0.6–1 s; give each attempt its own timeout (about 40 s for photos); make `workingLevel` non-sticky (only after 2 consecutive 400s, or per request); read JSON after any thought preamble. Then 10 live sample runs in a row, with the result recorded in PLAN.md. | 2a AI necessity and 2b architecture (protects about 13 and 9 points), 4a, both tracks | 1.0 | Medium (core path; covered by the 10-run check and `scripts/e2e.mjs`) | Yoshwan |
| 3 | **Labelled recorded fallback for sample clicks** after the retry fails (`lib/server/check.ts:96-106` plus `SAMPLE_EXTRACTIONS`). The UI label says it's a recorded live reading. | Protects every judge click; 4a; UI/UX "effortless" | 0.5 + 0.25 | Low | Yoshwan (API), Ashwin (label) |
| 4 | **Deploy to Cloud Run tonight** per `docs/DEPLOY.md`, with `--timeout 120`, `RATE_LIMIT_PER_MIN=30`, and `--min-instances 1` from Sun 9 AM to 2 PM. Check the Maps referrer `https://*.run.app/*`, run `node scripts/e2e.mjs <URL>`, and put the URL on README line 1. | 4a nonprofit deployment +4 to +5, 2a +1, all tracks | 1.5 | Medium (gcloud is new on this laptop; first deploy) | Yoshwan (a human runs gcloud) |
| 5 | **5–8 VT student answers tonight**, using the 3 questions already in `docs/validation.md`. Add 2 quotes to the README and 1 to the video, plus "what we changed because of them". | 1c stakeholder empathy +4, 1b +1 | 1.0 (before 11 PM) | Low | Ashwin collects, Yoshwan logs |
| 6 | **Honest-UI bundle:** (a) photo wait copy "Photos take about 30 seconds" plus "Still reading…" at 20 s, with `Checker.tsx:100` fixed; (b) neutral "No listing to check" scam stamp when `read.kinds` has no listing or message; (c) remove `opacity-80/90` so README's 5.7:1 becomes true; (d) sample-aware error copy; (e) map `aria-hidden`/`inert`. | 3a safety +1, 3c WCAG +1, UI/UX | 1.0 | Low | Ashwin (UI); Yoshwan (`kinds` plumbing, 15 min) |
| 7 | **"What Gemma read" drawer:** the extraction JSON with quotes highlighted, plus model ID, tokens and latency. The data is already in `CheckResult.extraction` and `meta`. | Gemma track "show how the model is used", 2b +1 | 1.0 | Low | Ashwin |
| 8 | **Fix the "relocating" over-flag** in the prompt and rerun the 4 samples twice live (ruling 7). | 3a grounding (a careful judge would notice) | 0.5 | Medium (prompt change; revert on any regression) | Yoshwan |
| 9 | **Record the 2-minute video** on the deployed URL from B's script (Appendix B), plus one complete backup take. Show the model ID on screen twice, label the sped-up 34 s wait, add captions, and leave out the map and the counter. Script it tonight; record Sun 7–9 AM. | Required for MLH; carries every line (judges score from it); Gemma track | 2.5 | Medium (needs items 2–4 to hold) | Both (Ashwin edits, Yoshwan narrates) |
| 10 | **README pass:** B's 59-word opening, the URL, a stamp GIF, "Who runs this" (VT Off-Campus Housing, DC Office of the Tenant Advocate, legal aid, with cost per 1,000 checks), rewording self-hosting as a path rather than a feature, the privacy wording from ruling 4, the contrast claim, fresh screenshots once the design pass lands, and AGENTS.md/PLAN.md verdict words updated to match the UI. | 4c +1, 3b +1, 1a/1b clarity | 0.75 | Low | Yoshwan |
| 11 | **Held-out mini-eval** (ruling 1) with a README table: flags caught, false flags and quote-verified rate for Gemma vs regex. | 2a AI necessity +1, 1b measurable impact +2 | 1.5 | Low (local only) | Yoshwan |
| 12 | **Submission kit:** pre-write the MLH OrganizerHQ and codingjam.dev text (track, model ID, Claude Code disclosure, links), upload the video unlisted, and submit at 11:00 sharp, not 12:15. | Protects all 100 points (the 12:30 cutoff is hard) | 0.5 | Low | Both |

**Schedule**
- **Sat 6–8 PM:** items 1, 2 and 5 in parallel.
- **Sat 8–10 PM:** items 4 and 3.
- **Sat 10 PM–1 AM:** items 6, 7 and 8. Write the video script.
- **Sat 1–2 AM:** item 11 if there's energy, otherwise sleep.
- **Sun 7–9 AM:** item 9.
- **Sun 9–9:30 AM:** item 10, then freeze.
- **Sun 11:00 AM:** item 12.

**Not doing:** more map work, the community counter, Maryland local rules, a 31B retest, `mediaResolution` tuning, PDF upload, a local Docker build (already done), and keeping the sample buttons live while loading. **Optional only if everything above is done:** a "Copy these questions" button (B, D).

## Score now vs after the plan (chairman's estimate)

| Line | Max | Now | After | What moves it |
|---|---|---|---|---|
| 1a Problem definition | 10 | 9 | 9 | Already strong |
| 1b Measurable impact | 10 | 6 | 8 | Held-out eval (11), validation stat (5) |
| 1c Stakeholder empathy | 5 | 0 | 4 | Student answers (5) |
| 2a AI necessity | 15 | 12 | 14 | Reliability (2, 3), drawer (7), eval (11) |
| 2b Architecture | 10 | 8 | 9 | Retry design (2), deployed diagram becomes true (4) |
| 3a Safety & grounding | 10 | 8 | 9 | Lease-only stamp (6b), over-flag (8) |
| 3b Privacy | 8 | 7 | 7 | Wording only (10) |
| 3c Inclusive design / WCAG | 7 | 5 | 6 | Contrast fix plus a true claim, photo wait copy, map axe fix (6) |
| 4a Nonprofit deployment | 10 | 2 | 8 | Public repo (1), live URL (4) |
| 4b Inference cost | 8 | 7 | 7 | Already measured |
| 4c Documentation | 7 | 5 | 7 | Public repo (1), README pass (10) |
| **Total** | **100** | **69** | **88** | |

- **Now:** 69 if a judge could see it. As submitted today it scores close to zero, because a private repo with no video can't be judged.
- **After:** about 88. That likely places top 3 for GDG Best Overall, with a real chance at 1st. Members A and D agree on the ranking.
- **What would drop us a place:**
  - a live failure while a judge is clicking;
  - an empty `validation.md`;
  - a weak video.

## MLH track recommendation: Gemma 4 (decide now, don't wait until 9:30 AM)

**Why Gemma 4.** All four members recommend it independently.
- It matches what the Gemma judges said they want:
  - the exact model ID is already in the README, the code and the UI;
  - Gemma is the core of the product, not an add-on;
  - it reads multiple input types: lease photos are transcribed and turned into quoted JSON;
  - its output is schema-bound and quote-verified, and the model never decides a verdict;
  - injection handling is shown;
  - there is a reasoned MoE cost argument (26B-A4B, about 3.8B parameters active per token).
- Item 7, the "What Gemma read" drawer, shows exactly "how the model is used" in both the UI and the video.

**Why not the others:**
- **UI/UX (fallback):** D scores it 7.5/10, rising to 8.5. UI/UX judges weigh "effortless from the first click" most heavily, and a 34 s wait plus any error card costs the most there.
  - Switch only if Discord shows a crowded Gemma field at 9:30 AM **and** 10 live sample runs in a row succeed after item 2.
- **Open-Source AI:** tempting, because the judges' own example idea was "AI scam detector for leasing".
  - That also means several teams will build that exact idea.
  - Our self-host story is a sentence, not a code path.
  - A scores it 4/10.
- **Google Cloud:** we host on Cloud Run with Firestore and Secret Manager, but as plain infrastructure. It's a weaker story than Gemma, and the team decided not to enter it.

## Appendix A: anonymous label mapping

The mapping was drawn at random (`crypto.randomInt` shuffle) before Stage 2 and hidden from every member.

| Label | Member | Model | Role |
|---|---|---|---|
| W | B | opus | Product and pitch strategist |
| X | D | opus | Designer and accessibility expert |
| Y | A | fable | Hackathon judge |
| Z | C | sonnet | Skeptical engineer and security reviewer |

Each member reviewed the other three: A reviewed W, X and Z. B reviewed X, Y and Z. C reviewed W, X and Y. D reviewed W, Y and Z.

## Appendix B: raw Stage 1 answers

Verbatim, except that repo paths are shortened to be repo-relative and headings are demoted to fit this outline.

### Member A (fable): hackathon judge

#### 1. Rubric scorecard (GDG /100)

| # | Item | Pts | Current | Gap (what a judge can't see yet) | Fix | Effort |
|---|------|-----|---------|-----------------------------------|-----|--------|
| 1a | Problem definition | 10 | **9** — Maya, the Facebook wire-deposit moment, DMV scope (`README.md:3,17`) | Nothing. Page headline matches (`1280-empty.png`) | — | — |
| 1b | Measurable impact | 10 | **6** — FTC $65M/65k/median $1,000 and MD 51.5% cost-burden, both linked (`README.md:19-20`); "what we measure" (`README.md:23`) | No number the tool *moved*. Zero users, zero pilots. "Coffee per month" (`README.md:89`) is unsupported | Add a results line: "On the 4 samples: 13 of 13 FTC signals caught, 3 of 3 illegal VA clauses flagged, 0 false flags on the clean listing" + one validation stat | S |
| 1c | Stakeholder empathy | 5 | **0** — `docs/validation.md:11` "## Responses" is empty; README:25 admits "in progress" | No real human quoted anywhere | 3–5 texts to VT friends tonight, paste into validation.md, add "What we changed because of them" | M |
| 2a | AI necessity | 15 | **13** — Live lease *photo* read into quoted JSON with "From your photo, as read by Gemma" (`1280-sample3.png`); model ID in README:5, UI, `lib/ai/gemma.ts:5`; negation rule (`lib/ai/prompt.ts:11`) | Not shown in a video; 3 of 11 live calls failed (`1280-sample1-error.png`), which a judge will read as "AI doesn't work" | Deploy + video showing the photo read | L |
| 2b | Architecture | 10 | **9** — Mermaid (`README.md:49-65`), model-extracts/code-decides split (`lib/server/check.ts:110-117`), saved-data fallback, step-down ladder (`gemma.ts:76-110`) | No retry on `model_failed`; not deployed so "Cloud Run" box in the diagram is fiction today | One server-side retry; cache the 4 sample responses | M |
| 3a | Safety & grounding | 10 | **9** — Quote verification drops unverified flags; injection sample shows the banner *and* counts it (`1280-sample4.png`); 26 statute URLs in `lib/data/rule-sheets.ts`; "rule of thumb" labelled in UI; not-legal-advice footer + help links on every report | The 25% cut-off and "Likely scam" tier are invented; said so in UI, fine | — | — |
| 3b | Privacy | 8 | **7** — Client redaction, no storage, status-only logging (`gemma.ts:97-98`), honest free-tier notice (`components/Checker.tsx:291`), README:93-96 | README says "a nonprofit can self-host" but no code path exists (`GEMMA_BASE_URL` is a PLAN candidate only) | Document an Ollama/self-host env var or drop the claim | M |
| 3c | Inclusive design / WCAG | 7 | **6** — Skip link (`app/(ui)/page.tsx:16`), `aria-live` (`Checker.tsx:307`), reduced motion (`globals.css:158`), 375px clean (`375-sample3.png`), icon+word+color stamps | No recorded keyboard walkthrough; no Lighthouse/axe number; contrast "5.7:1" is self-reported | Run Lighthouse a11y once, paste score + a 6-step keyboard list in README | S |
| 4a | Deployment viability | 10 | **3** — Dockerfile + 146-line runbook (`docs/DEPLOY.md`) exist | **Repo is PRIVATE** (`gh repo view` → `"visibility":"PRIVATE"`). No URL. Needs 5 keys (Gemini, HUD, Census, Maps, Firestore), not "one key" | Flip to public; deploy; put URL at top of README | L |
| 4b | Inference cost | 8 | **7** — Measured token/latency table with MoE reasoning and source (`README.md:82-87`) | "$0 free tier" isn't a sustainable price; the $/1k figure is a secondary (Vercel) source, labelled | — | — |
| 4c | Documentation | 7 | **6** — Setup, API table, layout, Claude Code disclosure, screenshots exist (`docs/screenshots/desktop-scam.png`) | Judges can't read it: private repo. README screenshots predate the uncommitted design pass (`git diff --stat`: Report.tsx, globals.css) | Public + regenerate screenshots after commit | S |
| | **Total** | **100** | **75** | | | |

#### 2. MLH track fit (0–10; skill /5 in brackets)

- **Gemma 4: 8 (4/5).** Ticked: exact ID in README/code/UI; core (photo → quoted JSON); image + JSON schema + MoE cost argued; 26B/31B documented (`PLAN.md:338-341`, README:76-77, though "31B returned 400" is a weak benchmark). Unticked: no demo video.
- **UI/UX: 7 (4/5).** Ticked: one click to a verdict; inspection-report look, no rounded-SaaS tells (`1280-sample2.png`); a11y basics; stamp moment; not color-only. Unticked: 33 s photo wait with no staged progress; error card seen 3/11 times; no recorded walkthrough; no user story in a demo.
- **Open-Source AI: 4 (2/5).** LICENSE is Apache-2.0, Gemma license linked, README scannable. **Repo is private**, so none of it is visible; "self-host" is a claim without a code path.

#### 3. Predicted placement (15–30 teams)

As the repo sits right now it is **unsubmittable** (private repo, no URL, no video): 0 placement. If the three logistics items land, the product is top-3 material: the live lease-photo read with statute citations, quote-verified flags and the injection demo are stronger than what a typical 24-hour team ships, and the README already does the judge's work for them. Honest estimate after fixes: **1st or 2nd GDG**, and a real shot at Gemma 4 (pick Gemma over Open-Source; the Open-Source story is thinner and 20–30 teams will all claim "we used Gemma"). The things that will cost a place: an empty validation file (judges in this rubric weight "validation" first), and a live failure in front of a judge.

#### 4. Top 10 changes, ranked by points per hour

| Rank | Change | Rubric lines / track moved | Effort (h) | Owner | Evidence |
|---|---|---|---|---|---|
| 1 | Make the GitHub repo public; confirm LICENSE renders | 4a +2, 4c +6 (0→visible), Open-Source eligible, MLH eligible | 0.1 | Ashwin (repo owner) | `gh repo view` → PRIVATE |
| 2 | Deploy to Cloud Run per `docs/DEPLOY.md`; URL at top of README; run `scripts/e2e.mjs` against it | 4a +4, 2a +1, all three tracks | 1.5 | Yoshwan | PLAN.md:20, no URL anywhere |
| 3 | 3–5 student answers into `docs/validation.md` + a "what we changed" line in README | 1c +4, 1b +1 | 1.0 | Ashwin (texting while Yoshwan deploys) | validation.md:11 empty |
| 4 | Record the 2-min video: Maya story → paste scam → photo of lease → show "as read by Gemma" and the injection banner | Gemma +2, UI/UX +1, 2a +1 | 1.5 | Both (after #2) | No video exists |
| 5 | One automatic server-side retry on `model_failed`/`invalid_output`, plus cached live responses for the 4 samples as a fallback | 2b +1, protects 2a (13→15 in a live judging session) | 1.0 | Yoshwan | 3/11 failures; `gemma.ts:100-108` has no retry |
| 6 | Staged status for photo checks ("Reading your photo (about 30 s)…") and keep the sample buttons usable while loading | UI/UX +1, 3c | 0.5 | Ashwin | 33 s with only an sr-only status (`Checker.tsx:307`) |
| 7 | Add the sample-results impact line to README (see 1b fix) | 1b +2 | 0.3 | Yoshwan | README:23 has metrics but no values |
| 8 | Commit the design pass, re-run `scripts/screenshots.mjs`, replace README screenshots | 4c +1, UI/UX | 0.3 | Ashwin | uncommitted `Report.tsx`, `globals.css`, `VerdictTags.tsx` |
| 9 | Lighthouse a11y score + 6-step keyboard walkthrough in README | 3c +1, UI/UX +1 | 0.5 | Ashwin | README:104 claims, no artifact |
| 10 | `GEMMA_BASE_URL` (OpenAI-compatible endpoint, e.g. Ollama) or at least a documented self-host command | 3b +1, Open-Source +1 | 1.0 | Yoshwan (only if #1–#7 are done) | README:75,95 claim self-hosting with no code |

Do not spend time on: the Maps embed, the community counter, Maryland rules, 31B retests. None of them move a rubric line.

#### 5. Biggest single risk

The product is ahead of its logistics. Tonight the repo is private, there is no deployed URL, no video, and `docs/validation.md` is empty, so a judge following the rubric literally sees nothing and scores 1c, 4a and 4c near zero no matter how good the lease-photo read is. Layered on top: 3 of 11 live Gemma calls failed with the error card, and the 90-minute Sunday submission window is hard. If one judge clicks "Photo of a lease page" at 11:30 AM, waits 34 seconds and gets "We couldn't reach the AI model", the AI-necessity and feasibility scores collapse in the same minute. Fix the four logistics items (#1–#4) before writing any more features, and ship the retry/cache (#5) so the demo cannot fail in front of a judge.

### Member B (opus): product and pitch strategist

I read AGENTS/PLAN/README, `docs/brief/*`, `docs/validation.md`, the samples and `lib/ai/gemma.ts`, and looked at the council screenshots. Nothing was edited.

#### 1. Problem story

**The problem is real and well sourced.** The FTC figures (65k reports, $65M lost, $1,000 median loss, renters aged 18–29 3x as likely to lose money, half of scams starting on Facebook) plus Maya, the VT grad moving to Arlington, make a strong, DMV-specific setup. There are two weak spots:

- **Stakeholder empathy is at zero.** `docs/validation.md` has no answers, and the README says "in progress". A judge reads that as "never talked to a user". This is the cheapest way to win back points.
- **Three products in one** (price, scam, lease) can come across as "does a bit of everything". It needs one anchoring promise.

**The sentence a judge should repeat:** *"Before you send a deposit, Clearlease tells you if the price, the landlord and the lease are normal, and quotes the exact words that made it say so."*

**Suggested README opening (59 words):**
> Renters aged 18–29 are three times as likely to lose money to a rental scam, and the median loss is $1,000 (FTC). Clearlease is a pre-sign check for DC, Maryland and Virginia renters. Paste a listing or photograph a lease. Gemma 4 quotes the exact words that matter, and our code checks them against HUD rents, FTC red flags and state law.

Put the live URL and a 10-second GIF of the stamps landing directly under it.

#### 2. The 2-minute demo (record it live, never in demo mode)

Record each beat as its own live take. Cut out failed calls and waits, but label any sped-up wait honestly. A "Demo mode" badge must never appear on screen.

| Time | On screen | Voiceover |
|---|---|---|
| 0:00–0:10 | Phone showing the Facebook-style post (sample 2). Caption: "Clarendon 1BR, $1,650, wire the deposit today". | "Maya's a Virginia Tech senior with a new job in Arlington. From 300 miles away she finds this, if she wires the deposit today." |
| 0:10–0:20 | Stat cards: "18–29: 3x more likely to lose money · median loss $1,000 · half start on Facebook (FTC)". Then **one real student quote from tonight's interviews**. | "She's exactly who rental scammers target. One VT student told us: '…'" |
| 0:20–0:40 | Paste, then **Check this listing**. Jump-cut. Stamps land: *Suspiciously cheap · Likely scam*. Zoom on "7 of 9 checks flagged" and the quote "wire the $1,650 deposit today through Western Union." (`1280-sample2.png`) | "Ten seconds. Every flag quotes her listing word for word. If the AI can't point to the words, the flag doesn't count." |
| 0:40–1:00 | **How Gemma is used.** Zoom on "Read by Gemma 4 (`gemma-4-26b-a4b-it`) in 11.9 s", open the new "What Gemma read" drawer showing raw JSON with `quote` fields, then flash `lib/rules/scam.ts`. | "Gemma 4 26B-A4B has one job: turn messy text and photos into strict JSON, with a verbatim quote for every field. It never decides. HUD rents, FTC red flags and Virginia law live in tested code." |
| 1:00–1:08 | Type "We never accept wire transfers. Tour in person anytime." The wire flag stays clear. Caption: "Keyword matching flags this. Gemma doesn't." | "That's why this needs a language model, not keywords." |
| 1:08–1:32 | Ashwin's phone photographs a printed lease page. Wait cut with an on-screen "33 s, sped up". Stamp: *Fix before signing*. Zoom on "may enter the Premises at any time, without prior notice", then "Va. Code § 55.1-1229(A)", then the question "Will you change the entry clause…" (`1280-sample3.png`) | "Real listings have their own trap: leases written for the landlord. Gemma reads the photo, and Clearlease shows which clauses conflict with Virginia law, with the statute, and what to ask before signing." |
| 1:32–1:45 | Sample 4. Banner: "This text contained instructions aimed at AI tools. We ignored them." Then "Likely scam". (`1280-sample4.png`) | "Scammers are starting to write for AI checkers. We ignore their instructions and count them as a red flag." |
| 1:45–2:00 | Privacy line, cost table, end card with the URL, repo, `gemma-4-26b-a4b-it` and Apache 2.0. | "Nothing stored. Phone numbers removed on your device. About $1 per 1,000 checks on Cloud Run, with open weights. A campus housing office or a tenant nonprofit could run it tomorrow." |

Leave out the map and the community counter. They take time and invite questions.

#### 3. The wow moment

**Now:** the stamps landing plus "7 of 9 checks flagged" with quotes. It's good, but it's a verdict screen, and judges will see 20 of those.

**What it should be:** a phone camera on a paper lease, then a red *Fix before signing* stamp, then the clause in the landlord's own words, then the Virginia statute, then the exact question to ask. That is physical, multimodal (the Gemma track wants image use shown), grounded, and clearly useful. The negation beat ("we never accept wire transfers") is a quieter second wow that proves the AI is necessary.

**Hidden AI instructions:** a strength for the Responsible AI line (safety and grounding 10), but only as a 12-second supporting beat. If it leads, it reads as a staged gimmick. Frame it as "scammers write for AI checkers", not "look, we beat prompt injection".

#### 4. What judges will remember, forget or hold against us

**Remember:**
- The ink stamp saying "Likely scam".
- The quoted Western Union line.
- A lease photo turning into statute citations.
- "The model extracts, code decides."
- The model ID visible in the UI.

**Forget:** the map, the cost table, the Firestore counter, the ACS/FMR detail.

**Hold against us:**
1. No real users (empty `validation.md`).
2. No URL. A judge who can't click it assumes it's fragile.
3. "We couldn't reach the AI model" (`1280-sample1-error.png`, 3 of 11 calls). If a judge hits that, the project is done for. Cause: `gemma.ts` throws on any 5xx or network error without retrying.
4. A 34-second lease wait.
5. An over-flag in sample 4: "Owner is relocating for work" counts as the weight-2 "out of town or overseas" flag. A careful judge will notice.
6. Maryland is barely visible.

#### 5. Top 10 changes, ranked by points per hour

| # | Change | Rubric lines / track (+est.) | Hours | Owner | Why |
|---|---|---|---|---|---|
| 1 | Interview 6–8 VT students **tonight** with the 3 questions already in the file. Log them in `validation.md`, add 2 quotes to the README and 1 to the video. | Problem definition 10, empathy 5 (+4–5) | 1 | Both (Ashwin interviews, Yoshwan logs) | Biggest gap and cheapest fix. Impossible after people go to sleep. |
| 2 | One automatic retry in `extractWithGemma` on 5xx, network errors and one invalid output, inside the 45 s budget. UI status: "Gemma is taking a second look…" | Feasibility, UI/UX "effortless", Gemma track (+2, and protects the rest) | 0.5 | Yoshwan | Takes the failure rate from ~27% to roughly 5%. Judges won't retry. |
| 3 | Deploy to Cloud Run and put the URL in the first README line and on the end card. | Nonprofit deployment 10, documentation 7 (+3) | 1–1.5 | Yoshwan (a human runs gcloud) | "Small and working" has to be clickable. |
| 4 | "What Gemma read" `<details>` in the report: pretty-printed extraction JSON (quotes highlighted), model ID, tokens, latency. The data is already in `CheckResult.extraction` and `meta`. | AI architecture 10, Gemma track "show HOW" (+3) | 1 | Ashwin | Judges said they need to *see* how the model is used. This makes it one click in the UI and the video. |
| 5 | Mini-eval: 16–20 labeled inputs (negation, paraphrase, two photos, two injections, honest listings). Compare Gemma against the existing regex extractor. README table: flags caught, false flags, quote-verified rate. | AI necessity 15, measurable impact 10 (+4) | 2–2.5 | Yoshwan | Turns "AI is necessary" from a claim into a number. The regex baseline already exists, so the comparison is cheap. About 20 live calls. |
| 6 | Make the video per the script above, plus one complete backup take. Captions on, model ID on screen twice. | Everything, and required for the Gemma track (+5–8 vs. a weak video) | 2.5 | Ashwin edits, Yoshwan voices | The video and README are most of what judges see. Script and record by 9 AM, not after. |
| 7 | README top: the new 59-word pitch, the URL, a stamp GIF, and a "Who runs this" paragraph (VT Off-Campus Housing, DC Office of the Tenant Advocate, legal aid; cost per 1,000 checks; self-host path). | Feasibility 10 + 8, documentation 7, problem (+2–3) | 0.75 | Yoshwan | Names a real deployer and a budget, which the rubric rewards. |
| 8 | "Copy these questions as a message to the landlord" button under "Questions to ask". | UI/UX track, empathy (+1–2) | 0.5 | Ashwin | Turns the report into an action. A memorable UX detail for the UI/UX narrative. |
| 9 | Sample-button safety net: if the live call fails twice, show the recorded **live** result labeled "Recorded live result, Oct 24". | Feasibility, UI/UX (+1–2) | 1 | Yoshwan (api), Ashwin (label) | Judges will click samples on a shared free-tier key during judging. |
| 10 | Speed up lease photos: cap `imageTranscript`, try `mediaResolution` medium, aim for under 20 s. Rerun the 3x benchmark and record it in PLAN.md. Also tighten the prompt so "relocating" doesn't count as "owner away". | Inference cost 8, safety and grounding (+1–2) | 1–1.5 | Yoshwan | Revert if clause recall drops. Grounding needs the transcript, so measure before keeping it. |

**Do not build:** PDF upload, Maryland local rules, more map work, or new verdict types. Freeze at 9:30 with the video already recorded.

**Track:** stay on **Gemma 4**. Integration is core and multimodal, schema-bound and guarded against injection. Items 4 and 5 make it hard to beat. Fall back to UI/UX only if live calls are still flaky after item 2.

Key files: `lib/ai/gemma.ts` (no transient retry, around lines 95–109), `docs/validation.md` (empty), `README.md` (lines 1–5 pitch, line 30 "validation in progress"), `docs/screenshots/council-review/1280-sample4.png` ("relocating for work" counted as the "owner away" flag).

### Member C (sonnet): skeptical engineer and security reviewer

I made 0 POSTs. `tsc --noEmit` is clean. `grep AIza .next/static` found nothing. I didn't run vitest, docker or gcloud.

Each item below is marked verified (I read it in code or ran it) or suspected.

#### 1. What breaks live on demo day, ranked by likelihood × damage

**1. Model failures (3 of 11 calls). Root cause is in `lib/ai/gemma.ts`.**

Every error that isn't a 400 or a 429 is fatal on the first try. Line 101 throws `model_failed` for any other `ApiError` (500, 503, 504, 499). Line 108 does the same for network or fetch errors. Neither is retried. `check.ts:106` turns both into "We couldn't reach the AI model". That is exactly the UI error you saw, and it is not the `invalid_output` message. The retry loop only steps down on a 400 (line 100) or on invalid output (line 104). It never retries the same level.

Verified: the code path. Suspected: that the live status was 500/503. Gemma on the free tier is often overloaded. `console.error("gemma error: model=… status=…")` at line 98 prints the status. Grep the dev-server terminal for `gemma error` to confirm.

Four more defects in the same file:
- **Permanent downgrade (lines 22, 88, 76).** `workingLevel` is a process-global. The "intermittent 400s" in PLAN.md are likely transient. One 400 at level 0 makes level 1 succeed, and `workingLevel` becomes 1 for the life of the process. The schema and the `ThinkingLevel.MINIMAL` config are then gone for every later request. Level 2 returns bare text, which is where the reasoning leak ("The user wants me to…") comes from. A single flaky 400 can silently degrade the whole demo. This is verified in the code. Whether it happened in your run is suspected.
- **One shared 45 s budget (lines 8, 74).** One `AbortSignal.timeout(45000)` covers all step-down attempts. The photo takes about 34 s. If the first attempt 400s or returns invalid output, the retry has about 10 s left and times out. The result is `model_failed` with the message "took too long".
- **Fragile parsing (lines 45–51).** `parseModelJson` takes everything from the first `{` to the last `}`. If thought text or reasoning containing braces precedes the JSON, it parses garbage and falls through as `invalid_output`.
- **No retry for transient errors or `model_busy`.** A 429 or 503 with no backoff is shown straight to the judge.

**Fix (about 1 h, Yoshwan):**
- Retry the same level once on 500/503/504 and on network errors, after 600–1000 ms.
- Give each attempt its own timeout of about 40 s.
- Make `workingLevel` sticky only after two 400s, or drop the global.
- Add a pre-recorded fallback: on `model_failed` for a sample the user clicked, return the recorded extraction, clearly labelled "live model unavailable, showing recorded read".

**2. Cold start and Gemini latency during judging (suspected).** DEPLOY.md doesn't set `--min-instances`, so the first judge click pays the cold start plus a 10–34 s call. Deploy with `--min-instances 1` for the judging window. It's a one-line change in `docs/DEPLOY.md`, about 5 min.

**3. Maps key on the Cloud Run URL (known).** If the referrer isn't added, the map fails visibly. DEPLOY.md step 6 lists `https://*.run.app/*`, which should cover it. Verify with a real load right after deploy. Check that the map's failure mode hides the card instead of showing an error box.

**4. Rate limit (`lib/server/rate-limit.ts:24`).**
- It takes the rightmost `x-forwarded-for` entry. That is correct for direct Cloud Run.
- The limit is per instance and in memory, with up to 3 instances.
- Campus Wi-Fi or NAT means 10/min is shared by every judge and teammate on that network. If two teams demo at once, you can hit 429 mid-demo.
- Mitigation: set `RATE_LIMIT_PER_MIN=30` on the service. The env var already exists (`route.ts:39`).

**5. Cloud Run `--timeout 60` against the 34 s photo.** It's OK for a single attempt. It fails when combined with a step-down retry (see 1). Raise it to 120 and the model timeout to match.

**6. Untested Docker build (suspected).** I didn't run docker. The local `.next/standalone` does contain `node_modules/@google-cloud/firestore`, so tracing works. Run `docker build` once before relying on Cloud Build, and watch for a failure in `scripts/prepare-standalone.mjs`.

#### 2. Grounding

All of this is verified in code.

- **Quotes are checked.**
  - `quotes.ts:29` `findQuote` normalizes text and checks substring containment against the user text or the model's image transcript.
  - `check.ts:111` and `check.ts:114` apply the same check to the rent, bedrooms, ZIP and address.
  - `scam.ts:52–67` drops flags whose quote can't be found and shows them as "not counted".
- **Number in quote.** Rent uses `numberInQuote` and bedrooms use `bedroomsInQuote`. The ZIP uses `quote.includes(zip)` (`rules/check.ts:54`).
- **Weak spot: the image transcript.**
  - The corpus includes `imageTranscript`, which the model itself produced.
  - Any quote can be "verified" by being placed in the transcript.
  - Photo-sourced claims are therefore verified only against the model's own output.
  - The tiny risk is a hallucinated transcript. The mitigation is to display `quoteFrom: "image"` as "as read from your photo". It is already tagged.
  - Don't over-claim "verified against your input" in the README for photo claims.
- **Weak spot: `findQuote`'s ellipsis path.** It accepts a quote whose "..."-separated pieces each appear in order. A model can stitch distant fragments into a misleading quote. This is a low-severity risk. Consider capping the gap between pieces.
- **Weak spot: clause `plain` text.** `plain` is the model's free-text explanation. I only skimmed `lib/rules/lease.ts`, so I'm not sure it is quote-gated like the scam flags. It is unverified model prose that reaches the user. The legal citations come from the jurisdiction JSON, which is good. Make sure `plain` is shown only when the clause quote is verified.
- **Injection sample.**
  - It is defended in layers: the pinned prompt with delimiters, the Zod schema and a regex fallback detector (`scam.ts:101–107`).
  - The `aiInstructions` flag has weight 2 and never lowers the tier.
  - Not tested live, since I held my POSTs. The chairman's run covered it.
- **Rescore path.**
  - A client-supplied `extraction` is accepted with `z.unknown()` and then validated by `ExtractionSchema`.
  - Quotes are still checked against the supplied text, so it can't fabricate flags against text it doesn't contain.
  - A user can only fool themselves. That is acceptable.

#### 3. Privacy: claims against the code

- **Redaction is client-side only (`redact.ts`, `Checker.tsx:91`).** It covers email, phone, SSN and 10–19-digit runs.
  - The server accepts raw text anyway, so it is a convenience, not a guarantee.
  - Addresses, names and rent amounts are not redacted. That is by design, since the model needs them.
  - Photos are not redacted. Faces, names, phone numbers and signatures in a lease photo go to Google in full.
  - README wording like "we remove contact details" must say "from pasted text only".
- **EXIF stripping is true.** `image.ts:30–40` re-encodes through a canvas, which drops EXIF including GPS. `createImageBitmap` with `imageOrientation: "from-image"` also fixes rotation.
- **No logging of user text.** The only `console.*` calls are `gemma.ts:98` (status and model only) and `route.ts:62` (the error name only). Verified by grep.
- **No persistence on the main path, except localStorage.** `Community.tsx:10,32` stores flagged IDs (hashes) in `localStorage`. Disclose it, or at least keep the README honest about "nothing stored on your device".
- **Firestore counter.** Verified the code writes only `{count, firstSeen}` under an HMAC doc ID with `COMMUNITY_SALT`.
  - Weakness: addresses and phones are low-entropy. Anyone who holds the salt and the database can brute-force them.
  - The salt sits in Secret Manager, so this is acceptable.
  - Phone hashes are computed in the browser. The server HMACs them with the salt. That is a sound design.
  - `/api/flag` is gated by a signed token (30 min TTL) and a 5/min limit. That is fine.
- **What goes to Google.** The full text and the image go to the Gemini API.
  - Suspected: the free tier's terms allow Google to use inputs to improve its products. Gemma-4 on the Gemini API is free-tier only, per DEPLOY.md.
  - Check the Gemini API terms for the unpaid tier and state it plainly in the README and UI. Don't write "dropped" or "never kept" if the API provider may retain it.
  - This is the main exposure on the 8-point privacy line. Honesty here scores better than a blanket claim.
- **Error messages.** They are generic and echo no input, which is good. `CheckFailure` messages are static strings.

#### 4. Deploy risk

- **Secrets.**
  - The Dockerfile has no ARGs or ENV for secrets.
  - `.dockerignore` and `.gcloudignore` both exclude `.env*`, `.next` and `.git`.
  - Locally, `.next/standalone/.env` exists on disk, which is why those ignores matter. `.gcloudignore` covers it.
  - `.env.local` is gitignored and untracked (verified with `git check-ignore` and `git ls-files`).
  - A full `git log -p` secret grep wasn't done.
- **Runtime env.** `--set-secrets` is correct. Maps config is read per request (`maps-config.ts`), so the build-time `NEXT_PUBLIC_*` problem is avoided.
- **Silent failure.** The runtime service account's `secretAccessor` and `datastore.user` roles are required. Without them the app silently falls to Demo mode or skips the community counter.
  - Demo mode on the live URL would mean recorded results at the judges' desks.
  - The "Read by Gemma 4" header on the live page is your proof.
  - Run `node scripts/e2e.mjs $URL` right after deploy.
- **Rate-limit state is lost on every instance restart.** Not a security problem for the demo.
- **Deployment hasn't happened.** With about 12 hours left, this carries the most schedule risk. Do the first deploy tonight, not Sunday morning.

#### 5. Top 10 changes

| # | Change | Rubric lines / track moved (est.) | Effort (h) | Owner | Evidence |
|---|---|---|---|---|---|
| 1 | Retry once on 5xx and network errors, give each attempt its own timeout, and stop the permanent `workingLevel` downgrade | Tech/AI 10, Feasibility; avoids a demo failure (+3 to +6 pts saved) | 1 | Yoshwan | `lib/ai/gemma.ts:22,76,88,100-108` |
| 2 | Recorded fallback for sample clicks when the live model fails, labelled as such | Safeguards the live demo (+2 to +4) | 1 | Yoshwan | `lib/server/check.ts:96-107`, `lib/ai/mock.ts` |
| 3 | Deploy to Cloud Run tonight: `--min-instances 1`, `--timeout 120`, `RATE_LIMIT_PER_MIN=30`, add the Maps referrer, run `scripts/e2e.mjs` | Nonprofit deployment 10, Feasibility 25; a missing deploy is a large loss | 1.5 | Yoshwan (humans run gcloud) | `docs/DEPLOY.md:90-97` |
| 4 | Make privacy claims precise: free-tier data retention at Google, photos not redacted, redaction is client-only, localStorage flag IDs | Privacy 8 (+1 to +2) | 0.5 | both (README + UI copy) | `redact.ts`, `Community.tsx:10,32` |
| 5 | Gate clause `plain` text on a verified clause quote, and state in the UI which claims are verified | Safety & grounding 10 (+1 to +2) | 0.75 | Yoshwan | `lib/rules/lease.ts` (not fully read) |
| 6 | Harden `parseModelJson` by looking for the JSON after any thought preamble, and log a safe one-line reason (status only) when it falls back | Reliability | 0.5 | Yoshwan | `lib/ai/gemma.ts:44-58` |
| 7 | Run `docker build` and `docker run` once locally with a fake env, and confirm Firestore loads in the container | Avoid a Sunday build failure | 0.5 | Yoshwan | `Dockerfile`, `next.config.ts:7` |
| 8 | Add the cost line to the README from `meta.usage` with free-tier limits, and a note on what happens at the quota (429, `model_busy`) | Inference cost 8 (+1 to +2) | 0.5 | Yoshwan | `lib/server/check.ts:98` |
| 9 | UI handling for 429/`model_busy`/`rate_limited`: show a countdown and a "try a sample" button instead of the generic error | UX; MLH UI/UX | 0.75 | Ashwin | `components/Checker.tsx:58` |
| 10 | Cap the gap between "..." quote pieces and treat photo-only quotes as "as read from your photo" in the evidence wording | Grounding (+0.5 to +1) | 0.5 | Yoshwan | `lib/rules/quotes.ts:37-48` |

Safe to deploy: yes, once change 1 is in. The security hygiene is good (nothing secret in the bundle, input limits enforced on the server, no rendering of model HTML, no logging of user text). The reliability bug in change 1 and the unclear Google data-retention wording are the two things to fix before judges see it.

### Member D (opus): designer and accessibility expert

#### 1. First impression

**It looks designed, not generated.** At both sizes it reads as a civic form and an inspection slip. The page is cool gray `#EEF1F4` with Public Sans, ballpoint-blue `#1E4BB8` for actions, square 2–3px corners, no shadows and no gradients. The one bold element is the tilted, rough-inked, double-ring stamp board. It is specific to leases, it carries all three verdicts and it links to each section, so it isn't decoration.

**AI-look tells, checked one by one:**
- Cream + serif + terracotta: none.
- Near-black + acid accent: none.
- Gradient wash: none.
- ALL-CAPS eyebrows: none.
- "A · B · C" meta strings: none. The facts bar is a `<dl>`.
- Arrows on buttons: none. The caret on `<details>` is a real disclosure.
- Fade-up on everything: none. Only the stamps animate.
- One accented word in a headline: none.
- **Mild: three identical boxes.** The empty-state ghost slots are three equal dashed boxes (`Checker.tsx:377-388`, `1280-empty.png`). They're acceptable because they preview the board.
- **Off-identity: the Google map** (`Report.tsx:133`). Restaurant pins ("Carbonara", "The Italian Store") put loud, generic map styling into a section that should be quiet. On a phone it adds 208px before "Show evidence" (`375-sample2.png`).
- **Board breaks at 1280.** The third stamp wraps onto its own row in samples 2, 3 and 4 (`1280-sample2.png`, `1280-sample3.png`), so the "board of three" no longer reads as one slip.

**Verdict word drift: keep it.** The UI words are better than the AGENTS.md words:
- "Below market" sounds like good news to a renter, which is exactly the trap. "Suspiciously cheap" says the risk.
- "Fix before signing" fits on a stamp.
- `README.md:31-33` already uses the UI words. Only AGENTS.md and PLAN.md are stale, so update them.

**One real problem with the words: false reassurance.** Sample 3 (a lease photo with no listing) gets a green "No red flags found" stamp (`375-sample3` crop). Nothing was there to scam-check, so the green stamp reads as approval.

#### 2. Effortlessness

- **Landing to verdict: one tap.** A sample gives a verdict in one tap. Your own listing takes a paste and a tap.
- **The 375 fold works.** "Check this listing" sits at y≈762, inside the 812 fold, and "No listing handy? Try a sample" jumps to the samples. The view auto-scrolls to results, and that scroll respects reduced motion (`Checker.tsx:101`).
- **Loading over 34 s is the weakest moment.**
  - The screen reader is told "about 10 seconds" even for photos (`Checker.tsx:100`). The real time is 33 s.
  - The visual loader is static: one sentence, a seconds counter and three pulsing bars (`Checker.tsx:392-403`).
  - Nothing tells the user at 20 s that this is normal.
- **The error state works but fails at the worst time.** 3 of 11 live calls failed, and in a judged live demo that's the whole game.
  - The copy "Try again, or try one of the samples" (`lib/server/check.ts:106`) is wrong when the user *just ran* a sample.
  - The error is announced twice: once by `role="alert"` (`Checker.tsx:312`) and once by `setAnnounce` (`Checker.tsx:63`).
- **Clarity for a stressed renter is strong.**
  - Each verdict has an icon, a word and a color.
  - "7 of 9 checks flagged" is followed by quoted evidence in mono.
  - The lease section groups clauses by what to do, and the questions are concrete.
  - Reading level is about grade 2–6 for headlines and details. The statute lines are about grade 8.6 ("unenforceable"), which is acceptable under the plain-language line Gemma writes.

#### 3. Accessibility audit

I measured this on the live empty state with headless Chrome and computed the result-view pairs from the hex values.

**Contrast**
- Every text pair passes 4.5:1, but some margins are thin:
  - Stamp labels use `opacity-90` (`Stamp.tsx:23`): ok 4.82:1, warn 5.00, stop 5.23, nil 5.42.
  - Lease group counts use `opacity-80` (`Report.tsx:230`): 4.77:1.
- **`README.md:103` claims "5.7:1 or higher on every pair". That is false**, and a judge with a contrast checker can disprove it in 10 seconds.
- Everything else clears comfortably:
  - Body ink: 14.5–16.5:1.
  - Ink-soft: 6.6–7.5:1.
  - Pen links: 6.7–7.6:1.
  - White on pen: 7.6:1.
  - Stamp words: 6.1:1.
  - AI-injection banner: 6.2–6.8:1.
  - Focus ring on paper: 6.7:1.
  - Input borders (`#4A5664`): 7.5:1, which passes the 3:1 non-text rule.

**Focus**
- The order is logical at both sizes: skip link, Try a sample (375 only), textarea, Add a photo, ZIP, Check, privacy summary, 4 samples.
- Every stop shows a 3px `#1E4BB8` outline with a 2px offset (`globals.css:38`).
- After a result, focus moves to the report heading (`Report.tsx:81`). Its `focus:outline-none` is fine for programmatic focus.

**Labels**
- The textarea and ZIP have real `<label>`s. The file input is labelled through `aria-labelledby`.
- Errors use `aria-invalid` and `aria-describedby` (`Checker.tsx:199-200, 263-264`).
- Each section heading carries an sr-only verdict (`Report.tsx:39`).

**`aria-live`**
- The `role="status"` region announces all three verdicts (`Checker.tsx:114`). Good.
- Problems are the wrong photo time and the double error announcement above.

**Reduced motion**
- Stamps, tags and the skeleton are disabled under reduced motion (`globals.css:158`), and so are the caret and the rescoring fade. Pass.

**Alt text**
- The photo preview has alt text (`Checker.tsx:226`).
- **The map is a problem.** `role="img"` wraps a live Google Map (`ListingMap.tsx:41`), and Google injects a focusable `tabindex=0` element inside it. That is nested-interactive content inside an image role, which axe flags. The figcaption already gives a text alternative.

**Touch targets**
- All buttons are at least 44px.
- "Try a sample" is 90×17 (`Checker.tsx:176`). Inline links are exempt from WCAG 2.5.8, but this is the fastest path on a phone.
- The ZIP input is 42px tall (`Checker.tsx:265`).
- No horizontal scroll: `scrollWidth` is 375 and 1280.

**Placeholder**
- The placeholder uses ink-soft at 7.5:1 and contains scam-sample text (`Checker.tsx:204`). At a glance it reads as prefilled content.

#### 4. UI/UX track readiness: 7.5/10 now, 8.5 after items 1–6

**Recommendation: stay with Gemma 4.** The Gemma integration is core functionality:
- multimodal transcription
- a schema-bound extraction
- quote verification
- an injection defense
- a 26B vs 31B benchmark
- the model ID shown in the UI (`Report.tsx:282`) and in the README

That maps exactly to what the Gemma judges said. The UI/UX entry is strong for a hackathon. But UI/UX judges weigh "effortless from first click", and a 27% live error rate or a silent 34 s wait costs more there than anywhere else.

**Switch to UI/UX at 9:30 only if both are true:**
- Discord shows a crowded Gemma field.
- Item 1 below is in, and 10 live sample runs in a row succeed.

#### 5. Top 10 changes, ranked by points per hour

| # | Change | Rubric line or track moved (est.) | Hours | Owner | Evidence |
|---|---|---|---|---|---|
| **1** | When a live call fails and `sampleId` is set: retry once after a ~1.5 s jitter, then fall back to `SAMPLE_EXTRACTIONS[sampleId]` with `mode:"mock"` and the note "Gemma didn't answer in time; showing the recorded reading for this sample." Keep real errors for user input. | Feasibility, Tech; protects either MLH demo (+3–5) | 0.75 | Yoshwan | `lib/server/check.ts:96-106`; `1280-sample1-error.png`, `1280-sample4-error.png` |
| **2** | Honest wait for photos. Announce "Photos take about 30 seconds; text about 10." Loader title "Reading every line of your photo…". After 20 s, add "Still reading. Long leases take longer." in the polite region. Error copy for samples: "Gemma didn't answer. Try again." | UI/UX effortless, inclusive (+1–2) | 0.25 | Ashwin (+ Yoshwan for the copy in check.ts) | `Checker.tsx:100, 395-399` |
| **3** | When `read.kinds` has no listing or message and the scam score is 0, use nil tone and the word "No listing to check" instead of green "No red flags found". | Responsible AI safety (+1–2) | 0.3 | Ashwin | `lib/client/verdicts.ts:22-26`; `375-sample3.png` |
| 4 | Remove `opacity-90` and `opacity-80` so the lowest pair is ≥5.6:1, and the README claim becomes true. | WCAG 7, documentation (+1) | 0.1 | Ashwin | `Stamp.tsx:23`, `Report.tsx:230`, `README.md:103` |
| 5 | Fit the board on one row at 1280: `sm:text-[21px]`, `sm:px-4`, `gap-x-4`. Verify with a screenshot. | UI/UX polish (+1) | 0.25 | Ashwin | `Report.tsx:96`, `Stamp.tsx:20,27`; `1280-sample2.png` |
| 6 | Move the map inside or below the evidence drawer. Put `aria-hidden` and `inert` on the map div and drop `role="img"`, so the figcaption is the text alternative. | WCAG, UI quiet sections (+0.5–1) | 0.25 | Ashwin | `Report.tsx:133`, `ListingMap.tsx:41` |
| 7 | Add a "Copy these questions" button with `navigator.clipboard` and a `role="status"` "Copied" confirmation. It is the renter's real next step: messaging the landlord. | Stakeholder empathy, UI/UX (+1) | 0.3 | Ashwin | `Report.tsx:184-196` |
| 8 | Make the nil lease stamp an action: "Add a lease photo", which focuses or opens the existing Add button. Also dedupe the error announcement by dropping `setAnnounce` when the card has `role="alert"`. | UI/UX, WCAG (+0.5) | 0.25 | Ashwin | `verdicts.ts:38`, `Checker.tsx:63,312` |
| 9 | Run Lighthouse or axe on a result view (Chrome DevTools, no new dependency). Put the score and a short a11y checklist in the README. | WCAG 7, documentation 7 (+1) | 0.3 | both | `README.md:103-105` |
| 10 | Small fixes: change the placeholder to a neutral "e.g. 2BR in Silver Spring, $2,100/month…"; give the ZIP input `py-2.5` (44px); give the Try-a-sample link `min-h-11 inline-flex`; delete the `?tags=` prototypes (`VerdictTags.tsx`, `globals.css:114-147`, `Report.tsx:13,71,86-95`) and keep the stamps; update the AGENTS.md and PLAN.md verdict words to match the UI and README. | Polish, documentation (+0.5) | 0.4 | Ashwin (docs: Yoshwan) | `Checker.tsx:176,204,265` |

**Top 3: items 1, 2 and 3.** Together they take about 1.3 hours. They fix the demo-killing failure, the silent 34 s wait and the one place where the UI implies safety.

My temporary crops and audit scripts are in `C:/Users/Yoshwan/AppData/Local/Temp/claude/council-d/` (`audit.cjs`, `crop.cjs`, `c375-s2-top.png`, `c375-s3-top.png`, `c1280-s4-top.png`). I edited no repo files.

## Appendix C: raw Stage 2 peer reviews

Reviewers saw only the labels W, X, Y and Z.

### Review by Member A (judge; reviewed W, X, Z)

**1. Ranking**

| Rank | Answer | Accuracy | Impact | Reasoning |
|---|---|---|---|---|
| 1 | **W** | 8 | 8 | The only one that puts validation first and includes a shot-by-shot video script; the "relocating for work" over-flag is real (`docs/screenshots/council-review/1280-sample4.png`, "Says the owner is out of town or overseas"). Misses the private repo and buries deploy at #3. |
| 2 | **Z** | 9 | 6 | Most accurate code reading: `workingLevel` permanent downgrade (`lib/ai/gemma.ts:22,88`), one shared 45 s `AbortSignal` across step-downs (`gemma.ts:8,74`), no same-level retry (`gemma.ts:100-108`) all verified by me. But it's an engineering audit, not a win plan: no validation, no video, no public repo, no README. |
| 3 | **X** | 8 | 4 | Careful UI audit with verified claims (`components/Stamp.tsx:23` `opacity-90`, `components/Report.tsx:230` `opacity-80`, `components/Checker.tsx:100` "about 10 seconds" even for photos, `components/ListingMap.tsx:41` `role="img"`, third stamp wrapping onto its own row in `1280-sample2.png`). Its top 10 is entirely polish; following it alone leaves the team unsubmittable. |

Checked by me: all file:line claims listed above, plus `app/api/check/route.ts:39` (`RATE_LIMIT_PER_MIN`), `components/Community.tsx:10,32` (localStorage), `lib/ai/mock.ts:179` (`keywordExtract` exists, so W's regex baseline is real), `lib/rules/lease.ts:96-116` (unverified clauses are `counted:false`), `lib/client/verdicts.ts:22-26`.

**2. What they got wrong**

*W*
- Item 5 (mini-eval, 2–2.5 h, ~20 live calls) is a bad priority tonight on a shared free-tier key that already fails 27% of the time; it also burns the rate budget judges will use. Push it below deploy and video.
- Item 1 claims "+4–5 on Problem definition 10"; validation moves 1c (5 pts) and maybe 1 pt of 1b. 1a is already ~9.
- "Record live" is right, but it never says deploy must come first so the video shows a URL.

*X*
- Top 10 contains no deploy, no validation, no video, no public repo. Its own stated gains total ~10 pts; the omitted items are worth 20+.
- Item 3 ("No listing to check" for a lease-only photo) is sensible, but `verdicts.ts:22-26` is pure presentation; the signal (`read.kinds`) needs plumbing through `ScamCheck`, so 0.3 h is optimistic.
- The double error announcement (`Checker.tsx:63,312`) is correct but worth ~0 rubric points.

*Z*
- Item 8 "add the cost line to the README" already exists (`README.md:80-89`: measured tokens, latency, $/1k). Wasted effort.
- Item 5 (gate `plain` on a verified quote): `lib/rules/lease.ts:96-108` already marks unverified clauses `counted:false` and `Report.tsx:244` renders them under "Not counted". Low value; Z admits it didn't read the file.
- Item 7 (local `docker build`): `gcloud run deploy --source .` builds in Cloud Build anyway; 0.5 h is better spent on validation.
- localStorage flag IDs (`Community.tsx:10,32`) is real but a one-line README caveat, not a 0.5 h item.

**3. What all three missed**
- **The GitHub repo is PRIVATE** (`gh repo view AshwinNimmala-21/gdg-team_error-404` returns `"visibility":"PRIVATE"`). MLH requires a public repo with LICENSE, the Open-Source track is impossible, and no judge can read the README everyone agrees is scored heavily. It's a 5-minute toggle and the single highest points-per-hour action in the project. Nobody mentioned it.
- **The uncommitted design pass** (`git diff --stat`: `components/Report.tsx`, `app/globals.css`, untracked `components/VerdictTags.tsx`). README screenshots and council screenshots come from different states; X audits the `?tags=` prototypes without noting they're uncommitted.
- Only W mentions the demo video, and none say that the 2-min video is a hard MLH submission requirement, not a nice-to-have.

**4. Revised top 3**

The peers sharpen, not change, my order. Z's `workingLevel` + shared-timeout finding turns my #5 into a precise 1-hour fix, and X's honest 30 s photo wait rides along with it.
1. **Make the repo public now, commit the design pass, regenerate the README screenshots** (0.3 h, Ashwin): unlocks MLH eligibility, Open-Source, and every README point.
2. **Deploy to Cloud Run tonight with `--min-instances 1`, `--timeout 120`, `RATE_LIMIT_PER_MIN=30`; URL at the top of the README** (1.5 h, Yoshwan), paired with the `lib/ai/gemma.ts` fix: same-level retry on 5xx/network, per-attempt timeout, non-sticky `workingLevel`, recorded-live fallback for sample clicks, and the "photos take about 30 s" copy in `Checker.tsx:100` (1 h, Yoshwan + 10 min Ashwin).
3. **3–5 VT student answers into `docs/validation.md` tonight, two quotes into the README, one into the video; then record the 2-min video from W's script on the live URL** (1 h + 1.5 h, Ashwin interviews and edits, both record).

### Review by Member B (pitch; reviewed X, Y, Z)

**What I checked against the repo:** `gh repo view` (the repo is private), `gemma.ts:22,76,88`, `README.md:84–103`, `Stamp.tsx:23`, `Report.tsx:230,244`, `Checker.tsx:100`, `DEPLOY.md:96`, `lease.ts:96–116`, `Community.tsx:10,32`, `check.ts:106`, `verdicts.ts:25`, and screenshots `1280-sample3.png` and `1280-sample4.png`.

**1. Ranking**

| Rank | Answer | Accuracy | Impact | Reasoning |
|---|---|---|---|---|
| 1 | **Y** | 8 | 9 | It is the only one that found the **private repo**. I verified this: `"visibility":"PRIVATE"`. A private repo makes the project unsubmittable and makes the README worth zero. It also ranks deploy, validation and video ahead of polish. |
| 2 | **Z** | 8 | 7 | It explains *why* 3 of 11 calls fail and finds the sticky `workingLevel` downgrade. It also has concrete deploy flags. But it is mostly about reliability and privacy, with no story, video or validation. |
| 3 | **X** | 9 | 5 | Very accurate UI/a11y audit, and its catch of the green "No red flags found" stamp on the lease-only sample is real. But its whole top 10 is polish worth about 0.5–2 points each. It never mentions the repo, the deploy, validation or the video. |

**2. What they got wrong**

*Y*
- "Needs 5 keys, not 'one key'": the README never says "one key" (grep found nothing). It argues against a claim nobody made.
- The "13 of 13 signals caught on the 4 samples" impact line uses our own fixtures. A judge reads that as testing on the answer key. It needs held-out inputs and a keyword baseline.
- "Problem definition 9/10" is generous while validation is empty, but that's defensible.

*Z*
- Item 4 ("state free-tier retention plainly") is mostly already done. `README.md:95` says Google may use free-tier inputs, and Y cites the UI notice at `Checker.tsx:291`. The valid parts are "redaction is client-only" and "photos aren't redacted".
- Item 5 (gate the `plain` text) is half right. `lease.ts:104` passes `plain` through unconditionally, but `counted` controls the verdict, and the UI shows unverified findings under "Not counted" (`Report.tsx:244`). This is low severity, not +1–2 points.
- The `--timeout 60` / no `--min-instances` claim is correct (`DEPLOY.md:96`).

*X*
- None found on facts. Its claims check out: `README.md:103` says "5.7:1" while `opacity-90` and `opacity-80` exist; `Checker.tsx:100` says "about 10 seconds" for photos; sample 3 shows green "No red flags found".
- **Bad priority:** it says "stay Gemma" but gives no Gemma-visibility or video work. It also calls 1.3 hours of UI copy fixes the top 3 while the repo is private and nothing is deployed.

**3. What all three missed**
- **Showing how Gemma is used.** Judges said this outright. Nobody proposed a "What Gemma read" drawer showing the raw quoted JSON, which is already in `CheckResult.extraction`. Nobody proposed a held-out Gemma-vs-regex comparison (negation, paraphrase, photos), even though the regex extractor already exists. That comparison is the best evidence for AI necessity, a 15-point line.
- **The visible false positive in the injection sample.** "Owner is relocating for work" is flagged as weight-2 "out of town or overseas" (`1280-sample4.png`). A careful judge sees it in the demo.
- **The video as a schedule risk.** Nobody planned around the 34 s photo wait or said to record live tonight and keep a backup take. Nobody said to pre-write both submission forms (MLH and codingjam) before the 90-minute window.
- **Treating the 4 samples as the proof.** They're fictional fixtures. Real student quotes and one real-looking listing would add credibility.

**4. Revised top 3**

Yes, I'd change mine. Y's private-repo finding goes on top, and Z's root cause sharpens my retry item.
1. **Make the repo public and deploy tonight** with `--min-instances 1`, `--timeout 120` and `RATE_LIMIT_PER_MIN=30`. Put the URL as README line 1 and run `e2e.mjs` against it. About 1.5 h, Yoshwan, with Ashwin flipping visibility.
2. **Fix Gemma reliability** (about 1.5 h, Yoshwan): retry the same level once on 5xx and network errors; give each attempt its own timeout; stop the permanent `workingLevel` downgrade; for sample clicks, fall back to a labelled recorded live result.
3. **Interview 5–8 VT students tonight.** Put their answers in `validation.md`, add two README quotes and one video quote. About 1 h, Ashwin.

The "What Gemma read" drawer and the video recorded by 9 AM come right after these three.

### Review by Member C (engineer; reviewed W, X, Y)

I checked these claims against the repo: repo visibility, `docs/validation.md`, the README contrast claim, the `Checker.tsx` announce text and privacy copy, the injection sample's "relocating" line, and the README self-host claim. The screenshots and the full `rules/scam.ts` were not opened.

**1. Ranking**

| Rank | Answer | Accuracy | Impact | Why |
|---|---|---|---|---|
| 1 | Y (rubric scorecard) | 9 | 10 | It found what the rest missed: the repo is private, there's no URL and no video, and validation is empty. It scores the rubric line by line. |
| 2 | W (problem story, demo) | 8 | 8 | Strong on the video script and empathy. It correctly names the `gemma.ts` no-retry cause. It overlooks the private repo. |
| 3 | X (UI/UX, a11y) | 8.5 | 6 | The most precise audit and cheap fixes, but its top 3 are polish, and it scopes out logistics. |

**2. What they got wrong**

*Y*
- "13 of 13 FTC signals" is an invented claim. It's presented as a fix to write, so confirm the real number before putting it in the README.
- Total 75/100 is generous while 4a and 4c are scored at 3 and 6. Fine as a directional estimate.
- "Needs 5 keys" is plausible but I didn't check it.
- Checked and correct: `gh repo view` returns PRIVATE, and `validation.md` "## Responses" is empty.

*W*
- The "relocating for work counted as owner away" claim is real as a sample line: `public/samples/injection.txt:4` says "Owner is relocating for work". I did not confirm it is over-flagged (I didn't open `scam.ts`).
- "About $1 per 1,000 checks on Cloud Run" is unsourced. DEPLOY.md says inference is $0 on the free tier.
- Interviews first (rank 1, +4–5 pts) is right, but it assumes people are reachable tonight.
- The 12-hour plan has no item for making the repo public.

*X*
- Contrast: the README line 103 claim "5.7:1 or higher on every pair" exists. X says it's false (stamp pairs 4.8–5.4). I didn't recompute the ratios, but the claim is checkable and worth fixing.
- The "about 10 seconds" announce for photos is real: `Checker.tsx:100`.
- Rank 1 (fall back to the recording on sample failure) is good, but it hides the failure rate instead of fixing it. The retry is the real fix, and X doesn't prioritise it.
- Items 4–10 are worth about 0.1–0.4 h each and add maybe 3–4 points in total, while it ignores the largest gaps.

**3. What all three missed**
- **Unsafe model retry semantics.** Y and W want a retry on `model_failed`, but none noticed that the `workingLevel` global in `gemma.ts:22,88` permanently downgrades after one transient 400. The retry alone wouldn't stop that.
- **The shared 45 s budget** (`gemma.ts:74`) breaks any retry on photos, since a photo takes about 34 s.
- **Cloud Run `--min-instances` and `--timeout`** (DEPLOY.md line 96) and the shared campus-NAT rate limit (10/min per IP).
- **Free-tier terms.** The UI copy already says Google may review inputs (`Checker.tsx:291`). I'd flagged this as a gap, but it is handled in the UI. The README should match it.
- **"Nonprofit can self-host"** (README:75). Y was the only one to flag it as a claim with no code path. It's a reasonable item, but the cheap fix is wording, not new code.
- **Nobody ordered the work by dependency.** The video needs the deploy, and the deploy needs the retry fix. Run the retry fix first (1 h), then deploy, then record.

**4. Revised top 3**
1. **Make the repo public** (0.1 h) and **deploy to Cloud Run tonight** with `--min-instances 1`, `--timeout 120` and `RATE_LIMIT_PER_MIN=30`. Submission requires both. Y's find; I missed it.
2. **Fix `gemma.ts`**: retry 5xx and network errors once, give each attempt its own timeout, and drop the sticky `workingLevel` downgrade. Add the recorded-fallback for sample clicks (X's #1). This protects every judged click.
3. **Fill `docs/validation.md` with 3–8 real student answers** and quote them in the README and video (empathy 5, definition and impact ~+4–5 pts). Then record the video using W's script.

Safe to deploy: yes, once item 2 is in.

### Review by Member D (design; reviewed W, Y, Z)

**What I checked:** `gh repo view` reports `"visibility":"PRIVATE"`. In `lib/ai/gemma.ts`, line 22 is the global `workingLevel`; a successful call sets it to the current level and it is never reset; one `AbortSignal.timeout(45_000)` covers every attempt; a 5xx or network error throws on the first try, and a 400 only steps down a level. `docs/validation.md`: the Responses section is empty. `lib/server/rate-limit.ts`: the limiter takes the rightmost `x-forwarded-for` entry. `lib/rules/lease.ts:104`: `plain` is passed through for every clause. `README.md` lines 25, 84–89 and 103. `1280-sample4.png`: "Owner is relocating for work." is counted under "Says the owner is out of town or overseas"; it's a strong flag, weight 2. `public/samples/injection.txt:4`.

**1. Ranking**
1. **W (accuracy 9, impact 9).** It has the best plan for winning: interview students tonight, a live demo script, a "What Gemma read" drawer, and a regex-vs-Gemma mini-eval. Every claim I checked was true, including the relocating over-flag.
2. **Y (accuracy 7, impact 9).** It found the one fact that blocks submission (the repo is private) and has the clearest rubric scorecard. It also has a factual error and one harmful suggestion (below).
3. **Z (accuracy 9, impact 7).** It gives the deepest and most accurate root cause of the 3-in-11 failures. But it says nothing about validation, the video or the private repo, so it fixes reliability without covering what the judges score.

**2. What they got wrong**

*W*
- "About $1 per 1,000 checks on Cloud Run" mixes up two costs. README lines 84–85 put the token cost at paid-tier rates ($0.54–0.97 per 1,000), while the real cost today is $0 on the free tier, and hosting is a separate line.
- The `mediaResolution` change (item 10) the night before freeze is risky for clause recall. W does caveat it.
- I found no factual errors.

*Y*
- It says the 33 s wait has "only an sr-only status (`Checker.tsx:307`)". That's wrong: there is a visible `Loading` panel with title, copy, a seconds counter and pulsing slots (`Checker.tsx:392-403`).
- "Keep the sample buttons usable while loading" is a bad change. `Checker.tsx:76` blocks concurrent checks on purpose, and allowing them would race results onto the screen.
- "Coffee per month is unsupported" overstates it: README lines 84–85 give per-1,000 costs.
- "Ashwin (repo owner)" is not verified.
- It calls the 5.7:1 contrast claim only "self-reported". The claim is in fact false: I measured 4.77:1 and 4.82:1.

*Z*
- Privacy item 4 is partly done already. `Checker.tsx:288-293` already says Google may review inputs and tells users to cover names and signatures in photos.
- Z is right that "dropped after the check" (`Checker.tsx:288`) sits uneasily next to that disclosure.
- Its `plain` suspicion is half-confirmed. Unverified clauses still show Gemma's prose, but under a "Not counted" heading (`Report.tsx:240-251`). That softens the problem but doesn't remove it.
- It doesn't mention that the repo is private, and it gives no plan for validation or the video.

**3. What all three missed**
- **A green "No red flags found" stamp on a lease-only input** (sample 3). No listing was given, so nothing was scam-checked, yet the stamp reads as approval. That's a safety-and-grounding problem. Fix it in `lib/client/verdicts.ts:22-26` using `read.kinds`.
- **The README's WCAG claim is false.** `README.md:103` says 5.7:1 or higher on every pair. In fact stamp labels are 4.82:1 and 5.00:1 because of `opacity-90` (`Stamp.tsx:23`), and lease group counts are 4.77:1 because of `opacity-80` (`Report.tsx:230`). A judge with a contrast checker can disprove it in seconds; the fix takes 5 minutes.
- **Wrong wait estimate:** the screen-reader announcement tells users a photo takes "about 10 seconds" (`Checker.tsx:100`). It actually takes about 33 s.
- **Map accessibility:** a `role="img"` wraps a live, focusable Google Map (`ListingMap.tsx:41`), which axe flags as nested interactive content.
- **Uncommitted prototypes:** the `?tags=` verdict-tag prototypes (`VerdictTags.tsx`) would ship as dead code. Y said to commit the design pass but didn't name these files.

**4. Revised top 3**

Yes, I'm changing it. Y's private-repo finding and Z's root cause outrank my UI items.
1. **Reliability (Yoshwan, ~1 h):** in `gemma.ts`, retry the same level once on 5xx and network errors, give each attempt its own timeout, and only make `workingLevel` sticky after repeated 400s. Add a labelled recorded fallback for sample clicks (`check.ts:96-106`).
2. **Make it judgeable tonight (Yoshwan, ~1.5 h):** make the repo public, deploy to Cloud Run with `--min-instances 1` and `--timeout 120`, put the URL as the first line of the README, and run `scripts/e2e.mjs` against it.
3. **Honest UI (Ashwin, ~45 min):** a neutral scam stamp when only a lease was given; the 30 s photo copy plus a "still reading" line at 20 s; remove the opacity classes so the README's 5.7:1 claim becomes true; a "Copy these questions" button.

Student interviews tonight (W and Y) are fourth only because they're both people's job, not Ashwin's. They have to happen before people go to sleep.
