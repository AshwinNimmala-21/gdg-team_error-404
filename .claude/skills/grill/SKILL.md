---
name: grill
description: Stress-test interview for Clearlease decisions. Works the design tree in rounds, numbers each question, gives a recommended answer, then waits. Use at every STOP, or when the team says "grill".
---

# Grill

The goal is to surface the decisions that would change what we build, and settle them fast.

## Before asking
1. Read `AGENTS.md` (Decisions) and `PLAN.md` (Decisions log, Open questions).
2. Never re-ask anything already settled there, or in KICKOFF_PROMPT.md §1a.
3. Build the design tree for the current phase: list the open decisions, and under each one the choices that depend on it. Ask the parents first. Skip anything with an obvious default and note it under "Assumed".

## Round format
- At most 6–8 questions per round, numbered `R<round>.<n>`.
- Each question gets one line of why it matters (rubric line, demo, risk or effort), 2–3 options, and **Recommended:** with a one-line reason.
- Be concrete: exact copy strings, exact layouts (ASCII when it helps), exact file paths.
- Close with:
  - "Assumed (shout if wrong):" followed by 3–5 defaults you'll take
  - "Reply `yes to all`, or e.g. `R1.3: b`."
- Then STOP and wait. Don't start building during a grill round.

## After answers
1. Write every answer into the `PLAN.md` decisions log (date, ID, decision, one-line why) and into `AGENTS.md` Decisions if it's durable.
2. Commit with `docs: grill round N decisions`.
3. Only run another round if an answer opened a new branch of the tree. Otherwise continue with the phase.

## Pressure tests to use
- "What does the judge see in the first 10 seconds?"
- "What breaks if the API key is missing or Gemma is slow?"
- "Can you state this in one sentence in the 2-minute video?"
- "Does this earn rubric points, or is it only nice?"
- "Is it still true on a 375px phone, by keyboard only?"
