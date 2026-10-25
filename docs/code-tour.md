# Code tour: one check, five stops

> Line numbers as of commit `2306aa7`; other work is in progress tonight, so line numbers may drift slightly.

This doc follows one check from the moment a renter clicks **Check** to the report on screen. The idea behind
the whole thing: **Gemma 4 reads and quotes, TypeScript decides.** The model never sets a price, a score or a
legal rule. Each stop has a **🎥 Say this** line for the code part of the demo video.

```
Checker.tsx ──redact/resize──▶ /api/check ──▶ runCheck ──▶ Gemma (schema JSON)
                                                  │
                                                  ▼
                       resolveFacts (quotes must be in the input) ──▶ price / scam / lease rules ──▶ Report
```

---

## Stop 1: Input, cleaned up on the device

| What | Where |
|---|---|
| `check()`: validate, redact, hash contacts, send | `components/Checker.tsx:81-129` (redact at `:97`, hashes `:98-101`) |
| `send()`: POST to `/api/check`, friendly errors | `components/Checker.tsx:62-79` |
| `redact()`: emails, phones, SSNs, long numbers | `lib/client/redact.ts:4-29` |
| `prepareImage()`: 1600px max edge, JPEG 0.85 re-encode | `lib/client/image.ts:17-51` |

Before anything leaves the browser, `redact()` swaps emails, phone numbers, SSNs and long account-style numbers
for placeholders like `[phone removed]`. The scam signal is still there ("text me at [phone removed]"), but the
number is gone. Contacts are only sent as SHA-256 hashes (for the community counter). Photos are drawn onto a
canvas and re-encoded as JPEG, which shrinks them and drops the EXIF data, GPS location included.

🎥 **Say this:** "Before anything is sent, the browser removes phone numbers and emails and strips the photo's GPS data, so the server never sees them."

## Stop 2: Gemma extracts, with a strict schema and injection defenses

| What | Where |
|---|---|
| Route: rate limit, Content-Length check, streamed size cap | `app/api/check/route.ts:14-36`, `:38-54` |
| `runCheck()`: Zod-validate request, call Gemma, then rules | `lib/server/check.ts:77-139` (Gemma call `:116-130`) |
| Pinned system prompt + `<untrusted_input>` + `escapeDelimiters` | `lib/ai/prompt.ts:3-15`, `:20-38` |
| Step-down ladder (schema → JSON mode → plain) + retries | `lib/ai/gemma.ts:37-53`, `:91-141` |
| Zod contract + JSON schema sent to Gemma | `lib/ai/schema.ts:3-4`, `:36-70`, `:133+` |
| Regex injection backstop `findInjection` | `lib/rules/scam.ts:59-82` |

The route reads the body as a stream and stops the moment it passes the size cap, so a huge upload is never
buffered. The renter's text is wrapped in `<untrusted_input>` tags; any look-alike tags inside it are defanged, so
it can't "close" the data block. The system prompt says that everything inside is data, never instructions. Gemma
must return JSON matching our schema (temperature 0), with a quote for every fact. Gemma's JSON-schema support isn't
documented, so on a 400 or bad output we step down one level and put the schema in the prompt instead. Every
request starts back at the strictest level, and only 5xx/network/timeout errors are retried (twice, with backoff).
As a backup to the model, a regex also scans the raw text for "ignore previous instructions"-style phrasing.

🎥 **Say this:** "The listing goes to Gemma 4 as fenced-off data. It has to fill a strict JSON schema with a quote for every fact, and a regex double-checks for prompt injection."

## Stop 3: Every quote is checked against the input

| What | Where |
|---|---|
| `normalize()`: case, curly quotes, dashes, whitespace | `lib/rules/quotes.ts:8-19` |
| `findQuote()`: exact match, or "..." pieces in order | `lib/rules/quotes.ts:29-53` |
| `numberInQuote()` / `bedroomsInQuote()` | `lib/rules/quotes.ts:56-76` |
| `resolveFacts()`: overrides first, then verified facts | `lib/rules/check.ts:26-88` |

