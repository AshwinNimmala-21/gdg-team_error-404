# MLH track decision

We may enter exactly one MLH track ([`docs/process/brief/event-notes.md:19`](brief/event-notes.md)). This page scores all four against the criteria the judges stated, using only what is in the repo today. "Not done" means it does not exist. Scores are out of 10 and deliberately harsh: a flattering score is useless.

State when written (Sun Oct 25, 03:30 AM):
- App deployed on Cloud Run: `https://clearlease-477820387862.us-east4.run.app` ([`docs/process/catchup.md:19`](catchup.md)). Repo is public, LICENSE is Apache-2.0.
- **No demo video recorded.** `docs/video-script.md` and `docs/submissions.md` are stubs.
- **`docs/validation.md` has no student answers** (`docs/validation.md:67`, "None recorded yet").
- **Update 05:06: self-hosted Gemma (D4) is implemented and tested.** `GEMMA_PROVIDER=ollama` runs the same pipeline on a local Gemma 4 (`lib/ai/ollama.ts`, tests in `lib/ai/__tests__/ollama.test.ts`). On this laptop, `gemma4:e2b-it-qat` passed 1 of 5 strict sample checks and `gemma4:e4b-it-qat` passed 3 of 5. Both read the lease photo, and every answer was schema-valid. `gemma4:26b` was not tested (too big for this laptop). See README "Self-host Gemma 4".
- Tonight's queue (C, A, B, D4, Finish) has not started ([`docs/process/catchup.md:197-208`](catchup.md)).

## Summary

| Track | Score /10 | One-line reason |
|---|---|---|
| Best Use of Gemma 4 | **7** | Core, multimodal, model ID everywhere, measured. Loses points for no video and live flakiness. |
| Best Open-Source AI | **6** (was 5; D4 works but small local models over-flag) | Licenses and docs are good. The open-weights angle is a claim, not a code path, and this is the judges' own example idea. |
| Best UI/UX | **7** | Deliberate design, 0 axe violations, manual 12/12. No video, no real-user evidence, 30 s photo wait. |
| Best Use of Google Cloud | **5** | Real deploy on Cloud Run with Secret Manager and Firestore, but a plain stack and thin on the autoscaling and security story. |

---

## 1. Best Use of Gemma 4: 7/10

**Criteria scored against** ([`docs/process/brief/event-notes.md:24`](brief/event-notes.md)):
> "Use it through the Gemini API… Must be core functionality (backend logic, chatbot, image/video/voice processing), not a side add-on. **Name it in the README — if it's not there, they assume you didn't use it.** Show it in the demo video and explain how you used it."

**Evidence**
- Exact model ID in the README: `gemma-4-26b-a4b-it` ([`README.md:7`](../../README.md)), in code ([`lib/ai/gemma.ts:12`](../../lib/ai/gemma.ts)) and in the report header ("Read by Gemma 4", [`lib/i18n.ts:93`](../../lib/i18n.ts)).
- Core, not a side add-on: every check is normally one Gemma call that turns text or a photo into strict JSON with a verbatim quote per fact ([`README.md:10-11`](../../README.md)). Without it the app has no input.
- Multimodal: lease photos and chat screenshots are read directly; 6 screenshot items are in the hard eval set ([`docs/evaluation.md`](../evaluation.md)).
- Integration is visible in the product: a "What Gemma read" section highlights verified quotes in the user's text or photo ([`docs/process/catchup.md:76-82`](catchup.md)).
- Bounded use: schema + Zod, quote verification, injection defense, model never computes prices or legality ([`README.md:115-118`](../../README.md)).
- Measured, not asserted: token and latency table ([`README.md:128-131`](../../README.md)); 26B vs 31B decision documented, with the weak caveat that 31B simply failed our strict config ([`README.md:122-124`](../../README.md)).
- Honest evaluation against a frozen keyword baseline ([`README.md:72-91`](../../README.md)).

