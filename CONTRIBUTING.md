# Contributing to Clearlease

Thanks for helping. Clearlease is a pre-sign check for renters in DC, Maryland and Virginia: Gemma 4 reads a listing or lease into quoted facts, and TypeScript rules decide the verdicts. Please read this page before opening a pull request. By taking part you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

**Clearlease is not legal advice, and neither is anything in this repository.**

## Setup

Requires Node 20 or newer (we use Node 24).

```bash
npm ci                 # install exactly what package-lock.json pins
cp .env.example .env   # then add your own keys
npm run dev            # http://localhost:3000
```

- Only `GEMINI_API_KEY` is required for live Gemma (free from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). The other keys are optional, and each one falls back to something visible. See "Minimum setup" in the [README](README.md#minimum-setup).
- With no keys the app runs in **demo mode**: the 5 samples use recorded extractions, other text gets a basic keyword reader, and photos can't be read. `MOCK_AI=1` forces demo mode even when a key is set.

## Tests and checks

Run these before you open a pull request:

```bash
npm test         # Vitest unit tests (rules, grounding, redaction, injection, schema, Spanish templates)
npm run lint     # ESLint
npm run build    # production build
```

The scripts below need a running server. Give them its URL (default `http://localhost:3000`). They are best run against a production build (`npm run build && PORT=3100 npm start`).

| Command | What it checks |
|---|---|
| `node scripts/e2e.mjs [baseUrl]` | API check of the 5 English samples. Exits 1 on any mismatch. It also fails if the live model didn't respond and a sample's saved answer was shown instead. Use a live `GEMINI_API_KEY` to test the real model. |
| `node scripts/e2e-es.mjs [baseUrl] [--report]` | Spanish mode end to end, in a browser: every sample plus one pasted listing. Fails if the ES toggle resets or English is visible outside quotes and proper nouns. `--report` lists the strings without failing. |
| `node scripts/a11y.mjs [baseUrl] [--lang=es]` | axe-core audit (WCAG 2.0/2.1/2.2 A and AA rules, plus best practices) on the landing page and finished reports, at 1280 px and 375 px. Also fails on any uncaught page error. `--lang=es` scans the Spanish UI. |
| `node scripts/screenshots.mjs [baseUrl] [outDir]` | Clicks each sample at 375 px and 1280 px, checks for horizontal scroll and saves screenshots. |

The browser scripts use `playwright-core` with your installed Chrome. See [`docs/accessibility.md`](docs/accessibility.md) for the manual keyboard and screen-reader checks.

## Evaluation

`scripts/eval/run.mjs` sends each labelled item to `POST /api/check` on a running server, one at a time, and compares Clearlease with a keyword-only baseline. Method and every past run: [`docs/evaluation.md`](docs/evaluation.md).

```bash
RATE_LIMIT_PER_MIN=1000 npm run dev                    # terminal 1: local runs need a raised rate limit
node scripts/eval/run.mjs <runName> [baseUrl] [--set=easy|hard|student] [--holdout]   # terminal 2
```

- **Sets:** `easy` (default) is `scripts/eval/dataset.jsonl`, `hard` is `scripts/eval/hard.jsonl` (adversarial items, including screenshots), and `student` is `scripts/eval/student.jsonl` (per-bedroom pricing and sublets). `--kind=lease` runs only the lease items.
- **Holdout:** some easy-set items are marked `holdout: true`. Without `--holdout`, they still run, but their results are saved unread to `scripts/eval/results/<runName>-holdout.json` and not printed. Don't open them while you're changing code.
- **Results** are written to `scripts/eval/results/` and a summary is printed. Run it with a live `GEMINI_API_KEY`; demo-mode results don't mean anything.
- **Never set `RATE_LIMIT_PER_MIN=1000` on a deployed service.**

Ground rules:
- **Never edit `scripts/eval/baseline-keywords.json`.** The baseline was frozen after run "before", and any change breaks comparisons between runs.
- **Never tune prompts or rules to individual items.** Fix the general cause, then test it on new items written *after* the fix, as in the lease fix in `docs/evaluation.md`.
- Report results as measured, including where the keyword baseline does as well or better.

## Adding a state (rule sheet)

Today the rules cover Virginia, DC and Maryland. A new state touches the files below. Keep it to one state per pull request.

**Every rule must be checked against the official statute text before you code it.** Give the citation and a link to the official source (the state legislature's or council's code site, not a law-firm blog or summary). If you can't verify a rule, leave it out or make it an "ask" (the report tells the renter to ask about the clause instead of calling it a conflict). Write rule summaries in plain language, in your own words. They are information for renters, not legal advice. Note in the pull request where and when you checked each rule; the existing research notes are in [`docs/research/tenant-law-dc-md-va.md`](docs/research/tenant-law-dc-md-va.md).

1. **`lib/types.ts`**: add the state code to `Jurisdiction` (now `"VA" | "DC" | "MD"`). TypeScript will then show every `Record<Jurisdiction, …>` that needs an entry.
2. **`lib/data/rule-sheets.ts`**: add a `RuleSheet` to `RULE_SHEETS`. The fields:
   - `jurisdiction`, `name` (the name used in sentences like "may conflict with Virginia law")
   - `depositCapMonths`: the security-deposit cap in months of rent
   - `entry`: `{ noticeRequired: true, minHours }`, with `minHours: null` if the statute gives no fixed number of hours
   - `lateFeeCapPercent`, and `lateFeeMinGraceDays` (`null` if there's no statutory grace period)
   - `autoRenewalMaxNoticeDays`: the longest move-out notice a lease may require, or `null`
   - `attorneyFeesProhibited`, `maintenanceWaiverProhibited`, `blanketRepairsProhibited`: set these to `true` only if a statute says such a clause is void or unenforceable. Otherwise use `false`, and the clause stays an "ask". (Maryland's `blanketRepairsProhibited: false` is an example: no statute was found.)
   - `laws`: for each `ClauseType` you've verified, a `LawRef` with `rule` (one plain-language summary), `citation` (exactly as the code cites it) and `url` (the official text). Leave a clause type out rather than guess.
3. **`lib/data/zip-areas.ts`**: map the state's ZIPs. `STATE_BY_PREFIX` gives the state for any 3-digit ZIP prefix. `RANGES` and `PREFIXES` add the place name, county and HUD FMR area, which the price check needs. Price data for a new area also needs saved figures in `lib/data/fmr.ts` and `lib/data/acs.ts` (see `docs/research/hud-fmr.md` and `docs/research/census-acs.md`).
4. **`lib/data/help.ts`**: add help links (legal aid, the tenant advocate or the attorney general) to `BY_JURISDICTION`. Open every URL and make sure it works before you add it.
5. **`lib/client/rules-es.ts`**: every new English sentence needs a hand-written Spanish template ("usted" style, citations kept exactly as written). That includes each `rule`, each help-link label, and the state name if a template uses it. No machine translation. `lib/rules/__tests__/spanish.test.ts` fails if a rule summary or help link has no Spanish template.
6. **UI and questions**: search for other places that list states, for example the state name in `components/Report.tsx` and the coverage sentence in `lib/client/rules-es.ts`.
7. **Tests**: add cases in `lib/rules/__tests__/` (see `lease-gaps.test.ts`) for a clause that conflicts, one that's within the limit, and one that stays an "ask". Then run `npm test`, `npm run lint`, `node scripts/e2e-es.mjs` and `node scripts/a11y.mjs`.

## Ground rules

These come from [`AGENTS.md`](AGENTS.md):

- **The model extracts; code decides.** Gemma returns strict JSON (checked with Zod) with a verbatim quote for every fact. Prices, thresholds, scores and legal judgments live in `lib/rules/` and are unit-tested. The model never computes a number or states a legal fact.
- **Quotes are verified.** A flag counts only if its quote is found in the user's input (or in Gemma's transcript of their photo).
- **Store nothing personal.** No accounts, no logs of user text or model output, and images are dropped after the API call. The community counter stores only keyed hashes, a count and a first-seen date.
- **Model and data calls run on the server only** (route handlers), and keys come only from `process.env`.
- **Prompt-injection defenses stay in place:** user content is wrapped as delimited data, the system prompt is pinned, and schema-invalid output becomes a safe error.
- **Accessibility is part of done:** semantic HTML, labels, keyboard flow, visible focus, contrast of at least 4.5:1, alt text, `aria-live` results and reduced motion. Check at 375 px and at desktop width.
- **Every result says "This is not legal advice"** and links to help for the renter's state.
- **Never commit `.env` files** or any key. Only `.env.example` (the template, with no values) is tracked. `.gitignore`, `.dockerignore` and `.gcloudignore` keep the others out.
- **Keep dependencies to a minimum.** Never run `npm audit fix --force`.

## Pull requests

- Keep each pull request to one change, and say how you tested it.
- For a new rule, include the citation, the official URL and the date you checked it.
- Don't include real people's listings, leases, phone numbers or emails in samples, tests or eval items. Write fictional ones, and label reconstructions of published cases as reconstructions.

## License

Clearlease is licensed under [Apache 2.0](LICENSE). By contributing, you agree that your contributions are licensed under the same license. Third-party licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
