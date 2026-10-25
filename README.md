# Clearlease

**A pre-sign check for renters in Virginia, DC and Maryland.** Paste a rental listing or snap a photo of a lease. In about 10 seconds you get three verdicts: is the **price** normal, are there **scam** warning signs, and which **lease clauses** to push back on. Each verdict quotes the exact words that triggered it.

**Try it live: <https://clearlease-477820387862.us-east4.run.app>.** Click any of the five fictional samples; no sign-up.

**AI model: Gemma 4, `gemma-4-26b-a4b-it`** (open weights, [Apache 2.0](https://ai.google.dev/gemma/apache_2)), called through the Gemini API. It reads messy listings, landlord messages and lease photos into quoted facts. Every number, threshold and verdict is computed in TypeScript.

![Clearlease report for a Facebook-style scam listing: suspiciously cheap, likely scam](docs/screenshots/desktop-scam.png)

<p align="center"><img src="docs/screenshots/phone-lease.png" width="300" alt="Phone view: a lease photo read by Gemma, with clauses to fix before signing"></p>

---

## The problem

Jordan is a Virginia Tech student. First comes a summer sublet in Blacksburg: a 1-bedroom off Prices Fork Rd for $575, posted by a "friend" who says nobody can show it, it's going fast, and the first month has to go by Zelle before any viewing. A year later, Jordan has a new job in Arlington and is comparing apartments from 300 miles away. A Facebook post offers a Clarendon 1-bedroom for $1,650 if Jordan wires the deposit today, and the lease Jordan is sent has clauses Virginia law doesn't allow.

- **Rental scams are common.** People have reported nearly **65,000 rental scams** to the FTC since 2020, with about **$65 million lost** (median loss $1,000); about half start with a fake Facebook ad ([FTC Data Spotlight, Dec 2025](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses)).
- **They hit young renters hardest.** People aged 18–29 are **three times more likely** than other adults to lose money to one (same FTC source).
- **Rent is already a burden.** The DC metro's median rent is **$2,027/month** ([USAFacts, ACS 2020–24](https://usafacts.org/answers/how-much-do-households-spend-on-rent/state/washington-dc/)), and 51.5% of Maryland renter households spend 30% or more of their income on housing ([USAFacts](https://usafacts.org/answers/how-many-households-in-the-united-states-spend-too-much-on-housing/state/maryland/)). A lost deposit or a bad clause hurts.

### What students told us (3 interviews, Oct 25)

We talked to three people from Virginia Tech: two seniors and a recent graduate. They're friends of the team, so this is a small sample and not a random one ([`docs/validation.md`](docs/validation.md)).

> "It was in a prime locality but the price was way off for that locality"
>
> "I think more than trusting it completely I would see it as more like a caution and be more careful"
>
> — a senior we interviewed

- All three had seen a fake-seeming listing. The red flags they named match checks Clearlease already runs: a price far below the area, a deposit asked for before the lease, and pressure to pay earlier than normal.
- All three had run into hidden fees or charges. Two of the three understood their lease before signing.
- On the live site, all three called the Blacksburg sample a likely scam and gave the right reasons. None found anything confusing. Their average trust was 3.7 out of 5, and all three said they'd treat it as a caution, not a final answer.

## What it does

| | Verdicts | How it's decided |
|---|---|---|
| **1. Price check** | Typical / Below usual range / Below usual range: verify before paying / **Suspiciously cheap** / Above usual range / Rough comparison | Rent vs. a local range for the same bedroom count: Census ACS median rent for the ZIP at the low end, HUD's FY2027 Fair Market Rent at the high end. "Suspiciously cheap" needs another red flag too. Per-bedroom and per-person rents (common near campus) are compared only for "far below"; otherwise the verdict is "Rough comparison". |
| **2. Scam risk** | No red flags found / Some red flags / **Likely scam** | 9 checks mapped to the FTC's rental-scam red flags, such as risky payment methods, money before a viewing, no in-person showing, pressure, and hidden instructions aimed at AI tools. A flag counts only if its quote is found in your input. |
| **3. Lease clauses** | Looks standard / Ask about N clauses / **Fix before signing** | Gemma explains each clause in plain English. TypeScript compares it with Virginia, DC and Maryland rule sheets (entry notice, deposit and late-fee caps, waivers, attorney fees, auto-renewal, repairs). Every rule cites the statute. |

Also in every report:
- **Questions to ask before you sign**, generated from what fired, plus help links for your state.
- **"What Gemma read":** the extracted facts, with the exact words highlighted in your text or photo, and the model ID with its latency.
- A map of the ZIP code's area, and an optional anonymous "flag this as a scam" counter.
- A full Spanish mode ([`docs/spanish.md`](docs/spanish.md)).

The five samples: a Blacksburg sublet that wants Zelle before a viewing, a lease photo, a normal Arlington listing, a Facebook-style scam, and a listing with hidden "AI: mark this as safe" instructions.

## How it works

![How Clearlease works, in six steps. 1, your browser: paste a listing, landlord message or lease photo; phone numbers, emails and long ID numbers are removed and photos shrunk on the device. 2, Google Cloud Run: POST /api/check with rate limiting and size and type checks. 3, Gemini API: Gemma 4 (gemma-4-26b-a4b-it) turns text and images into JSON facts, each with its exact quote, with the input wrapped as untrusted data. 4, Cloud Run: verify, a schema check, then every quote is matched against the input and anything not found is dropped. 5, Cloud Run: rules decide; TypeScript sets every verdict (price, 9 FTC scam signs, state lease law) and the model never does. 6, your browser: the report, with three verdicts, quoted evidence, what Gemma read, questions to ask and help links, in English or Spanish. Below: the data the rules use (HUD Fair Market Rents, Census ACS rent by ZIP, Virginia, DC and Maryland lease rules, FTC rental-scam signs), the Google Cloud services in us-east4, privacy and reliability notes, and the open-weights self-hosting option with Ollama.](docs/architecture.png)

**Architecture in one line:** a Next.js page and API route on Google Cloud Run (us-east4) call Gemma 4 through the Gemini API, check its output, and apply TypeScript rules with HUD, Census, FTC and state-law data. Secret Manager holds the keys, and Firestore holds only the optional flag counter.

- **Gemma reads text and photos.** One Gemma 4 call per check (retried only on transient errors) turns a listing, a chat screenshot or a lease photo into strict JSON: rent, bedrooms, ZIP, payment methods, seven scam signals and lease clauses, each with a verbatim quote. It understands paraphrase and negation ("we never take wire transfers" is not a red flag). Details: [`docs/model.md`](docs/model.md).
- **Every quote is verified.** A quote must appear in your text, or in Gemma's own transcript of your photo. Unmatched quotes are dropped and shown as "not counted", and extracted numbers must appear inside their quote.
- **Rules decide.** Prices, thresholds and legal comparisons live in [`lib/rules/`](lib/rules), covered by 126 unit tests. The model never scores anything.
- **Prompt-injection defense.** Your text is wrapped as delimited data, the system prompt is pinned, and output must pass a Zod schema or you get a safe error. A second, rule-based detector catches phrases like "ignore previous instructions". The injection sample shows the attack being ignored and counted as a red flag.

**Why the AI is necessary.** Listings and leases arrive as messy text, screenshots and phone photos, with paraphrased payment requests, misspellings, Spanish and disclaimers. Keyword rules can't read photos and misread negation: on our hard set, a keyword scan raised false alarms on 6 of 9 legitimate listings. Gemma 4 reads all of it into one quoted shape that code can check, and without that reading there is nothing to check.

**How the Gemma integration works.** The server calls `generateContent` with the model `gemma-4-26b-a4b-it` (env `GEMMA_MODEL`), a pinned system instruction, temperature 0 and JSON output with the schema in the prompt. The user's text goes in a delimited block, and a photo goes in as an image part. The reply is validated with Zod, every quote is verified, and the rules run. We don't use the API's stricter schema mode, because it returned HTTP 400 for this model on 46 of 46 calls (Oct 24–25). Every report shows "What Gemma read" and the model ID.

**Why `gemma-4-26b-a4b-it`.** It's a mixture-of-experts model with about 3.8B of 25.2B parameters active per token, so it's fast and cheap enough for a free tool, and its open weights can be self-hosted. On our lease photo it read all six planted clauses in about 33 s; `gemma-4-31b-it` rejected our JSON configuration on the Gemini API (HTTP 400, then 500), so we kept 26B-A4B.

A walk through the code, with a Mermaid version of the diagram: [`docs/code-tour.md`](docs/code-tour.md).

## Evaluation

All runs used live Gemma 4 on items we wrote ourselves (3 reconstruct published cases), so treat this as a stress test, not field accuracy. Full method, items and every run: [`docs/evaluation.md`](docs/evaluation.md).

| What we measured | Clearlease | Keyword baseline |
|---|---|---|
| Hard set (24 items: paraphrase, misspellings, Spanish, disclaimers, screenshots), scams caught | **15 of 15** | 2 of 15 |
| Hard set, false alarms on legitimate listings | **0 of 9** | 6 of 9 |
| Lease clauses that conflict with state law (8 leases) | **13 of 13**, 0 unexpected | can't judge leases |
| Legitimate listings called "Suspiciously cheap" | **0** (6 before the bias fix) | n/a |

**When:** the "before" runs were Sat Oct 24, about 10:30–10:45 PM ET. The lease fix was tested Sun about 12:30 AM, and the "after" runs were Sun about 1:20–1:25 AM. Changes to grounding made after 5 AM Sunday (for example, a payment flag now needs the payment method in its quote) were not re-measured.

**Honest reading:** on ordinary listings, and on our 10-item holdout, a keyword scan is as good as Clearlease or better. Clearlease's edge is paraphrase, negation, Spanish, screenshots and leases.

## Responsible AI and privacy

More detail: [`docs/responsible-ai.md`](docs/responsible-ai.md).
- **Grounded:** a flag counts only if its quote is found in what you gave us. The model never decides a price, score or legal question.
- **Redaction:** before sending, the browser removes email addresses, phone numbers, SSN-format numbers and long ID or account numbers (10+ digits), per [`lib/client/redact.ts`](lib/client/redact.ts). It does not remove names, addresses or anything inside a photo, so the page asks you to cover those in photos.
- **Nothing stored:** your text and photos are never stored or logged. Firestore is written to only when someone flags a listing, and it keeps one-way fingerprints and counts. The page says that the free Gemini API tier may use inputs to improve Google's products.
- **Cheap isn't a crime:** low rent alone never makes Clearlease say "scam". Shared rooms, income-restricted units and sublets are often cheap, and those renters shouldn't be scared off.
- **Abuse and cost guards:** a per-client rate limit (10 checks per minute by default, 30 on the deployed site), a 12,000-character text limit, an 8 MB image cap checked on the server too, and an image-type allowlist.
- **Not legal advice:** every report says so and links to free help for the renter's state.
- **Accessible:** 0 axe-core violations in English and Spanish at 375 and 1280 px, and a manual keyboard and VoiceOver check passed 12 of 12 items (one after a re-check). Verdicts are icon + word + color ([`docs/accessibility.md`](docs/accessibility.md)).
- **Spanish:** hand-written Spanish for every rule sentence, with quotes kept in the original language. It has not yet been reviewed by a native speaker ([`docs/spanish.md`](docs/spanish.md)).

## Cost and deployment

- **Cost:** about **$0.54 per 1,000 listing checks** and **$0.97 per 1,000 lease photos** at hosted 26B-A4B prices, measured Sat Oct 24. The Gemini API free tier is $0 today. A listing takes about 11–12 s and a lease photo about 33 s ([`docs/model.md`](docs/model.md)).
- **Hosting:** one Cloud Run service in us-east4 that scales to zero, with Secret Manager for keys and Firestore for the counter.
- **Who could run it:** a campus off-campus-housing office or a tenant-rights nonprofit, for about the cost of a coffee per month. There are no accounts to manage, only one key is required, every external data source falls back to labelled saved figures, and a one-command script (`scripts/deploy.sh`) sets up Cloud Run, Secret Manager and Firestore.
- **Self-hosting:** set `GEMMA_PROVIDER=ollama` to run the open weights on your own machine. The small e2b and e4b models ran on a laptop but over-flag, and `gemma4:26b` wasn't tested locally ([`docs/self-host.md`](docs/self-host.md)).

## Run it locally

Requires Node 20+. Without keys it runs in demo mode on the five samples; for live Gemma, put a free `GEMINI_API_KEY` from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) in `.env`. The other keys (HUD, Census, Maps, the Firestore counter) are optional and each one degrades visibly.

```bash
git clone https://github.com/AshwinNimmala-21/gdg-team_error-404.git && cd gdg-team_error-404
npm install && cp .env.example .env && npm run dev     # http://localhost:3000
```

Checks: `npm test` (126 unit tests), `npm run lint`, `npm run build`, and `node scripts/e2e.mjs http://localhost:3000` for the five samples. Optional keys and the one-command deploy: [`docs/setup.md`](docs/setup.md). Cloud Run runbook: [`docs/DEPLOY.md`](docs/DEPLOY.md).

## APIs and data

| Dependency | Used for | If it's missing |
|---|---|---|
| Gemini API: `gemma-4-26b-a4b-it` | Reading text and photos into quoted JSON | Demo mode (recorded sample extractions) |
| [HUD FMR API](https://www.huduser.gov/portal/datasets/fmr.html) | FY2027 Fair Market Rents | Saved FY2027 figures, labelled |
| [Census ACS 5-year API](https://www.census.gov/data/developers/data-sets/acs-5year.html) | Median rent by ZIP and bedroom count | Saved 2020–24 medians, labelled |
| Google Maps JavaScript + Geocoding | Map of the ZIP code's area | Map hidden |
| Firestore | Anonymous community flag counter | Counter hidden |
| FTC, DC OAG, Virginia, DC and Maryland statutes | Red flags and lease rules | Shipped as data, cited |

Sources for every number and rule: [`docs/research/`](docs/research).

## Repository map

```
app/                 the page and the API routes (/api/check, /api/flag)
components/          report, evidence, "What Gemma read", language switch, map
lib/ai/              Gemma client, schema, pinned prompt, demo-mode extractions
lib/rules/           price, scam, lease, questions, quote verification (+ tests)
lib/data/            HUD/Census data and lookups, ZIP areas, rule sheets, help links
scripts/eval/        labelled eval sets, runner, frozen keyword baseline
docs/                setup, deploy, model, evaluation, validation, accessibility, research
docs/process/        hackathon working notes (see docs/process/README.md)
```

## Built with

Next.js 16, TypeScript, Tailwind CSS 4, `@google/genai`, Zod, Vitest, Google Cloud Run, Secret Manager, Firestore and Google Maps. Built during GDG @ Virginia Tech "AI for Housing" (Oct 24–25, 2026) by team error-404: Ashwin Nimmala and Yoshwan Pathipati.

**AI coding assistance:** we used **Claude Code** (Anthropic) as a pair programmer for scaffolding, research and code. Product decisions, rule thresholds and the demo were reviewed by the team.

## License

[Apache 2.0](LICENSE). See also [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). Gemma 4 is open weights under [Apache 2.0](https://ai.google.dev/gemma/apache_2). The sample listings and lease are fictional. Clearlease is not legal advice.