**Honest weaknesses**
- **No demo video.** The criterion says "show it in the demo video". Until it exists this track cannot get full marks.
- Gemini free tier is flaky: intermittent 400/500s were seen tonight, and the council counted 3 of 11 live calls failing earlier ([`docs/process/council/report.md:230`](council/report.md)). A recorded-result fallback exists, but a judge who clicks and gets "Showing a saved result" sees a weaker story.
- Lease photo takes about 33 s ([`README.md:131`](../../README.md)).
- 26B-A4B is the model we could run, not one we proved is best. 31B was never successfully benchmarked.
- The "Gemma is necessary" argument is real for photos, Spanish and paraphrase, but on ordinary listings our own eval says a keyword scan is as good or better (holdout: baseline 100/100/0, ours 83/100/1 false alarm; [`README.md:80-81`](../../README.md)). A sharp judge will find that, because we wrote it.
- Everything in the eval was written by us.

**Likely competition.** Most teams will pick Gemma, because it is the easiest MLH track to satisfy: the field is probably the largest, and several teams will do "Gemma reads a lease" or "Gemma flags a scam". Many will use it as a chatbot. Our edge is the grounding and photo path; a team with a cleaner video will beat us on the "show it" criterion.

**What it still needs by 11:00 AM**
- *Human-only:* record the 2-minute video from a **live** run showing a photo read and the "What Gemma read" drawer; write the MLH submission text naming the model ID.
- *Code:* none required. Optional: confirm live reliability on the deployed URL (10 consecutive sample runs).

---

## 2. Best Open-Source AI: 6/10 after D4 (5/10 before)

**Criteria scored against** ([`docs/process/brief/event-notes.md:26`](brief/event-notes.md)):
> "any open model, including Gemma. **Licenses must be in place in the repo.** Example idea they gave: **AI scam detector for leasing.** Spend less time choosing a model; they care how you use it and what you build. **README is very important** — easier to understand = easier to score."

**Evidence**
- Public repo, [`LICENSE`](../../LICENSE) is Apache-2.0.
- [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md) covers 155 production packages and flags the one copyleft item (LGPL libvips via `sharp`). [`CONTRIBUTING.md`](../../CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md) (Contributor Covenant 3.0) are present.
- Gemma 4 licence verified against Google's pages and linked, with weight-download links ([`README.md:247`](../../README.md), [`docs/process/catchup.md:182-187`](catchup.md)).
- Reproducible setup: one key required, demo mode needs none ([`README.md:168-179`](../../README.md)).
- README is long, structured and honest.

**Honest weaknesses**
- **The model is used through the Gemini API, a closed hosted service.** The "open" part is only that the weights are Apache-2.0. Nothing in the running system uses the open weights.
- **Self-hosting is a paragraph, not a code path**, and the README says so ([`README.md:204-208`](../../README.md)).
- The README is long (247 lines). "Easier to understand = easier to score" cuts against us.
- Open-source community evidence is thin: no issues, contributors, or releases beyond us. CONTRIBUTING exists but nobody has used it.
- The app depends on closed services at runtime (Google Maps, Cloud Run, Firestore).

**Likely competition.** **This is the judges' own example idea ("AI scam detector for leasing").** Expect several lookalike teams, and some will be fully local (Ollama or llama.cpp) with a "runs offline" demo. A team that really runs an open model locally beats us on the criterion as stated.

**If D4 works: +2 (to 7).** Reason: a verified `GEMMA_PROVIDER=ollama` path means the open weights run the same pipeline end to end, turning the self-host story from a claim into a demonstrable fact, and it strengthens the privacy argument (no tenant document leaves the machine). It does not reach 8 because a small local Gemma 4 may be slower, miss flags, or fail the photo path, and the lookalike teams stay the same. If D4 only half works (text yes, photo no), +1 and say so.

**D4 result (05:06): +1, not +2.** It works end to end: text and photo, schema-valid, on two local Gemma 4 sizes, with the measured results in the README. But the small models a laptop can run over-flag (e2b: 1 of 5 strict passes, it invents lease clauses; e4b: 3 of 5), and the 26B model we'd recommend wasn't tested. A judge can run it; they'll also see it's weaker locally.

