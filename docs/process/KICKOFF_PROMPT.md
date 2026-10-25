# Clearlease — hackathon kickoff. Read everything before acting.

You are the lead engineer, architect and product partner for team **error-404** (Ashwin Nimmala, Yoshwan Pathipati) at the GDG @ Virginia Tech "AI for Housing" hackathon (Oct 24–25, 2026). Goal: **1st place GDG Best Overall + one MLH track**. Be concise, decisive, numbered. Never claim something works until you ran it and told us how you checked.

The repo has `docs/process/brief/` containing: `event-notes.md` (cleaned opening ceremony + judges' workshop), `research-facts.md` (verified stats with sources), `partner-brief.md`, `event-slides.pdf` (the organizers' deck), and possibly `raw-transcript*.md`. Read all of it first. Priority on conflicts: slides > event-notes > raw transcripts. If a PDF won't read, say so and continue from event-notes.

---

## 0. Non-negotiable facts (from the organizers and judges)

- Theme: AI for Housing, DMV region (DC / Maryland / Virginia). Anything housing-related; validate a real problem; small-and-working beats big-and-broken.
- Timeline: hacking began Sat 11:00 AM. Submission window **Sun 11:00–12:30 PM, hard**. Closing 2:00 PM. Demo video is **2 minutes**. README is scored heavily.
- Tracks: everyone is in GDG Best Overall (1st/2nd/3rd). Exactly ONE MLH track: Gemma 4 / Open-Source AI / Google Cloud / UI-UX. We build to qualify for **Gemma 4, Open-Source AI and UI/UX** simultaneously and pick one Sunday 9:30 AM. We are **NOT** entering the Google Cloud track (we host on Cloud Run anyway).
- GDG rubric (100): Problem & impact 25 (definition 10, measurable impact 10, stakeholder empathy 5) · Tech & AI 25 (AI necessity 15: multimodal / agentic / embeddings, not a gimmick; architecture 10) · Responsible AI 25 (safety & grounding 10, privacy 8, inclusive design/WCAG 7) · Feasibility 25 (deployment viability for nonprofits 10, inference cost 8, documentation 7).
- Judges said: they care HOW we use the model, not which. If the model ID isn't in the README they assume we aren't using it. Show the integration in the demo. Not production-ready is fine; feasibility of the idea + implementation matters. For UI/UX: polished AND effortless, not the "AI look with round corners".
- Submissions (both, same project): MLH OrganizerHQ (public repo + LICENSE, name, description, tech, 2-min video, one MLH track) and codingjam.dev (Virginia Tech chapter entry). Rules: everything built this weekend; AI coding tools allowed and disclosed; all code public.

## 1a. Decisions already made (do not re-ask these)

- Audience: anyone renting in the DMV for the first time or moving — students, new grads relocating for a job, people moving in/out. Demo story for the video: a VT grad who just got a job in Arlington and is comparing listings from 300 miles away.
- MVP inputs: pasted text + uploaded image (screenshot or lease photo). PDF leases only if a Phase 4 round earns it.
- Model: `gemma-4-26b-a4b-it` default; benchmark `gemma-4-31b-it` once on the lease sample, switch only on evidence.
- Scope: three verdict cards + evidence drawer + "questions to ask before you sign". No map, no listing search, no history, no chat box.
- Primary MLH track: Gemma 4. UI/UX is the Sunday-morning fallback if the design is exceptional. Open-Source requirements (Apache-2.0, model + license link) are met regardless.
- Jurisdiction rule sheet: Virginia + DC first, Maryland if time.

## 1. The product (locked unless we say otherwise)

**Clearlease** — a pre-sign check for DMV renters, built for students. Paste a listing, or upload a screenshot / lease photo, plus a ZIP. In ~10 seconds you get three verdicts you can act on:

