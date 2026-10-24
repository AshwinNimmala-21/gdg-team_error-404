---
name: rubric-audit
description: The fixed scoring format for Clearlease audits — the GDG 100-point rubric table plus the Gemma 4, Open-Source AI and UI/UX track checklists — so every judge round is comparable. Use whenever scoring the project.
---

# Rubric audit

Score only what a judge can see: README, live URL, repo, demo video script, LICENSE. Use these exact rows, in this order, every round. A cell is never blank: write `0` and say why.

## GDG rubric (100)

| # | Item | Pts | Current | Gap (what a judge can't see yet) | Fix | Effort |
|---|------|-----|---------|-----------------------------------|-----|--------|
| 1a | Problem definition | 10 | | | | |
| 1b | Measurable impact | 10 | | | | |
| 1c | Stakeholder empathy | 5 | | | | |
| 2a | AI necessity (multimodal / agentic / embeddings, not a gimmick) | 15 | | | | |
| 2b | Architecture | 10 | | | | |
| 3a | Safety & grounding | 10 | | | | |
| 3b | Privacy | 8 | | | | |
| 3c | Inclusive design / WCAG | 7 | | | | |
| 4a | Deployment viability for nonprofits | 10 | | | | |
| 4b | Inference cost | 8 | | | | |
| 4c | Documentation | 7 | | | | |
| | **Total** | **100** | | | | |

Effort is S (<30 min), M (30–90 min) or L (>90 min).

What full marks look like:
- **1a:** a named user, a named moment of pain, the DMV scope, one sentence.
- **1b:** FTC and cost-burden stats linked in the README, plus a stated metric the tool moves (e.g. scams caught before deposit).
- **1c:** real student quotes from `docs/validation.md`, and changes made because of them.
- **2a:** Gemma reads images and messy text that rules can't. The demo shows it. The model ID is in the README.
- **2b:** a Mermaid diagram, a clear model/rules split, a fallback path.
- **3a:**
  - every flag quotes the input
  - numbers come from HUD/Census, not the model
  - the injection demo is ignored
  - schema validation
  - "not legal advice" + help links
- **3b:** nothing stored, no login, no logs; said in the UI and README.
- **3c:** keyboard walkthrough recorded, contrast checked, `aria-live`, 375px.
- **4a:** one Cloud Run service, one key, setup in under 15 minutes, open license.
- **4b:** cost table (model, tokens/request, $ per 1k checks), MoE reasoning.
- **4c:** README setup guide, API table, Built with (incl. Claude Code).

## Track fit (/5 each, with evidence)

**Gemma 4**
- [ ] Exact model ID in the README and code (`gemma-4-26b-a4b-it` / `gemma-4-31b-it`)
- [ ] Gemma is core: the product doesn't work without it
- [ ] Uses Gemma-specific strengths (image input, structured JSON, MoE cost)
- [ ] Shown in the demo video with an explanation of how
- [ ] The 26B vs 31B decision is documented with evidence

**Open-Source AI**
- [ ] Open model (Gemma) named, with a link to the Gemma license / terms
- [ ] Repo LICENSE (Apache-2.0) present and rendering on GitHub
- [ ] Public repo, clear setup, reproducible
- [ ] Explains why open weights matter (a nonprofit can self-host; privacy)
- [ ] README easy to scan

**UI/UX**
- [ ] Effortless: first verdict within 2 actions of landing (sample buttons)
- [ ] Doesn't look AI-generated (no tells from `docs/design-principles.md`)
- [ ] Accessible: keyboard, focus, contrast, `aria-live`, reduced motion, 375px
- [ ] Verdict moment is distinctive; states not color-only
- [ ] Demo explains why the UI is better (user story)

## Output order
1. Table
2. Total
3. Track fit scores with ticked boxes
4. Top 3 fixes by points per hour
5. Biggest single risk to winning