**What it still needs by 11:00 AM**
- *Code:* D4 (Gemini stays default; unchanged behaviour verified by tests and the 5/5 e2e), run the 5 samples through Ollama and record the real result (including failures) in the README.
- *Human-only:* a short video segment showing the local run; submission text.

---

## 3. Best UI/UX: 7/10

**Criteria scored against** ([`docs/process/brief/event-notes.md:25`](brief/event-notes.md)):
> "good UI ≠ good UX. Beautiful but hard to use loses. Must feel effortless and accessible from the first click. **Explain in the demo why your UI is superior (user story + functionality).** Polish it so it doesn't look AI-generated ('round corners' look); not a 2005 website either."

**Evidence**
- One click to a result: five samples on the page ([`README.md:52-57`](../../README.md)), no sign-up.
- Deliberate non-template identity (a housing inspection report, a stamped verdict board): [`docs/design-principles.md`](../design-principles.md), [`README.md:155`](../../README.md).
- Accessibility measured: 0 axe violations in 8 scans, EN and ES, at 375 and 1280 px; contrast table; manual keyboard + VoiceOver check 12 of 12 (done by a teammate) ([`docs/accessibility.md`](../accessibility.md), [`README.md:148-155`](../../README.md)).
- Honest wait states for the 30 s photo read ([`lib/i18n.ts:49-50`](../../lib/i18n.ts)).
- Real user value beyond the verdict: questions to ask, help links, Spanish end to end ([`README.md:63-70`](../../README.md)).
- Screenshots at phone and desktop in `docs/screenshots/`.

**Honest weaknesses**
- **No video, so "explain in the demo why your UI is superior" is not done.**
- **No real-user evidence.** The usability test template is empty ([`docs/validation.md:43-55`](../validation.md)). Our "effortless" claim has been tested only by us.
- The Spanish has not been reviewed by a native speaker ([`README.md:70`](../../README.md)).
- 30 s photo wait and a possible "saved result" fallback both work against "effortless". The report is dense (three verdicts, drawers, a "What Gemma read" section, map, questions); a judge with 60 seconds may find it a lot.
- Dark theme (task B), the copy-questions button and the link from the model line (task C) are not built. The ban on "near-black plus one accent" in the design principles also constrains B.
- Fonts and the look were argued by us and by a Claude critic, not by outside designers.

**Likely competition.** UI/UX is where polished-looking teams cluster. Teams that built a visually slick page with a smooth demo will be strong; our identity is distinctive but quiet, and quiet is hard to show in a 2-minute video.

**What it still needs by 11:00 AM**
- *Human-only:* the 3-person usability test (even 3 real timings is worth more than any claim); video that tells the Maya/Jordan story and shows the stamp, keyboard path and phone view; native-Spanish skim.
- *Code:* tasks C (model-line link, copy-questions button, tagline) and B (dark theme) if time; no new features otherwise.

---

## 4. Best Use of Google Cloud: 5/10

**Criteria scored against** ([`docs/process/brief/event-notes.md:27`](brief/event-notes.md)):
> "good architecture and security; show an architecture diagram (online diagram or even a drawing). Example: Firebase Auth, Cloud Storage, Gemini. **Be ready to explain load balancing, deployment, autoscaling.**"

**Evidence**
- Deployed and reachable: Cloud Run `us-east4` ([`docs/process/catchup.md:19`](catchup.md)); `node scripts/e2e.mjs <URL>` passed 4/4 at the time.
- Secret Manager for all keys, passed at runtime; no `.env` in the image (`.dockerignore`, `.gcloudignore`): [`docs/DEPLOY.md`](../DEPLOY.md), [`PLAN.md` A24](../../PLAN.md).
- Firestore Native for the anonymous flag counter, storing only keyed hashes, a count and a date ([`README.md:142`](../../README.md)).
- Architecture diagram (Mermaid) in the README ([`README.md:95-111`](../../README.md)).
- Settings documented: 512 MiB, 1 CPU, `--concurrency 40`, `--timeout 120`, `--max-instances 3`, scales to zero ([`docs/DEPLOY.md:98,107`](../DEPLOY.md), [`README.md:201`](../../README.md)).
- Security story: rate limit, size caps, MIME allowlist, redaction, signed flag tokens.
- Idempotent one-command deploy script `scripts/deploy.sh`, but its real run is untested ([`docs/process/catchup.md:113-118`](catchup.md)).