1. **Price check** — the asking rent vs HUD Fair Market Rent and Census median gross rent for that ZIP/county, computed in TypeScript (never by the model). "This 1BR is 38% above FMR for Arlington County" or "18% BELOW market — a known scam signal (FTC)".
2. **Scam risk** — Gemma 4 extracts structured facts (price, deposit, contact method, pressure language, "out of town landlord", wire/Zelle/gift-card asks, off-platform contact, no in-person showing); a deterministic TS rule set scores them against FTC's published red flags. Every flag quotes the exact input text that triggered it.
3. **Lease clauses** — for an uploaded lease: plain-language explanation of risky clauses (fees, auto-renew, entry, early termination, waivers), mapped to the jurisdiction (DC / MD / VA tenant-law rule sheet we ship as data), with a "questions to ask before you sign" list.

Why it wins: it is **multimodal** (Gemma reads images), **grounded** (HUD + Census + FTC rules + jurisdiction sheet; model never invents numbers), **measurable impact** (FTC: ~65k rental-scam reports, ~$65M lost, median loss $1,000, ages 18–29 are 3× more likely to lose money; ~half of DC-metro renters are cost-burdened), **private** (nothing stored, no login), **cheap** (26B-A4B MoE, small prompts, zero DB), **accessible** (WCAG baseline), and **demoable in 2 minutes** with three sample inputs.

Users: VT/GMU/GWU/UMD students and first-time DMV renters. Deployable by a nonprofit (a campus off-campus-housing office or a tenant-rights org) as a single Cloud Run service with one API key.

## 2. Stack (verified; do not substitute)

- Next.js App Router + TypeScript + Tailwind. Node 20+.
- `@google/genai` via the **Gemini API**. Models supported for Gemma 4 on the Gemini API: `gemma-4-31b-it` and `gemma-4-26b-a4b-it` (verified at ai.google.dev/gemma/docs/core/gemma_on_gemini_api). Default to **`gemma-4-26b-a4b-it`** (MoE, 4B active params → faster + cheaper; fits the "inference cost" rubric). Keep `GEMMA_MODEL` env-overridable; benchmark 31B once on the lease sample and record the decision in PLAN.md. Gemma 4 on this API supports image input, function calling and JSON output — verify exact call shapes against the installed package types, not memory.
- Data: HUD FMR API `GET https://www.huduser.gov/hudapi/public/fmr/data/{entityid}` with `Authorization: Bearer <HUD_TOKEN>` (county entity = 5-digit FIPS + "99999"; metro FMRs cover most of the DMV). Census ACS 5-year table `B25064_001E` (median gross rent) by ZCTA with `CENSUS_KEY`. Ship a **static fallback JSON** of FMRs/medians for ~15 DMV counties + Montgomery County VA so the demo never depends on a live API.
- No database. No login. No Google Maps in the MVP (avoids NEXT_PUBLIC build-time vars entirely; add only if a revision round earns it).
- Hosting: **Google Cloud Run**, deployed with `gcloud run deploy clearlease --source . --region us-east4 --allow-unauthenticated --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,HUD_TOKEN=HUD_TOKEN:latest,CENSUS_KEY=CENSUS_KEY:latest`. Build-time vars (only if we ever add `NEXT_PUBLIC_*`) go through `--set-build-env-vars KEY=VALUE` — this flag exists for `--source` deploys only (verified at docs.cloud.google.com/run/docs/configuring/services/build-environment-variables). Runtime secrets come from Secret Manager; the Cloud Run service account needs `roles/secretmanager.secretAccessor`. Next.js must listen on `process.env.PORT` (the `next start` default honors it). Write the full deploy runbook into `docs/DEPLOY.md` (enable APIs: run, cloudbuild, artifactregistry, secretmanager; create secrets; grant roles; deploy; how to redeploy) with commands that work in PowerShell. Prefer `output: "standalone"` in `next.config` plus a small multi-stage `Dockerfile` so the Cloud Run build is deterministic; test `docker build` only if Docker is installed, otherwise rely on Cloud Build. We run gcloud ourselves when you tell us to.
- Env var names (values live in `.env.local`, which you must **never read, print, or commit**): `GEMINI_API_KEY`, `HUD_TOKEN`, `CENSUS_KEY`, `GEMMA_MODEL` (optional), `FRED_API_KEY` (unused unless needed).
- Keys are placeholders until we add them: every external call must degrade to the static fallback + a visible "demo data" badge, so the whole UI can be built and clicked through before any key exists.

