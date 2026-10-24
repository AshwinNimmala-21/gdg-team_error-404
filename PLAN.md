# Clearlease — plan and status

Last updated: Sat Oct 24 2026, Phase 1.

## Status
- [x] Phase 0: safety rails (`.claude/settings.json`, `.gitignore`), validation questions in `docs/validation.md`
- [x] Phase 1: clean slate, Next.js 16.4.3 scaffold (`npm run build` passes), `@google/genai` 2.31, `zod` 4, `vitest` 5, LICENSE, memory files, agents and skills
- [ ] Phase 1: researcher output in `docs/research/` (running in background)
- [ ] Phase 1: grill round 1 → answers recorded below
- [ ] Phase 2: MVP plan (flow, Gemma per step, types, samples, Mermaid, judge's predicted score)
- [ ] Phase 3: MVP sprint → live on Cloud Run by ~4 PM Sat
- [ ] Phase 4: rubric revision rounds until feature freeze Sun 9:30 AM
- [ ] Phase 5: ship (track pick, README, video script, submissions) by Sun 12:30 PM

## Next steps
1. Team answers grill round 1 (below).
2. Phase 2: write the MVP plan sections in this file.

## Decisions log
- 2026-10-24: `@types/node` raised to ^24 so vitest 5 installs (its peer dependency); local Node is 24. Dockerfile will use Node 24.
- 2026-10-24: `docs/validation.md` kept through the clean slate (created in Phase 0 for student answers).

## Open questions
- Missing inputs: `partner-brief.md`, the event slides (.pdf/.pptx) and raw transcripts were not in the repo. We work from `docs/brief/event-notes.md` and the KICKOFF rubric until they're added.
- Grill round 1 answers pending.

## Sections to fill in Phase 2
- User + core flow
- Gemma per step (extraction schema, explanation prompt), 26B vs 31B cost/latency
- MVP scope / not in MVP
- Architecture (Mermaid)
- Types: `CheckRequest`, `CheckResult`
- Demo samples (a) fine Arlington 1BR, (b) FB scam 25% under market + wire pressure, (c) lease image with auto-renew + entry-without-notice, (d) injection attempt
- Cost per request (running estimate)
