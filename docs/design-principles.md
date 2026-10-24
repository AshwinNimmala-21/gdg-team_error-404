# Clearlease design principles

`ux-critic` and all UI work follow this file (from KICKOFF_PROMPT.md §4b).

## Direction
- Ground the look in the subject: leases, listings, inspection reports, a building super's clipboard. It should feel like a trustworthy, plain-spoken tool a tenant advocate would hand you. Not a SaaS landing page.
- Be bold in ONE place: the verdict moment, where the three verdicts land. Keep everything else quiet and disciplined.
- Verdict states never rely on color alone. Each one uses an icon, a word and a color.

## Avoid (generated-look tells)
- Warm cream background + serif + terracotta accent
- Near-black + one acid accent
- Identical rounded cards with the same soft shadow
- Gradient washes
- ALL-CAPS tracked eyebrow labels
- "A · B · C" meta strings
- Arrows appended to buttons
- Fade-up animation on every section
- One accented word in a headline

## Copy
- Plain verbs, sentence case, written for a stressed renter.
- Buttons say exactly what happens ("Check this listing").
- Errors say what happened and what to do next.
- The empty state invites the first action and offers the three sample inputs.

## Quality floor
- Responsive down to 375px with no horizontal scroll. Image upload from the camera roll works.
- Visible keyboard focus, reduced motion respected, contrast ≥ 4.5:1.
- Before every UI STOP, take Playwright screenshots at 375px and 1280px and critique them.

## Token plan
To be written before any UI code (Phase 3, step 3):
- 4–6 named hex colors
- 1–2 typefaces with roles and a type scale
- A layout concept with ASCII wireframes for 375px and desktop

Then review the plan. If any part reads like a default you'd produce for any app, change it and note why here.
