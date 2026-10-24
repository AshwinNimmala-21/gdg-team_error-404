# Clearlease — agent facts (condensed from KICKOFF_PROMPT.md §0–4)

Team error-404 (Ashwin Nimmala, Yoshwan Pathipati), GDG @ Virginia Tech "AI for Housing" hackathon, Oct 24–25 2026. Goal: 1st GDG Best Overall + one MLH track. Full brief: `KICKOFF_PROMPT.md`; event facts: `docs/brief/`. Status and next steps: `PLAN.md`. Conflict priority: slides > `docs/brief/event-notes.md` > raw transcripts.

## Facts
- Theme: AI for Housing, DMV (DC/MD/VA). Validate a real problem; small-and-working beats big-and-broken.
- Submission window **Sun Oct 25 11:00–12:30 PM, hard**. Closing 2:00 PM. Demo video **2 min**. README is scored heavily.
- Tracks: all teams are in GDG Best Overall. Exactly ONE MLH track. Primary: **Gemma 4**; fallback **UI/UX** (decided Sun 9:30 AM). We also meet Open-Source requirements. NOT entering Google Cloud (we still host on Cloud Run).
- GDG rubric (100): Problem & impact 25 (definition 10, measurable impact 10, stakeholder empathy 5) · Tech & AI 25 (AI necessity 15, architecture 10) · Responsible AI 25 (safety & grounding 10, privacy 8, inclusive design/WCAG 7) · Feasibility 25 (nonprofit deployment 10, inference cost 8, documentation 7).
- Judges: they care HOW the model is used. **Exact model ID must be in the README** or they assume we didn't use it. Show the integration in the demo. UI/UX = polished AND effortless, not the "AI look".
- Submit to both MLH OrganizerHQ (public repo + LICENSE, 2-min video, one track) and codingjam.dev (VT chapter). Everything built this weekend; Claude Code use disclosed.

## Decisions (settled — do not re-ask)
- Product: **Clearlease**, a pre-sign check for DMV renters (students, new grads relocating, first-time renters). Demo story: VT grad with a new Arlington job comparing listings from 300 miles away.
- Inputs: pasted text + uploaded image (screenshot / lease photo) + ZIP. PDF only if a Phase 4 round earns it.
- Output: three verdict cards (Price check, Scam risk, Lease clauses) + evidence drawer + "questions to ask before you sign". No map, search, history, chat box, login, or DB.
- Model: `gemma-4-26b-a4b-it` default (env `GEMMA_MODEL`); benchmark `gemma-4-31b-it` once on the lease sample; switch only on evidence (record in PLAN.md).
- Jurisdiction rule sheets: VA + DC first, MD if time.
- Verdict words:
  - Price: Below market / Typical / Above market
  - Scam: No red flags found / Some red flags / Likely scam ("N of 9 checks flagged"; never "safe")
  - Lease: Looks standard / Ask about N clauses / Clauses to fix before signing
  - Each verdict = icon + word + color.
- Evidence in native `<details>`. "We read: … [Edit]" reruns the rules only. One `POST /api/check`. Full list in PLAN.md "Decisions".
- Ownership after the MVP: Yoshwan = `app/api` + `lib`, Ashwin = `app/(ui)` + `components`.
- Price benchmark = HUD FMR (FY2027) for the bedroom count. The model never computes prices or legality. Quotes are verified against the input before a flag counts.

## Stack (do not substitute)
- Next.js 16 App Router + TypeScript + Tailwind v4, Node 24 locally (20+ OK). `@google/genai` (Gemini API), `zod`, `vitest`.
- Data: HUD FMR API (`/hudapi/public/fmr/data/{FIPS}99999`, Bearer `HUD_TOKEN`), Census ACS5 `B25064_001E` by ZCTA (`CENSUS_KEY`). Static fallback JSON for ~15 DMV counties + Montgomery County VA; every external call degrades to it with a visible "demo data" badge. Mock AI via `MOCK_AI=1`.
- Hosting: Cloud Run `us-east4`, `gcloud run deploy clearlease --source .`, secrets from Secret Manager (`--set-secrets`). `output: "standalone"` + multi-stage Dockerfile. Runbook in `docs/DEPLOY.md` (PowerShell-friendly). Humans run gcloud.
- Env names: `GEMINI_API_KEY`, `HUD_TOKEN`, `CENSUS_KEY`, `GEMMA_MODEL`, `MOCK_AI`, `FRED_API_KEY` (unused). **Never read, print or commit `.env.local`.**

## Engineering rules
1. Model and data calls server-side only (route handlers); keys only from `process.env`.
2. Model **extracts** (strict JSON schema + Zod) and **explains, quoting the input**. It never invents numbers or legal facts. Math, thresholds, scores live in `lib/rules/*.ts` with unit tests.
3. Store nothing personal; no logs of user text; images sent to the API and dropped. Say so in the UI.
4. Prompt injection: user content wrapped as delimited data; pinned system prompt; schema-invalid output → safe error. Ship an injection demo sample.
5. Minimal deps. Commit after every working step. Never `npm audit fix --force`.
6. Something fails twice → stop, offer 2–3 options.
7. Mobile-first: works at 375px (no horizontal scroll, camera-roll upload, stacked cards) up to desktop. Test both viewports before every STOP.
8. Accessibility is part of done: semantic HTML, labels, keyboard flow, visible focus, contrast ≥ 4.5:1, alt text, `aria-live` results, reduced motion.
9. Images resized client-side (max 1600px long edge, JPEG ~0.85); reject > 8 MB with a clear message.
10. In-memory per-IP rate limit on `/api/check` (~10/min) + max input length.
11. Every result: "This is not legal advice" + jurisdiction help links (researcher-verified).
12. Windows dev: Git Bash; cross-platform npm scripts; POSIX paths.
13. Design follows `docs/design-principles.md`.

## Shared memory
`CLAUDE.md` imports this file and `PLAN.md`. After every decision or milestone, update both and commit, so a fresh session on the other laptop can continue with zero context. Parallel work: one person per folder (`app/api` + `lib` vs `app/(ui)` + `components`), separate branches, no force-push.

## Agents and skills
Agents in `.claude/agents/`: researcher, architect, judge, ux-critic, security-reviewer, qa. Skills in `.claude/skills/`: grill, rubric-audit.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
