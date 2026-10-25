# Spanish (EN/ES)

An EN/ES switch sits at the top of the page, and Spanish mode is Spanish end to end:
- **Gemma** writes each lease clause's plain-language explanation in Spanish.
- **Everything our rules say** is translated through hand-written Spanish templates in [`lib/client/rules-es.ts`](../lib/client/rules-es.ts) ("usted" style, like consumidor.ftc.gov): the price explanation, the "rough comparison" and sublet lines, the legal reason under each clause and the 26 legal summaries (statute citations kept exactly as written), scam-flag explanations, evidence labels, help links, notes, errors and loading states. No machine translation, and the verdict logic is identical in both languages.
- **Quotes stay in the original language**, so they can still be verified against what you shared, and are labelled "Texto original:".
- **The text samples load fictional Spanish listings.** The lease photo stays English: an English lease explained in Spanish is the realistic case.
- The page's `lang` attribute switches to `es`, so screen readers change voice.
- **Checks:** `node scripts/e2e-es.mjs` runs every sample plus a pasted listing in Spanish and fails if the toggle resets or any English is visible outside quotes and proper nouns (6/6 pass). axe shows 0 violations in Spanish. A unit test confirms the Spanish samples give the same verdicts as the English ones.
- The Spanish was written by us with Claude Code and has **not yet been reviewed by a native speaker**.