This is the grounding step. A fact from Gemma only counts if its quote is actually in what the renter shared (or
in Gemma's transcript of their photo). For numbers, the number also has to appear inside that quote: rent `1650`
needs "$1,650" in the quote, and bedrooms accept "1BR", "one-bedroom", "studio" or Spanish "una recámara". If a
check fails, the fact is dropped and a note says so ("We couldn't confirm the rent…"). Gemma can't make up a fact
that the input doesn't support. Rent, bedrooms or ZIP the renter typed in Edit always win.

🎥 **Say this:** "Our code checks every quote against what you pasted. If Gemma's quote isn't there, the fact is thrown out."

## Stop 4: TypeScript rules make the verdicts

| What | Where |
|---|---|
| `runRules()`: wires price → scam → lease → questions | `lib/rules/check.ts:90-127` |
| `computePrice()`: Census + HUD range, cut-offs, per-bedroom "rough" | `lib/rules/price.ts:6-20`, `:39-140` |
| `computeScam()`: weights, cheap-rent rule, tiers | `lib/rules/scam.ts:14-24`, `:95-182` |
| `judge()` / `depositAsClause()` / `computeLease()` | `lib/rules/lease.ts:25-84`, `:90-104`, `:106-169` |
| Statute rule sheets (VA / DC / MD, with citations) | `lib/data/rule-sheets.ts:3-4`, `:28-205` |
| `buildQuestions()`: up to 6 questions to ask the landlord | `lib/rules/questions.ts:71-99` |

**Price:** the usual range runs between the Census median for that bedroom count and HUD's Fair Market Rent, so
neither source decides alone. **Bias rule:** cheap rent alone is never "Suspiciously cheap". Shared houses,
older buildings and income-restricted units are often priced low, so "25%+ under" only adds a scam flag
alongside another red flag (`scam.ts:103-104, 154-155`). Per-bedroom rent is compared against benchmarks divided by
the bedroom count, and only the "far below" direction is checked; otherwise it's a neutral "Rough comparison".
**Scam:** 9 checks, strong signs weigh 2, weaker ones 1; a score of 4+ is "Likely scam" (`scam.ts:171`). A quote
that can't be found is listed under "not counted" and adds nothing to the score. "Owner is relocating for work" alone doesn't count as the
FTC's "owner is away" sign. **Lease:** each clause is judged against the state's rule sheet (deposit cap, late fee cap,
entry notice…), with the statute citation attached. A deposit stated as a plain fact is checked too.

🎥 **Say this:** "The verdicts come from plain TypeScript rules with sources: HUD and Census for price, FTC signs for scams, state statutes for leases. Cheap rent alone is never called a scam."

## Stop 5: The report shows its work

| What | Where |
|---|---|
| Verdict board (three stamps), sections, evidence drawers | `components/Report.tsx:72-191` |
| Status → verdict word + tone ("Suspiciously cheap" needs `suspicious`) | `lib/client/verdicts.ts:25-64` |
| "What Gemma read": facts, quotes, "(quote not found, not used)" | `components/GemmaRead.tsx:128-213` |
| Quote highlighting mapped back onto the original text | `lib/client/highlight.ts:8-58` |
| "Show evidence" drawer: label, value, quote, source link | `components/Evidence.tsx:19-55` |
| Spanish: `LangProvider`, `useTr()`, hand-written templates | `components/Lang.tsx:32-55`, `lib/i18n.ts:243`, `lib/client/rules-es.ts:1-4`, `:341-347` |

The report starts with three verdict stamps (price, scam, lease). Each section has a **Show evidence** drawer
listing every benchmark, quote and source link behind it. **What Gemma read** shows each fact next to the exact
words it came from, the count of quotes verified, and the renter's own text with the verified quotes highlighted.
It uses the same normalization as the grounding check, so what's highlighted is what counted. In Spanish, the UI
strings come from `lib/i18n.ts` and every rule sentence goes through hand-written templates in `rules-es.ts` (no
machine translation). Quotes always stay in the original language so they can be checked.

🎥 **Say this:** "Every verdict shows its evidence. Open 'What Gemma read' and you see each quote highlighted in your own text, in English or Spanish."

---

## How to see it live

1. `npm run dev` and open http://localhost:3000. Without a `GEMINI_API_KEY`, demo mode uses recorded Gemma answers for the 5 samples.
2. Run the **scam** sample (`public/samples/scam-facebook.txt`): expect "Likely scam" with quoted flags (wire transfer, deployed overseas, no in-person viewing).
3. Run the **injection** sample (`public/samples/injection.txt`): a red "instructions aimed at AI" note appears, and the hidden note is reported, not followed.
4. Scroll to **What Gemma read** and open **Show the quotes in your text**: verified quotes are highlighted in what was sent (phones/emails already removed).
5. In any section, open **Show evidence** (or **Show sources** under scams) to see each benchmark, quote and statute link. Dropped quotes show as "not counted".
6. Switch **EN / ES** and run a sample again to see the Spanish report.
