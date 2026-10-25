# Council rounds (overnight, Sun Oct 25)

Strict-judge councils run on Yoshwan's laptop during the overnight queue. Each round:
- **Stage 1:** four independent judges, each told "you are a strict judge with 4 minutes and no context, looking for reasons to mark this down".
- **Stage 2:** the judges are anonymized as W/X/Y/Z, and each ranks the other three and flags their errors.
- **Stage 3:** a chairman (fresh context) merges everything into one table and picks the top 3 fixes by points per hour.

The main session then implements those fixes within the round's time-box.

Human-only lines (student quotes, the video, a live run of the latest code on the deployed URL) are scored as missing until an artifact exists. No numbers or quotes are invented to raise a score.

## Round 1 (Sun 05:07–05:30)

**Judges:**
- A: GDG rubric (fable).
- B: Gemma 4 and Open-Source AI tracks (opus).
- C: UI/UX and WCAG, from 16 fresh screenshots in `docs/screenshots/council-r1/` (opus).
- D: skeptical engineer (sonnet).
- Chairman: opus, fresh context.

**Stage 1 headline scores:**
- A: GDG 78/100.
- B: Gemma 4 7.5/10, Open-Source 6.5/10.
- C: UI/UX 7.5/10.
- D: 12 findings, 2 rated high.

**Stage 2 ranking (accuracy × impact):** D and A highest, B third, C fourth ("accurate but mostly polish"). Peers caught:
- B's stale "2 calls per check".
- D's wrong line numbers outside `scam.ts`, from continuous `cat -n` numbering.
- C misreading the verdict list as a grid.

**Chairman's merged scorecard (working tree, 05:20):**

| Item | Max | Score | Main gap |
|---|---|---|---|
| Problem definition | 10 | 8 | No "why not a generic scam detector" |
| Measurable impact | 10 | 4 | Eval numbers only, no field data |
| Stakeholder empathy | 5 | 2 | `docs/validation.md` has no real answers |
| AI necessity | 15 | 13 | Edge is on paraphrase/Spanish/photos (stated honestly) |
| Architecture | 10 | 8 | Deployed revision unknown |
| Safety & grounding | 10 | 8 | Payment flag trusted the model's method list; lease title/status mismatch |
| Privacy | 8 | 7 | Free-tier API receives photos (disclosed) |
| Inclusive design | 7 | 6 | Spanish not native-reviewed; English quotes lack `lang` |
| Nonprofit deployment | 10 | 8 | Live URL may run old code; 26B self-host untested |
| Inference cost | 8 | 7 | Price from a secondary source |
| Documentation | 7 | 6 | Public `main` is 31 commits behind `dev`; stale PLAN |
| **GDG total** | **100** | **77** | ~79 with the top-3 fixes; ~87 if the human items land (estimates) |
| MLH Gemma 4 | 10 | 8 | No video of a live photo read |
| MLH Open-Source AI | 10 | 7 | 26B self-host never run |
| MLH UI/UX | 10 | 7.5 | Polish items below |

**Fixed during the round** (commit `8977afc`, gated: 123 tests, e2e EN 5/5 and ES 6/6 live):
- Lease clause numbers must appear in their clause's quote (`groundNumbers`, `lib/rules/lease.ts`).
- A "Likely scam" message never goes to the question panel.
- One wait-and-retry on HTTP 429.
- **One Gemma call per check.** The strict schema mode got a 400 on 46/46 calls (including a test without the thinking setting), so the hosted path now starts at JSON mode. Verified live.
- README/docs claims corrected: call count, schema wording, test counts, "11 of 12 by hand + 1 scripted", saved-result fallback disclosed.

**Chairman's top 3, implemented (05:23–05:30):**
1. **Scam grounding:** the heavy FTC payment flag (weight 2) needs the method named in its quote, not just in the model's list. The "you are now…" injection pattern now only matches role-play jailbreaks, and the English patterns have word boundaries. We did *not* add the suggested 8-character minimum: real quotes like "Zelle" are 5 characters.
2. **Lease verdict honesty:**
   - Titles follow the demoted severity.
   - A lease whose clauses all failed to match reads "We couldn't match N clauses to your text" (warn), not green "standard".
   - A lease read with no clauses shows "No clauses found" (neutral). EN + ES.
3. **Docs:**
   - "Not just another scam keyword list" near the README top.
   - "Impact we can measure so far", using only existing eval numbers and labelled as having no field data.
   - PLAN.md stale sections refreshed.

**Not done this round (logged for later rounds):**
- UI polish from C: "What Gemma read" facts in a closed drawer, the uppercase label in GemmaRead, the English placeholder in ES mode, sticky-column focus, stamps wrapping at 1280.
- `lang="en"` on English quotes in Spanish mode.
- The community counter's client-supplied hashes (rate-limited, low impact).
- Re-running the lease eval after `groundNumbers`.

**Human-only asks:**
- **Ashwin, by 8:45:** 3–5 VT student interviews and the 3-person usability test, in `docs/validation.md`.
- **Either, by 9:00:** a native Spanish speaker skims ES mode.
- **After the 9:30 freeze:** merge `dev` into `main` (31+ commits behind).
- **By 10:00:** redeploy and run e2e on the URL.
- **By 10:45:** record the video.
- **11:00:** submit.
