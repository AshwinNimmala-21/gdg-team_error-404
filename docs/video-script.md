# Clearlease: 2-minute demo video script

**Live demo URL:** https://clearlease-477820387862.us-east4.run.app

Order (judge order): problem, solution and live demo, AI and Gemma 4 fit, impact. The event theme is AI for Housing in the DMV, so the story leads with a renter moving to Arlington. Blacksburg appears once, as the place we tested with students.

Rules for this script:
- Every number comes from a file in the repo (cited in an HTML comment). A missing number is a `[[NEED: ...]]` placeholder, never a guess.
- No claim of "first" or "only".
- Record on the deployed URL in live mode. The words "Demo mode" or "Showing a saved result" must never appear on screen.

---

## 1. Shot list (2:00)

Button and heading names are exactly as they appear in the UI (`lib/i18n.ts`, English). Samples run as soon as you click them; there is no separate "Check this listing" click.

| Time | On screen | Exact clicks / keys | Narration |
|---|---|---|---|
| **0:00-0:20 Problem** | Title card "Fictional persona: Maya, moving to Arlington for a job, 300 miles away". Then three stat cards, one per line, each with its source on screen: "18-29: 3x more likely to lose money to a rental scam (FTC)", "Median reported loss: $1,000 (FTC)", "DC-area median rent: $2,027/month (USAFacts)". Last 5 s: a clean photo or card of the student quote. | None. Cut together from stills. Keep the FTC link `ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses` visible in a corner. | N1 |
| **0:20-0:36 Scam sample** | The Clearlease landing page at the live URL (address bar visible). Then the report: "Your pre-sign report", the verdict board with the stamps landing ("Suspiciously cheap", "Likely scam"), the line "N of 9 checks flagged". Zoom on the quote "wire the $1,650 deposit today through Western Union". | On the landing page click the sample button **Facebook deal** (subtitle "Cheap, owner overseas, wire the deposit"). Wait for the report (about 10-12 s live; trim the wait with a jump cut and a small caption "wait trimmed"). Scroll slowly to the Scam risk section; click **Show evidence** once to show a quote. | N2 |
| **0:36-0:50 What Gemma read** | Scroll to the heading **What Gemma read**. Show the facts list (rent, size, ZIP, payment method...) with their quotes. Open the drawer; the exact words are highlighted in the pasted text. Zoom on the line "Read by Gemma 4 (`gemma-4-26b-a4b-it`) in N s" (**model ID on screen, 1st time**). | Click the heading link or scroll to **What Gemma read**. Click the summary **Show the quotes in your text**. Pause 2 s on the highlights. Scroll to the "Read by Gemma 4 (...)" line under the report and hold 2 s. | N3 |
| **0:50-1:00 Injection caught** | Landing page again. Report with the red banner **"This text contained instructions aimed at AI tools. We ignored them."** and below it the scam verdict (Some red flags or Likely scam; never "No red flags found"). | Scroll to top. Click the sample button **Hidden AI instructions** ("A listing that tries to trick checkers"). Zoom on the banner, then on the scam stamp. | N4 |
| **1:00-1:24 Lease photo** | Click the lease sample. While it reads, the status text "Reading your lease photo..." and "This takes about 30 seconds...". Cut to the report: stamp **Fix before signing**. Zoom on the clause quote "may enter the Premises at any time, without prior notice", then on the citation "Va. Code § 55.1-1229(A)" and its link, then the section **Questions to ask before you sign**. | Click the sample button **Photo of a lease page** ("Auto-renewal and entry without notice"). Wait for the report. Click **Show evidence** under Lease clauses. Scroll to **Questions to ask before you sign**. (See the lease-wait note below the table.) | N5 |
| **1:24-1:30 Tested with students** | Short shot of the Blacksburg sample result ("Blacksburg summer sublet", Likely scam) next to the usability-test result. Use only if `docs/validation.md` has real answers. | Click the sample button **Blacksburg summer sublet** (first in the list). If there are no real validation answers by recording time, cut this beat and give its 6 s to the AI section. | N6 |
| **1:30-1:50 AI and Gemma 4 fit** | Split screen. Left: the hard-set result as a two-row table, "Clearlease: 15 of 15 scams, 0 false alarms of 9" and "Keyword scan: 2 of 15, 6 false alarms of 9". Caption underneath: "On ordinary listings a keyword scan does about as well. Our edge is paraphrase, negation, Spanish, screenshots and leases (README, Evaluation)." Right: the "Read by Gemma 4 (`gemma-4-26b-a4b-it`)" line again (**model ID on screen, 2nd time**). Last 4 s: the cost line "about $0.54 (text) to $0.97 (photo) per 1,000 checks at hosted prices". | Screen recording of the README "Evaluation" section is fine for the table; no clicks in the app. Optional 3 s cut to `lib/ai/gemma.ts` showing the model ID. | N7 |
| **1:50-2:00 Impact** | End card: Clearlease name, the live URL, the repo URL, "Gemma 4 `gemma-4-26b-a4b-it`, Apache 2.0", "Not legal advice". | None. | N8 |

