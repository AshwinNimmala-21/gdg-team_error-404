# The model: how Gemma 4 is called, and what it costs

## Why the AI is necessary

Listings and leases are messy, and they arrive as screenshots and phone photos. Gemma 4 reads both (it is multimodal) and turns them into one strict JSON shape: rent, bedrooms, ZIP, payment methods, seven scam signals and lease clauses. Every field carries a **verbatim quote** from the input. It also understands negation and paraphrase ("we never take wire transfers" is *not* a red flag), which keyword rules can't: on our hard eval set a keyword scanner raised false alarms on 6 of 9 legitimate listings with disclaimers like that. Normally it's one Gemma call per check: JSON mode with the schema in the prompt, then strict Zod validation. We don't send the API's stricter schema mode, because the Gemini API rejected it for this model on 46 of 46 calls (HTTP 400, measured Oct 24–25). Transient errors are retried.

## Why `gemma-4-26b-a4b-it`

It's a mixture-of-experts model with about 3.8B parameters active per token (of 25.2B total). That makes it fast and cheap enough for a free tool, and a nonprofit can self-host the open weights.
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
