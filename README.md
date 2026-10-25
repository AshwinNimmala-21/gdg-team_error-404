# Clearlease

**A pre-sign check for renters in DC, Maryland and Virginia.** Paste a rental listing or snap a photo of a lease. In about 10 seconds you get three verdicts you can act on: is the **price** normal, are there **scam** warning signs, and which **lease clauses** to push back on. Each verdict quotes the exact words that triggered it.

**Try it live: <https://clearlease-477820387862.us-east4.run.app>.** Click any of the five fictional samples; no sign-up. It runs on Google Cloud Run in us-east4.

**AI model: Gemma 4, `gemma-4-26b-a4b-it`** (open weights, [Apache 2.0](https://ai.google.dev/gemma/apache_2)), called through the Gemini API. It reads messy listings, landlord messages and lease *photos* into structured, quoted facts. Every number, threshold and verdict is computed in TypeScript.

**Gemma 4 at a glance**
- **Core, not decoration:** every check is one Gemma 4 call that turns text or a photo into a strict JSON extraction, each fact with a verbatim quote. Without Gemma there's nothing to check.
- **Multimodal:** lease photos and chat screenshots are read directly (image input), with a transcript we use to verify every quote.
- **Visible in the product:** each report has a "What Gemma read" section showing the extracted facts and highlighting the exact words in your text or photo. The header shows the model ID and latency.
- **Measured:** on a hard eval set we wrote as a stress test (paraphrased payment requests, misspellings, Spanish, anti-scam disclaimers, screenshots), Clearlease caught 15 of 15 scams with 0 false alarms, while a keyword scanner caught 2 and raised 6 false alarms. On ordinary listings a keyword scan does about as well, and we say so ([`docs/evaluation.md`](docs/evaluation.md)).
- **Open weights:** the same model can run on a nonprofit's own hardware (see "Self-host Gemma", untested).

![Clearlease report for a Facebook-style scam listing: suspiciously cheap, likely scam](docs/screenshots/desktop-scam.png)

<p align="center"><img src="docs/screenshots/phone-lease.png" width="300" alt="Phone view: a lease photo read by Gemma, with clauses to fix before signing"></p>

*Built in 24 hours at GDG @ Virginia Tech "AI for Housing" (Oct 24–25, 2026) by team error-404: Ashwin Nimmala and Yoshwan Pathipati.*

---

## The problem

**First, a VT student renting in Blacksburg.** Jordan needs a summer sublet near campus. A post in a student housing group offers a 1-bedroom off Prices Fork Rd for $575, but the "friend" posting it says nobody can show it, it's going fast, and the first month has to go by Zelle before any viewing.

**Second, the same student a year later, moving for a job.** Maya, a VT senior with a new job in Arlington, is comparing apartments from Blacksburg, 300 miles away. A Facebook post offers a Clarendon 1-bedroom for $1,650 if she wires the deposit today, and the lease she's sent has clauses Virginia law doesn't allow.

- **Rental scams target exactly her.** Since 2020, people have reported nearly **65,000 rental scams** to the FTC, with about **$65 million lost** (median loss **$1,000**), and that's only what gets reported. **Ages 18–29 are three times more likely** than other adults to lose money to one. About **half start with a fake Facebook ad**. ([FTC Data Spotlight, Dec 2025](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses))
- **Rent already burdens DMV renters.** The DC metro's median rent is $2,027/month ([USAFacts, ACS 2020–24](https://usafacts.org/answers/how-much-do-households-spend-on-rent/state/washington-dc/)). **51.5% of Maryland renter households** spend 30% or more of their income on housing ([USAFacts](https://usafacts.org/answers/how-many-households-in-the-united-states-spend-too-much-on-housing/state/maryland/)). A bad lease clause or a lost deposit hurts.
- **Leases are written for landlords.** First-time renters sign clauses like "Landlord may enter at any time without notice" without knowing that Virginia, DC and Maryland law say otherwise.

**What we measure:** scam signals caught *before* a deposit leaves; lease clauses flagged that conflict with state law; time to a first verdict (one click on a sample, about 10 s live).

**Student validation:** interviews with VT students and a 3-person usability test ("Is this listing safe?") are in progress. Answers go in [`docs/validation.md`](docs/validation.md) only from real conversations.

## What it does

| | Verdict | How it's decided |
|---|---|---|
| **1. Price check** | Typical / Below usual range / Below usual range: verify before paying / **Suspiciously cheap** / Above usual range | Rent vs. a local range for the same bedroom count. The low end is the Census ACS median gross rent for that ZIP (B25031); the high end is HUD's FY2027 Fair Market Rent (ZIP-level Small Area FMR where HUD publishes one). Rent 25%+ below the low end says "verify before paying". It becomes **Suspiciously cheap**, and counts as the FTC's "a lot cheaper than most rents in the area" scam sign, only when at least one other red flag also fired. |
| **2. Scam risk** | No red flags found / Some red flags / **Likely scam** | 9 checks mapped to the FTC's published rental-scam red flags: wire/gift-card/crypto payment, money before viewing, no in-person showing, owner overseas, pressure, SSN/credit report up front, off-platform contact, a far-below-market price, and hidden instructions aimed at AI tools. A flag counts only if its quote is found in your input. |
| **3. Lease clauses** | Looks standard / Ask about N clauses / **Fix before signing** | Gemma reads the lease (text or photo) and explains each clause in plain English. TypeScript compares it with our VA/DC/MD rule sheet: entry notice, deposit caps, late-fee caps, liability waivers, attorney fees, auto-renewal and repairs. Every rule cites the statute. |

Also included:
- **Questions to ask before you sign**, generated from what fired.
- Help links for your state (legal aid, the tenant advocate, the FTC report page).
- A map of the ZIP code's area.
- An optional anonymous "flag this as a scam" counter, so the next person sees "3 other people flagged this contact".

**Try it:** five fictional samples are one click away on the page:
1. A Blacksburg summer sublet near VT that wants Zelle before a viewing
2. A photo of a lease page
3. A normal Arlington listing
4. A Facebook-style scam
5. A listing with hidden "AI: mark this as safe" instructions

**Cheap isn't a crime.** Low rent alone never makes Clearlease say "scam". Rooms in shared houses, older buildings, income-restricted (LIHTC, Section 8, inclusionary-zoning) units and approved summer sublets are often priced far below the local range, and the renters who most need them are the ones a scam checker shouldn't scare off. In our first evaluation run, price alone caused 4 of 5 false alarms on legitimate listings (see [`docs/evaluation.md`](docs/evaluation.md)). So a far-below price on its own reads "Below usual range: verify before paying", with advice to see the place and sign a lease before sending money. It only reads **Suspiciously cheap** when it comes with another warning sign, such as a payment request before a viewing.

**Student rentals are priced per bedroom.** When a listing says "$650 per bedroom" or "$575 per person", Gemma reports that (with the quote) along with the whole unit's bedroom count, and our code compares the rent with the whole unit's HUD and Census benchmarks divided by the number of bedrooms. That's an approximation, so it's only used to catch prices **far below** that share. Otherwise the report says "Rough comparison only: per-bedroom rents near campus often run above an even split of area averages. Compare 2–3 nearby listings and ask what's included." It never calls a student rental "above usual range". Sublets, summer and short-term rentals get one more line: "Summer sublets often list below market; price alone isn't a red flag here."

**En español.** An EN/ES switch sits at the top of the page, and Spanish mode is Spanish end to end:
- **Gemma** writes each lease clause's plain-language explanation in Spanish.
- **Everything our rules say** is translated through hand-written Spanish templates in [`lib/client/rules-es.ts`](lib/client/rules-es.ts) ("usted" style, like consumidor.ftc.gov): the price explanation, the "rough comparison" and sublet lines, the legal reason under each clause and the 26 legal summaries (statute citations kept exactly as written), scam-flag explanations, evidence labels, help links, notes, errors and loading states. No machine translation, and the verdict logic is identical in both languages.
- **Quotes stay in the original language**, so they can still be verified against what you shared, and are labelled "Texto original:".
- **The text samples load fictional Spanish listings.** The lease photo stays English: an English lease explained in Spanish is the realistic case.
- The page's `lang` attribute switches to `es`, so screen readers change voice.
- **Checks:** `node scripts/e2e-es.mjs` runs every sample plus a pasted listing in Spanish and fails if the toggle resets or any English is visible outside quotes and proper nouns (6/6 pass). axe shows 0 violations in Spanish. A unit test confirms the Spanish samples give the same verdicts as the English ones.
- The Spanish was written by us with Claude Code and has **not yet been reviewed by a native speaker**.

## Evaluation

We built a labelled evaluation before changing anything, froze a keyword-only baseline, and kept 10 items as a holdout we didn't open until the end. Full method, items, sources and caveats: [`docs/evaluation.md`](docs/evaluation.md). All runs use live Gemma 4.

| Set | System | Before: precision / recall / false alarms | After |
|---|---|---|---|
| Easy (32 listings) | Clearlease, any red flag | 77% / 100% / 5 of 15 | **89% / 100% / 2 of 15** |
| Easy | Keyword baseline | 94% / 100% / 1 of 15 | 94% / 100% / 1 of 15 |
| Holdout (10, opened last) | Clearlease, any red flag | 71% / 100% / 2 of 5 | 83% / 100% / 1 of 5 |
| Holdout | Keyword baseline | 100% / 100% / 0 of 5 | 100% / 100% / 0 of 5 |
| Hard (24, incl. 6 screenshots) | Clearlease, any red flag | 94% / 100% / 1 of 9 | **100% / 100% / 0 of 9** |
| Hard | Keyword baseline | 25% / 13% / 6 of 9 | 25% / 13% / 6 of 9 |
| Leases | Clause conflicts found | 7 of 9 | **13 of 13** (3 new leases), 0 false |
| All | Legitimate listings called "Suspiciously cheap" | 6 | **0** |

**Honest reading:**
- On ordinary listings, and on our holdout, a keyword scan is as good as Clearlease or better.
- Clearlease's edge is paraphrase, negation ("we never accept Zelle"), Spanish, screenshots and leases.
- "Likely scam" never fired on a legitimate listing in any set.
- All items were written by us (3 are reconstructions of published cases), so treat these as a stress test, not field accuracy.

## How the AI is used (and bounded)

```mermaid
flowchart LR
  U["Renter on phone or laptop"] -->|"text, photo, ZIP"| UI["Next.js page"]
  UI -->|"redact phones/emails, shrink photo on device"| UI
  UI -->|"POST /api/check"| API["Cloud Run: /api/check"]
  API --> G1["Rate limit, size + type checks"]
  G1 --> AI["Gemma 4 26B A4B (Gemini API): read text + image into quoted JSON"]
  AI --> V["Zod schema + quote verification"]
  V --> R["TypeScript rules: price, scam, lease, questions"]
  D["HUD FMR + Census ACS (live, else saved FY2027 data)"] --> R
  J["VA / DC / MD rule sheets with citations"] --> R
  F["FTC red flags"] --> R
  R --> RES["3 verdicts + quoted evidence + questions + help links"]
  RES --> UI
  API <-->|"keyed hashes + counts only"| FS[("Firestore: community flag counter")]
  SM["Secret Manager"] -.->|"API keys at runtime"| API
```

**Why the AI is necessary.** Listings and leases are messy, and they arrive as screenshots and phone photos. Gemma 4 reads both (it is multimodal) and turns them into one strict JSON shape: rent, bedrooms, ZIP, payment methods, seven scam signals and lease clauses. Every field carries a **verbatim quote** from the input. It also understands negation and paraphrase ("we never take wire transfers" is *not* a red flag), which keyword rules can't: on our hard eval set a keyword scanner raised false alarms on 6 of 9 legitimate listings with disclaimers like that. We use one Gemma call per check.

**How it's bounded:**
- **The model extracts; code decides.** No prices, scores or legal judgments come from the model. Thresholds live in [`lib/rules/`](lib/rules), covered by 81 unit tests.
- **Grounding check.** Each quote must appear in your text, or in Gemma's own transcript of your photo. Unmatched quotes are dropped and shown as "not counted". Extracted numbers must appear inside their quote.
- **Prompt-injection defense.** Your text is wrapped as delimited data, and the delimiters are escaped. The system prompt is pinned. Output must validate against the schema, or you get a safe error rather than a guess. A second, rule-based detector catches phrases like "ignore previous instructions" even if the model misses them. Sample 5 shows the attack being ignored *and* counted as a red flag.
- **Not legal advice.** Every report says so and links to free help for the renter's state.

**Why `gemma-4-26b-a4b-it`.** It's a mixture-of-experts model with about 3.8B parameters active per token (of 25.2B total). That makes it fast and cheap enough for a free tool, and a nonprofit can self-host the open weights.
- **Benchmark:** on our lease photo, 26B-A4B read all six planted clauses correctly in about 33 s.
- **Why not 31B:** `gemma-4-31b-it` rejected our strict JSON-schema config on the Gemini API (HTTP 400, then 500 in JSON mode), so we kept 26B-A4B.
- **Switching:** the model is one env var, `GEMMA_MODEL`.

## Cost (measured)

| Check | Model | Prompt tokens | Output tokens | Latency | Gemini API cost | Reference cost at hosted 26B-A4B prices* |
|---|---|---|---|---|---|---|
| Listing text | `gemma-4-26b-a4b-it` | ~2,500–2,650 | ~420–530 | ~11–12 s | $0 (free tier) | ≈ **$0.54 per 1,000 checks** |
| Lease photo | `gemma-4-26b-a4b-it` | ~2,730 | ~1,535 | ~33 s | $0 (free tier) | ≈ **$0.97 per 1,000 checks** |

\*At $0.13 per 1M input tokens and $0.40 per 1M output tokens ([Vercel AI Gateway listing](https://vercel.com/ai-gateway/models/gemma-4-26b-a4b-it), a secondary source). Measured on Oct 24, 2026 from `usageMetadata`.

Hosting is one Cloud Run service that scales to zero, plus Firestore and Secret Manager free tiers. **A campus off-campus-housing office or a tenant-rights nonprofit could run this for about the cost of a coffee per month.**

## Responsible AI and privacy

- **Nothing about you is stored.** No accounts, no database of checks, no logs of your text. The server never logs request bodies or model output.
- **Your device redacts before sending.** Phone numbers, emails and long ID/account numbers are removed in the browser. Photos are resized and re-encoded on the device, which strips location (EXIF/GPS) data.
- **Honest about the model host.** Gemma 4 on the Gemini API is free tier only, and Google may use free-tier inputs to improve its products. The page says this plainly next to the button. For stricter privacy, a nonprofit can run the same open weights on its own hardware.
- **Community counter, minimal by design.** Contacts are SHA-256 hashed *in the browser*, then keyed with a server secret (HMAC). Firestore stores only `{count, firstSeen}` under those keyed hashes: no text, images or IPs. Flags need a short-lived signed token from a real check.
- **Abuse and cost guards.** A per-client rate limit (10 checks per minute by default; the deployed site uses 30 because judges share venue Wi-Fi), 12,000-character text limit, 8 MB image cap (enforced on the server too), MIME allowlist, and a streamed body size cap.
- **Sources are cited and caveated.** Our own rules of thumb (the 25% price cut-off, off-platform contact) are labeled "Clearlease rule of thumb" in the UI.

## Accessibility and design

- Built mobile-first for a renter standing outside the building. Tested at 320, 375 and 1280 px with no horizontal scroll, and photo upload works from the camera roll.
- **Automated audit: 0 axe-core violations** (WCAG 2.0/2.1/2.2 A and AA rules) on the landing page and three finished reports, at 1280 px and 375 px, with every evidence drawer open, in English and in Spanish. Details and how to rerun: [`docs/accessibility.md`](docs/accessibility.md).
- **Manual check: 12 of 12 pass.** A keyboard-only walkthrough (skip link, tab order, focus to the report, drawers, edit and Escape, lease photo) and a VoiceOver walkthrough (report-ready announcement, headings, warning-sign wording, quote markers, map as one item, form errors), done by a teammate on macOS.
- Verdicts are never color-only: icon + word + color. **Text contrast is 5.71:1 or higher on every pair (measured)**: body text 16.45:1, secondary text 7.48:1, links 7.63:1, highlighted quotes 13.29:1, and the lowest is green text on its tint. Form-field borders are 6.60–7.48:1. Color values are in [`docs/design-principles.md`](docs/design-principles.md).
- Keyboard: visible focus ring, logical tab order, native `<details>` for evidence, Escape closes the editor, and focus moves to the report when it's ready.
- Screen readers: `aria-live` announcements, field-level errors (`aria-invalid`), a skip link, and a summary of all three verdicts.
- `prefers-reduced-motion` turns off the only animation (the stamp landing).
- The look is a housing inspection report: Public Sans (the US government's typeface) for interface text, IBM Plex Mono for anything quoted from your input, and one bold moment, the ink stamp.

## Run it locally

Requires Node 20+ (we use 24).

```bash
git clone https://github.com/AshwinNimmala-21/gdg-team_error-404.git && cd gdg-team_error-404
npm install
cp .env.example .env                  # optional: add keys; without them it runs in demo mode
npm run dev                           # http://localhost:3000
```

### Minimum setup
Only **one key is required**: `GEMINI_API_KEY` (free from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Everything else is optional and degrades visibly:

| Key | Required? | Without it |
|---|---|---|
| `GEMINI_API_KEY` | **Yes**, for live Gemma | Demo mode: the 5 samples use recorded extractions in Gemma's exact format; other text gets a basic keyword reader; photos can't be read. Force it with `MOCK_AI=1`. |
| `HUD_TOKEN` | No | Saved HUD FY2027 Fair Market Rents, labelled "saved figure" in the evidence |
| `CENSUS_KEY` | No | Saved Census ACS 2020–24 medians, labelled the same way |
| `COMMUNITY_SALT` (+ Firestore) | No | The anonymous "flag this listing" counter is simply off |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | No area map. The key is a browser key restricted by referrer: ours only allows `http://localhost:3000` and our Cloud Run URL. On any other port or domain the report shows "The map couldn't load for this ZIP code" and everything else still works. Self-hosters need their own key with their own referrers. |

Checked on Oct 25: a production build with only `GEMINI_API_KEY` set (the other four blanked) passed all 5 samples live (`node scripts/e2e.mjs`), showed saved figures, no counter and no map.

```bash
npm test            # 75 unit tests (rules, grounding, redaction, injection, schema, pricing, leases, map)
npm run lint
npm run build && npm start              # production server (standalone, like Cloud Run)
node scripts/e2e.mjs http://localhost:3000            # API check of the 5 samples
node scripts/screenshots.mjs http://localhost:3000    # clicks every sample at 375 and 1280 px (uses your installed Chrome)
```

### Deploy your own (Google Cloud Run)
Our live instance is <https://clearlease-477820387862.us-east4.run.app>. On macOS or Linux, one script does it:

```bash
gcloud auth login                                   # once
PROJECT=your-project-id ./scripts/deploy.sh --dry-run   # see every command first; makes no gcloud calls
PROJECT=your-project-id ./scripts/deploy.sh             # asks for GEMINI_API_KEY (hidden input); optional keys can be skipped
```

- **Secrets** are read from your environment or typed with hidden input, stored in Secret Manager, and passed to `gcloud` on stdin, never as command-line arguments. The script never reads `.env` files, and `.gcloudignore` keeps them out of the build.
- **Safe to re-run:** APIs, IAM roles and Firestore are only created if missing. A secret gets a new version only if you type a different value. An existing community salt is kept.
- **Optional pieces** (HUD, Census, Maps, the Firestore counter) are skipped when you don't provide them.
- Settings: `us-east4`, 512 MiB, 1 CPU, `--timeout 120`, at most 3 instances (scales to zero), `RATE_LIMIT_PER_MIN=30`.
- The script's dry run is tested. The real run follows the same commands as [`docs/DEPLOY.md`](docs/DEPLOY.md), the PowerShell runbook we used for the live deploy.

### Self-host Gemma (Ollama): untested, not wired in
**We have not built or tested this.** Clearlease calls Gemma 4 through the Gemini API only. It's here because the model's open weights are what make self-hosting possible for a nonprofit that can't send tenant documents to a cloud API:
- Ollama publishes Gemma 4, including `gemma4:26b` (about 16–19 GB, text and image input), per [ollama.com/library/gemma4](https://ollama.com/library/gemma4). After `ollama pull gemma4:26b`, it runs on a machine with enough GPU or unified memory.
- To use it, `lib/ai/gemma.ts` would need a small adapter that sends the same system prompt, the delimited user input, the image and the JSON schema to Ollama's local API instead of `@google/genai`, then parses the reply with the same Zod schema. Everything after extraction (quote verification, rules, data) would stay the same.
- What we haven't checked: whether Ollama's JSON output matches our schema as reliably as the Gemini API, how fast photo reading is on typical hardware, and memory use.

## APIs and data

| Dependency | Used for | Key | If it's missing |
|---|---|---|---|
| Gemini API: `gemma-4-26b-a4b-it` | Reading text and photos into quoted JSON | `GEMINI_API_KEY` | Demo mode (recorded sample extractions) |
| [HUD FMR API](https://www.huduser.gov/portal/datasets/fmr.html) | FY2027 Fair Market Rents, ZIP-level in the DC metro | `HUD_TOKEN` | Saved FY2027 metro FMRs |
| [Census ACS 5-year API](https://www.census.gov/data/developers/data-sets/acs-5year.html) | Median gross rent by ZIP and bedroom count (B25064, B25031) | `CENSUS_KEY` | Saved 2020–24 medians (15 counties, 8 ZIPs) |
| Google Maps JavaScript + Geocoding | Map of the ZIP code's area | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (read at runtime) | Map hidden |
| Firestore (Google Cloud) | Anonymous community flag counter | ADC + `COMMUNITY_SALT` | Counter hidden |
| FTC, DC OAG, VA/DC/MD statutes | Red flags and lease rules | None (shipped as data, cited) | — |

The research behind every number and rule, with sources, is in [`docs/research/`](docs/research).

## Project layout

```
app/(ui)/page.tsx        one page: intake form + report
app/api/check/route.ts   validation, rate limit, extraction, rules
app/api/flag/route.ts    anonymous community flag
components/              Checker, Report, GemmaRead, Stamp, Evidence, FactsBar, Community, ListingMap, Lang (EN/ES)
lib/ai/                  Gemma client, schema, pinned prompt, demo-mode extractions
lib/rules/               price, scam, lease, questions, quote verification (+ tests)
lib/data/                HUD/Census saved data + live lookups, ZIP areas, rule sheets, help links
public/samples/          5 fictional demo inputs
scripts/eval/            labelled eval sets (easy, hard, student), runner, frozen keyword baseline
scripts/a11y.mjs         axe-core audit (EN and ES) + page-error regression check
scripts/deploy.sh        one-command Cloud Run deploy (macOS/Linux)
```

## Built with

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, `@google/genai`, Zod, Vitest, `@vis.gl/react-google-maps`, `@google-cloud/firestore`, Google Cloud Run, Secret Manager and Firestore. Everything was built during the hackathon weekend.

**AI coding assistance:** we used **Claude Code** (Anthropic) as a pair programmer for scaffolding, research and code. Product decisions, rule thresholds and the demo were reviewed by the team.

## License

[Apache 2.0](LICENSE). Gemma 4 is open weights under [Apache 2.0](https://ai.google.dev/gemma/apache_2). Download the weights from [Hugging Face](https://huggingface.co/google/gemma-4-26B-A4B-it), [Kaggle](https://www.kaggle.com/models/google/gemma-4) or [Ollama](https://ollama.com/library/gemma4) (`gemma4:26b`). The sample listings and lease are fictional. Clearlease is not legal advice.