**Honest weaknesses**
- **Google Cloud is hosting, not the idea.** The AI runs through the Gemini API with a free-tier AI Studio key, not Vertex AI. There is no Auth, no Cloud Storage, no Cloud Tasks or Pub/Sub. Firestore holds a counter nobody asked for. The council called it "plain infrastructure" ([`docs/process/council/report.md:202`](council/report.md)).
- **The autoscaling/load-balancing explanation is thin**: "scales to zero" and `max-instances 3`. The per-IP rate limiter is in memory per instance, so with 3 instances the limit is not global, and nothing in the docs says so. Nobody has load-tested it.
- **Firestore live verification is not recorded** (PLAN.md 4b lists "Firestore created and verified live" as missing; no later entry closes it).
- The deployed service runs with `RATE_LIMIT_PER_MIN=30`, the deploy script's real run is untested, and Ashwin is the only person who can deploy (Yoshwan's Editor access is a pending item, [`docs/process/catchup.md:277`](catchup.md)).
- Maps key is restricted to two referrers; fine for security, but it makes the self-host story worse.

**Likely competition.** Fewer teams will pick this, but those who do usually use Firebase Auth, Cloud Storage, Vertex AI and sometimes Cloud Run plus Pub/Sub. A team with a richer GCP footprint and a clear architecture talk beats us.

**What it still needs by 11:00 AM**
- *Human-only (Ashwin):* verify Firestore writes in the console; a drawn or exported architecture diagram that includes the load balancer / Google front end, autoscaling and the Secret Manager path; rehearse a 60-second answer on deployment, scaling and the rate-limit limitation.
- *Code:* README paragraph on autoscaling and the per-instance rate-limit caveat; optionally Vertex AI as the Gemma path (not planned, and risky this late).

---

## Recommendation: enter **Best Use of Gemma 4**

1. **It matches the judges' stated criteria most completely and is the least work to finish.** Model ID in README, code and UI; core and multimodal; measured. What it lacks (the video) is the same thing every other track lacks.
2. **The Open-Source track is the likeliest to produce lookalikes.** The judges' own example was a leasing scam detector, so other teams will arrive with it, some with a real local model. Our open-source claim is still a paragraph, and D4 may not work.
3. **UI/UX and Google Cloud depend on things we can't prove tonight**: real-user evidence and a richer cloud footprint. Both can still earn GDG Best Overall points without being the MLH pick.

All of this is also available to the GDG overall prize regardless of the MLH choice.

**Switch condition.**
- **To Open-Source AI** only if D4 is verified end to end (all 5 samples on a local Gemma 4 through Ollama, schema-valid, photo included, results recorded in the README) **and** the Gemma field looks crowded at the 9:30 AM check. **05:06 status:** all 5 samples did run through local Gemma 4, photo included and schema-valid, but only 3 of 5 passed our strict verdict check (e4b), so this condition is **not met** on quality.
- **To UI/UX** if the deployed site still shows a saved-result fallback or an error in 1 or more of 10 consecutive live sample runs. The Gemma track needs the model to visibly work on camera, while UI/UX can lean on the design, the accessibility results and the usability timings.
- Otherwise stay on Gemma 4. Decide by 9:30 AM so the video can name the track.

## Update log

- **03:30 initial**: written before D4 and council round 1.

- **05:06 after D4**: Open-Source 5 → 6. D4 implemented and tested (e2b 1/5, e4b 3/5 strict, 26B untested). The recommendation is unchanged: Gemma 4.