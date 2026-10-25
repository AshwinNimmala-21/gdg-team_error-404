# Morning brief (Sun Oct 25, written 8:40 AM)

**Read this first.**
- All work is on `dev` (pushed, HEAD `f364f1c`). `main` is **34 commits behind**: judges on GitHub see the old README until `dev` is merged.
- **The Finish step did not run.** The overnight session stalled from about 5:35 to 8:35 AM (the cause is unknown; nothing was running), so the full eval re-run, the code-tour line refresh, and council rounds 2+ were not done.
- Everything below was measured before 5:35.

## Council score (round 1, chairman's estimates, not measurements)

| | GDG /100 | Gemma 4 | Open-Source AI | UI/UX |
|---|---|---|---|---|
| Now (`dev`) | ~79 (77 before the round-1 top-3 fixes) | 8 | 7 | 7.5 |
| If the human items land (student answers, video, redeploy + live e2e, native Spanish skim, `main` merged) | ~87 | 9 | 7 | 8 |

Biggest gaps, all human:
- Stakeholder empathy is 2/5: `docs/validation.md` has no answers.
- Measurable impact is 4/10: there are eval numbers only, no field data.
- No video.
- The live URL may run old code.

Details: `docs/process/council/rounds.md`.

## Gates at the last code commit
- `npm test` **126 passed**, lint clean, `npm run build` OK.
- Council fixes (`e6d5122`), live Gemma: e2e EN **5/5**, e2e ES **6/6**.
- Dark theme (`f364f1c`), demo mode, UI-only:
  - e2e EN 5/5 and ES 6/6.
  - axe **0 violations** in dark + light × EN + ES at 375 and 1280.
  - 21 theme checks: system default, toggle, reload without flash, storage blocked, no overflow.
- axe baseline at 4 AM was 8+8 violations (the EN/ES toggle label); 0 since Task C.

## Eval numbers
- **New tonight, messy real-world set** (20 items, live, before → after Task A):
  - Questions get "what we can check" instead of empty verdicts: 0/5 → **4/5**.
  - Scam: 100% precision, 100% recall, 0 false alarms (unchanged).
  - Rent read 11/11 (unchanged).
  - Keyword baseline: 83% precision, 71% recall, 1 false alarm.
- **Other sets: not re-run tonight.** Ashwin's numbers stand: hard set 15/15 with 0 false alarms vs keyword 2/15 with 6; leases 13/13; "Suspiciously cheap" on legit listings 6 → 0.
- **Caveat:** tonight's grounding fixes (clause numbers must be in their quote; the FTC payment flag needs the method named) could change a few of those numbers. Re-run if there's time: `RATE_LIMIT_PER_MIN=1000 npm run dev`, then `node scripts/eval/run.mjs final <url> --holdout` and `--set=hard` / `--set=student` / `--set=messy` / `--kind=lease`.
- **Self-hosted Gemma 4 (Ollama, this laptop):**
  - `e2b-it-qat`: 1/5 strict sample checks.
  - `e4b-it-qat`: 3/5; both read the lease photo.
  - `gemma4:26b` was not tested (README "Self-host Gemma 4").

## What changed overnight (`dev`)

| Commit | What |
|---|---|
| `4698968` | `docs/video-script.md` (2:00 shot list, narration, 30 s fallback), `docs/submissions.md` (MLH Gemma 4 + codingjam), `docs/process/track-decision.md` |
| `67b026a` | Merged `main` (map `inert`, soak record) |
| `9588eaf` | Task C: "Read by Gemma 4" links to "What Gemma read"; "Copy these questions"; tagline "Virginia, DC and Maryland"; **Census API notice** (verbatim, ES translation beside it); EN/ES toggle accessible name fixed |
| `a5d46c5` | Task A: question state, accent-insensitive quotes, "1.6k" rents, Spanish/Spanglish prompt vocabulary, `scripts/eval/messy.jsonl` |
| `34ac35e` | D4: `GEMMA_PROVIDER=ollama` self-hosting, tested; README table |
| `8977afc` | Council: clause numbers grounded, Likely-scam → full report, one 429 retry, **one Gemma call per check** (the strict schema mode got 400 on 46/46 calls, so the hosted path starts at JSON mode); docs claims corrected |
| `e6d5122` | Council top 3: the FTC payment flag needs the method in its quote; narrower injection regex; honest lease verdicts; README "Not just another scam keyword list" + "Impact we can measure so far"; `docs/process/council/rounds.md` |
| `f364f1c` | Task B: dark theme ("carbon paper at night"), follows the system + Light/Dark toggle; dark map; token table |

## Track recommendation
**Gemma 4.**
- It's core and multimodal, the model ID is everywhere, and it's measured against a keyword baseline (`docs/process/track-decision.md`).
- Open-Source AI is 6–7: self-hosting works, but the small local models over-flag and 26B is untested, and the judges' own example idea was a leasing scam detector.

## Cut, and why
- **Full eval re-run, final live gate, code-tour line refresh, council rounds 2+:** the 3-hour stall.
- **Council UI polish:**
  - put the "What Gemma read" facts in a closed drawer
  - remove the uppercase tracked label in `GemmaRead.tsx`
  - translate the English textarea placeholder in ES
  - fix focus in the sticky left column
  - stop the third stamp wrapping to row 2 at 1280
- **`lang="en"` on English quotes in Spanish mode.**
- **Community counter:** client-supplied hashes can inflate counts (rate-limited).
- **`.env.example`:** should list `GEMMA_PROVIDER` / `GEMMA_BASE_URL`. Claude may not edit `.env*`, so a human adds them.

## Human-only (nobody else can do these)
- **Student interviews (3–5) and the 3-person usability test**, with real quotes and permission, into `docs/validation.md`. Then the README quotes and video line N1.
- **Native Spanish speaker** skims ES mode (README says "not reviewed").
- **Redeploy `dev` to Cloud Run** and run live e2e on the URL.
- **Record the 2-minute video** on the live URL (`docs/video-script.md`): never a "Showing a saved result" take; show the model ID twice.
- **Merge `dev` → `main`**, then submit on both sites; rotate API keys after.

## Timed checklist (starts 8:45; we're 30 min behind the plan)

| Time | Ashwin | Yoshwan |
|---|---|---|
| 8:45–9:15 | Deploy `dev` (commands below); live e2e on the URL | Interviews / usability test with students at the venue (5 people if possible) |
| 9:15–9:30 | Merge `dev` → `main`, push (freeze at 9:30) | Paste quotes into `docs/validation.md` + 2 into README; commit to `dev`, then merge again |
| 9:30–10:30 | Record the video (live URL, `docs/video-script.md`) | Narrate; check the takes have no "saved result" |
| 10:30–10:50 | Edit, upload unlisted, test the link in a private window | Fill `docs/submissions.md` placeholders (video URL, student count) |
| 10:50–11:00 | Submit MLH OrganizerHQ (one track: Gemma 4) | Submit codingjam.dev (VT chapter) |
| After | Rotate the API keys | — |

## Commands

```bash
# Deploy (Ashwin's Mac), from an up-to-date dev checkout
git switch dev && git pull
./scripts/deploy.sh            # or the gcloud run deploy command in docs/DEPLOY.md
node scripts/e2e.mjs https://clearlease-477820387862.us-east4.run.app      # expect 5/5 PASS, live
node scripts/e2e-es.mjs https://clearlease-477820387862.us-east4.run.app   # expect 6/6 PASS

# Merge dev into main (no force-push)
git switch main && git pull
git merge --no-ff dev -m "Merge dev: overnight queue, council fixes, dark theme"
npm ci && npm test && npm run build
git push origin main
```