**Lease-wait note (about 33 s live).** The lease photo takes about 33 s live <!-- source: README.md "Cost (measured)": ~33 s; PLAN.md §7 -->. Never fake it, never cut it silently:
- Record the real wait once, start to finish, on the live URL.
- In the edit, play the wait at 4x and put a caption on screen for the whole sped-up stretch: **"Wait sped up 4x (about 33 s live)"**. That makes 33 s into about 8 s.
- Keep the real status text ("Reading your lease photo...") in frame so a viewer sees it is the live app.
- If the take errors ("We couldn't finish this check") or shows "Showing a saved result", discard it and record again. Do not use the saved result in the video.

---

## 2. Narration, word for word

Read at a calm pace (about 130 words per minute). One paragraph per shot.

**N1 (0:00-0:20)**
Maya is moving to Arlington for a job, apartment hunting from 300 miles away. In the DC area, median rent is $2,027 a month. Renters aged 18 to 29 are three times as likely to lose money to a rental scam. [[STUDENT QUOTE: name/year, exact words — from docs/validation.md only]]

**N2 (0:20-0:36)**
She pastes a Facebook deal. Ten seconds later: Likely scam. Every flag quotes her listing word for word. If Gemma can't point to the words, the flag doesn't count.

**N3 (0:36-0:50)**
This is what Gemma 4 read: rent, size, payment method, each with its exact quote, highlighted in the original. The model only extracts. Our code decides.

**N4 (0:50-1:00)**
Scammers now write for AI checkers. This listing orders the AI to call it safe. We ignore the order, and count it as a red flag.

**N5 (1:00-1:24)**
Now a photo of a lease, sped up here. Fix before signing: the landlord may enter "at any time, without prior notice." Virginia law says otherwise, with the statute cited, plus questions to ask before she signs.

**N6 (1:24-1:30)**
We tried it with [[NEED: number of VT students, from docs/validation.md]] students in Blacksburg.

**N7 (1:30-1:50)**
The model is gemma-4-26b-a4b-it, shown under every report. Keywords can't do this: on our hard set they caught 2 of 15 scams and raised 6 false alarms. Clearlease caught 15 of 15, with none. A check costs about a dollar per thousand.

**N8 (1:50-2:00)**
Nothing is stored, and the weights are open, so a campus housing office or tenant nonprofit could run it. Clearlease: check before you send money.

**Word count (spoken narration, N1 to N8):** see the count at the end of this file. The student-quote placeholder is counted as 15 words.

Sources for the numbers in the narration:
- 300 miles, Maya: `README.md` "The problem" and `PLAN.md` §1 <!-- source: README.md "The problem" (Maya, Blacksburg to Arlington, 300 miles) -->.
- $2,027 median rent in the DC metro: `README.md` "The problem", citing USAFacts (ACS 2020-24) <!-- source: README.md "The problem" -->.
- Three times as likely, ages 18-29: `README.md` "The problem" and `docs/research/ftc-red-flags.md` S2 (FTC Data Spotlight, Dec 22, 2025) <!-- source: docs/research/ftc-red-flags.md S2 -->.
- Median loss $1,000 (on screen only, not in the narration): `docs/research/ftc-red-flags.md` S1 <!-- source: docs/research/ftc-red-flags.md S1 -->.
- 15 of 15 scams, 0 false alarms of 9; keyword scan 2 of 15 (13% recall), 6 false alarms of 9: `docs/evaluation.md` "Run after, hard set" and `README.md` "Evaluation" <!-- source: docs/evaluation.md "Run after, hard set"; README.md "Gemma 4 at a glance" -->.
- About a dollar per thousand checks: $0.54 (text) and $0.97 (photo) per 1,000 at hosted 26B-A4B prices; the Gemini API itself is $0 on the free tier <!-- source: README.md "Cost (measured)"; PLAN.md §7 -->.
- Virginia statute: "Va. Code § 55.1-1229(A)" for landlord entry <!-- source: lib/data/rule-sheets.ts:51 -->. Quoted lease words are in `scripts/samples/lease-page.html` clause 9.