## 3. Engineering rules (always)

1. All model and data calls run server-side (route handlers); keys only from `process.env`.
2. The model never invents numbers or legal facts. It **extracts** (structured JSON with a strict schema and Zod validation) and **explains in plain language, quoting the input**. All math, thresholds and risk scores live in TypeScript (`lib/rules/*.ts`) with unit tests.
3. Store nothing personal. No logs of user text. Uploaded images go to the API and are dropped; say so in the UI.
4. Prompt-injection defense: user content is wrapped as data (delimited, never as instructions); system prompt pins the task; output must validate against the schema or we show a safe error. Ship a demo sample that attempts an injection and show it being ignored.
5. Minimal deps. Commit after every working step with a clear message. Never run `npm audit fix --force`.
6. If something fails twice, stop and give us 2–3 options instead of retrying.
7. It is a responsive website, designed **mobile-first**: a renter checks a listing from their phone, standing outside the building. Every screen must work at 375px width (no horizontal scroll, image upload from camera roll works, verdict cards stack) and scale up to desktop. Test both viewports before every STOP; the demo video shows desktop + one phone shot.
8. Accessibility is part of "done": semantic HTML, labels, keyboard flow, visible focus, contrast ≥ 4.5:1, alt text, `aria-live` for results, reduced-motion respected.
9. Images: resize client-side to max 1600px long edge, JPEG ~0.85, before upload; reject > 8 MB with a clear message. Keeps tokens, latency and Cloud Run request size down.
10. Abuse/cost guard: simple in-memory per-IP rate limit on `/api/check` (e.g. 10/min) and a max input length; the public URL must not be able to drain the key.
11. Every result shows "This is not legal advice" plus links to real help for the jurisdiction (e.g. Virginia Residential Landlord and Tenant Act handbook, DC Office of the Tenant Advocate, Maryland Attorney General consumer protection, ReportFraud.ftc.gov). The researcher verifies those URLs.
12. Everything built this weekend. Disclose Claude Code in the README.
13. Windows dev machine: Claude Code runs commands in Git Bash on Windows. Use cross-platform npm scripts (no `export VAR=`; use `cross-env` only if needed). Paths in code are POSIX.

## 4. Shared memory

`CLAUDE.md` (auto-loaded) imports `AGENTS.md` and `PLAN.md`. `AGENTS.md` = facts, rubric, rules, stack, decisions. `PLAN.md` = scope, status, next steps, open questions. After every decision or milestone: update them and commit. A fresh Claude Code session on the other laptop must be able to continue with zero context from us.

## 4b. Design direction (write this into `docs/design-principles.md` in Phase 1; ux-critic and all UI work follow it)

- Ground the look in the subject: leases, listings, inspection reports, a building super's clipboard. It should feel like a trustworthy, plain-spoken tool a tenant advocate would hand you — not a SaaS landing page.
- Before writing UI code, write a compact token plan in the doc: 4–6 named hex colors, 1–2 typefaces with roles and a type scale, a layout concept with ASCII wireframes for 375px and desktop. Then review it: if any part reads like a default you'd produce for any app, change it and note why.
- Avoid the generated-look defaults: warm cream background + serif + terracotta accent; near-black + one acid accent; identical rounded cards with the same soft shadow; gradient washes; ALL-CAPS tracked eyebrow labels; "A · B · C" meta strings; arrows appended to buttons; fade-up animation on every section; one accented word in a headline.
- Spend boldness in ONE place: the verdict moment (how the three verdicts land). Everything else quiet and disciplined. Verdict states must not rely on color alone (icon + word + color).
- Copy: plain verbs, sentence case, written for a stressed renter. Buttons say exactly what happens ("Check this listing"). Errors say what happened and what to do. Empty state invites the first action and offers the three sample inputs.
- Quality floor: responsive to 375px, visible keyboard focus, reduced motion respected, contrast ≥ 4.5:1. Take screenshots (Playwright) at 375 and 1280 and critique them before every UI STOP.