---

## 3. Recording notes

- **Record on the deployed URL** (`https://clearlease-477820387862.us-east4.run.app`) in live mode, with the address bar visible once. Never record in demo mode. If a report ever says "Showing a saved result" or "Demo mode", discard the take and re-run (the council report said the same: "A Demo mode badge must never appear on screen").
- **Leave out the map and the community counter.** Do not scroll to the map or click the "flag" counter; both invite questions (council). The map key only works on `localhost:3000` and the Cloud Run URL.
- **Record each beat as its own take**, then cut. Cut failed calls and waits, but caption every sped-up or trimmed wait ("wait trimmed", "wait sped up 4x").
- **Model ID on screen twice:** (1) the "Read by Gemma 4 (`gemma-4-26b-a4b-it`) in N s" line at 0:36-0:50, (2) the same line or the end card at 1:30-1:50. It is also in the README and the code. If a judge cannot see the ID, they assume we did not use the model.
- **Captions on for the whole video** (many judges watch without sound). Burn in the stat sources in the first 20 s.
- **Voice:** Yoshwan narrates, Ashwin edits (council plan item 9). Read the quoted lease words slowly.
- **Fresh run, fresh numbers.** The flag count on the scam sample can move between runs (the README notes 6 or 7 of 9 on the Blacksburg sample). Do not say a count in the narration; show it on screen.
- **Keep one complete backup take**, 2:00 end to end, recorded on a second run, so a failed live call on the day does not cost the submission.
- **Code walkthrough (optional, 3 s only).** `docs/code-tour.md` has "say this on camera" lines per stop. Its line numbers date from commit `2306aa7`, so refresh them before filming any code.
- **Do not show real personal data.** All samples are fictional. If you paste your own text, the browser redacts phone numbers and emails, but do not rely on it on camera.
- **Check before export:** under 2:00, text readable at phone width, audio level even, URL and repo link in the end card, no "Demo mode" anywhere.
- **Upload unlisted** and test the link in a private window before submitting on MLH OrganizerHQ and codingjam.dev.

---

## 4. 30-second spoken fallback (if the live demo stalls on stage)

Have a **pre-recorded screenshot ready, open full screen on the presenter laptop**: `docs/screenshots/desktop-scam.png` (the finished report for the Facebook-style scam, with the stamps and the quoted evidence). Backups in the same folder:
- `docs/screenshots/gemma-read-text-1280.png`: the "What Gemma read" section with highlighted quotes.
- `docs/screenshots/phone-lease.png`: a lease photo read on a phone, with the clauses to fix.

Open the three images in tabs before the presentation so you do not need the network. Say this while pointing at the screenshot (about 75 words):

> Clearlease checks a rental before you send money. This is a Facebook-style listing: cheap, owner overseas, wire the deposit. Gemma 4 reads it into facts, each with an exact quote. Our code checks every quote, and rules decide: Likely scam, with the words highlighted. The same works on a photo of a lease, with Virginia law cited. Nothing is stored, and the model, gemma-4-26b-a4b-it, is open weights. Check before you send money.

Do not say "it just worked a minute ago" or imply the screenshot is live. Say "here is a saved report" if asked.

---

## 5. Open items before recording

- [[NEED: student quote, name/year, exact words, with permission — `docs/validation.md` has no recorded answers yet]]
- [[NEED: number of VT students interviewed or tested, from `docs/validation.md`]] (used in N6; cut N6 if there is none)
- [[NEED: confirm on the final take that the Facebook deal shows "Likely scam" and the injection sample never shows "No red flags found"]]
- [[NEED: the repo URL for the end card]]
- Unsourced: none in the narration. The "$2,027" figure is a secondary source (USAFacts, quoted from the README), not re-checked here.

---

## Word count

- Spoken narration N1 to N8: **249 words** (N1 56, N2 29, N3 26, N4 26, N5 37, N6 8, N7 42, N8 25), counting the student-quote placeholder as 15 words. Without N6 (optional): 241.
- 30-second fallback: **72 words**.