## 5. The agent team (create these in Phase 1; keep them small and sharp)

Create project agents in `.claude/agents/` and use them with the Agent tool. Each file: frontmatter `name`, `description` (when to use), tools, and a tight system prompt.

- `researcher` — read-only + web. Verifies facts, finds sources, pulls API docs/response shapes. Returns citations. Never writes code.
- `architect` — reads repo, produces/updates PLAN.md sections, Mermaid diagrams, types. No code edits.
- `judge` — the rubric scorer. Reads the live repo + deployed URL text + README, scores every rubric line (item | points | current | gap | fix | effort), plus Gemma-4 / Open-Source / UI-UX track fit out of 5 with evidence. Harsh by design: assumes a judge has 4 minutes and no context.
- `ux-critic` — loads `docs/design-principles.md` (section 4b) and screenshots at 375px and 1280px; audits typography, layout, copy, flow, accessibility; produces a numbered fix list. Flags any "AI-generated look" tells (cream bg + serif + terracotta, identical rounded cards, ALL-CAPS eyebrows, gradient washes, arrows on buttons, fade-up-everything motion).
- `security-reviewer` — checks key handling, injection surface, schema validation, PII, dependency bloat.
- `qa` — runs `npm run build`, `npm run lint`, unit tests, and a scripted end-to-end run of the 3 demo samples against localhost; reports pass/fail with exact commands.

Also create `.claude/skills/`:
- `grill` — a stress-test interview skill: works the design tree in rounds, numbers each question, gives a recommended answer, waits. Use it at every STOP.
- `rubric-audit` — the judge's table format + the three track-fit checklists, so audits are consistent across rounds.

Run independent agents in parallel. Relay conclusions to us, not transcripts.

## 6. Phases — STOP where it says STOP (we answer, you continue)

### Phase 0 — safety rails (3 min)
1. Create `.claude/settings.json` exactly:
```json
{"permissions":{"deny":["Read(.env*)"],"ask":["Bash(git push *)","Bash(rm *)","Bash(npm audit fix *)","Bash(gcloud *)","Bash(vercel *)"]}}
```
2. Add `.env.local` and `.env*.local` to `.gitignore` (verify they are not already tracked with `git ls-files`).
3. Give us 3 questions to ask real students in the next hour and a one-line template for answers (we will paste results into `docs/validation.md`).

### Phase 1 — bootstrap + agents + grill (10 min) → STOP
1. **Fresh start.** The repo has old commits we are not using. Run `git log --oneline` and list every tracked file so we can see what goes. Then remove everything from the working tree with `git rm -r` EXCEPT: `.git/`, `docs/process/brief/`, `docs/process/KICKOFF_PROMPT.md`, `.gitignore`, `.claude/settings.json`, and `.env.local` (never touch or read it). Commit as `chore: clean slate for Clearlease`. History stays in git, so nothing is lost. Then scaffold: `create-next-app` refuses non-empty folders, so run it in a temp sibling folder (`npx create-next-app@latest ../cl-tmp --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm`), copy its contents (not its `.git`) into the repo root, delete the temp folder, then install `@google/genai zod` and `vitest` (dev) for the rules tests. Run `npm run build` once to prove the scaffold works. Create: Apache-2.0 `LICENSE`, `.env.local.example` (names only), `CLAUDE.md` (imports `@AGENTS.md` and `@PLAN.md`), `AGENTS.md` (sections 0–4 of this brief, condensed), `PLAN.md` skeleton, `docs/DEPLOY.md` stub.
2. Create the agents and skills from section 5.
3. Dispatch `researcher` (background) on: exact HUD FMR response shape and the DMV entity IDs; Census ACS ZCTA query shape; FTC rental-scam red-flag list; DC/MD/VA tenant-law essentials for a rule sheet (security deposit caps/return deadlines, notice to enter, late-fee limits, required disclosures, retaliation). Output to `docs/research/*.md` with sources.
4. Commit, push. Then run the `grill` skill on us for ONE round only, limited to decisions NOT already settled in section 1a (e.g. exact verdict wording, how the evidence drawer looks, what "demo data" badge says, repo layout if the partner's scaffold conflicts). Give your recommended answer on every question; we will mostly say "yes to all". **STOP.**

### Phase 2 — MVP plan (10 min) → STOP
Write into PLAN.md: user + core flow; what Gemma does per step (extraction schema, explanation prompt) and 26B vs 31B with cost/latency reasoning; **MVP scope** = the smallest end-to-end path showing all three verdicts on the samples, plus an explicit **"not in MVP"** list; Mermaid architecture diagram; the TypeScript types for `CheckRequest`/`CheckResult`; three fictional demo samples (clearly labelled) — (a) a plausible Arlington 1BR listing that's fine, (b) a Facebook-style scam listing 25% under market with wire-deposit pressure, (c) a lease photo/PDF with an auto-renew + entry-without-notice clause; plus (d) an injection attempt. For (c), generate a realistic fictional lease page as an image (render HTML to PNG with Playwright) and save all samples in `public/samples/` so the demo works with one click. Have `architect` and `judge` both review the plan; show us the judge's predicted score. **STOP.**

### Phase 3 — MVP sprint (target: live on Cloud Run by ~4 PM Sat)
Order: `lib/rules` + `lib/data` with unit tests on the fallback data → Gemma extraction route (`app/api/check/route.ts`, structured JSON, Zod, injection wrapping, works with placeholder key via mock mode `MOCK_AI=1`) → minimal but hand-designed UI (one page: input panel, three verdict cards, evidence drawer, questions list, "what we send / what we keep" note) → loading/error/fallback states → `qa` agent run → commit → `docs/DEPLOY.md` → tell us to deploy and exactly what to paste. Stop only when: (1) all 3 samples produce correct output locally in mock mode; (2) we add the real key and it works; (3) the Cloud Run URL works. Keep a running cost-per-request estimate in PLAN.md.

### Phase 4 — rubric revision rounds (repeat until feature freeze Sun 9:30 AM)
Each round: `judge` audit table → top 3 fixes by points-per-hour + `ux-critic` top 3 → **STOP** (we pick, may add) → implement in small diffs → build + lint + tests → tell us how to test (URL, input, expected) → commit → update PLAN/AGENTS → 2–4 sentences on how it works, so we can explain it to judges.
Must be covered across rounds: grounding with quoted evidence; refusals + injection demo; privacy statement in-UI; full accessibility pass (keyboard-only walkthrough recorded in PLAN); hand-designed visual identity; cost table (model, prompt tokens, est. $/1k checks); resilience (cached sample results so the demo survives a slow API); student-feedback changes from `docs/validation.md`; README quality.
Parallel work rule: one person per folder (`app/api` + `lib` vs `app/(ui)` + `components`), separate branches, pull before starting, small commits, no force-push.

### Phase 5 — ship (start Sun 9:30 AM)
0. Track decision: score Gemma 4 / Open-Source AI / UI-UX fit out of 5 with evidence + likely competition. Recommend ONE. Lead the README with it.
1. README: one-line pitch + screenshot; problem with student validation quotes and the FTC/cost-burden stats with links; how it works + Mermaid diagram; **exact model ID** + link to Gemma license; why this model (cost, privacy, runs on a nonprofit's own hardware); responsible-AI measures; accessibility; setup guide; API dependency table; "Built with" incl. Claude Code; license.
2. Verify LICENSE renders on GitHub; `git log -p | grep -i "api_key\|token"` returns nothing secret.
3. 2-minute video script in the judges' order (problem 20s → solution/demo 70s → AI + track fit 20s → impact 10s) with exact clicks per sample.
4. Submission text for MLH OrganizerHQ and codingjam.dev (VT chapter).
5. Final checklist.

## 7. Style
Short, numbered, recommended defaults. Ask only questions that change what you build. Update PLAN.md before every STOP so the other laptop is never behind.

**Start with Phase 0.**
