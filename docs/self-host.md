# Self-host Gemma 4 (Ollama): works, smaller models are less accurate

A nonprofit that can't send tenant documents to a cloud API can run Gemma 4's open weights on its own machine. The same prompt, schema, quote verification and rules run; only the transport changes (`lib/ai/ollama.ts`, Ollama's OpenAI-compatible endpoint). The Gemini API stays the default, and its behaviour is unchanged (covered by tests).

```bash
ollama pull gemma4:26b                     # the model we host; 16–19 GB
OLLAMA_CONTEXT_LENGTH=16384 ollama serve   # the default 4K context is too small for a lease photo
GEMMA_PROVIDER=ollama GEMMA_MODEL=gemma4:26b npm run dev   # GEMMA_BASE_URL defaults to http://localhost:11434/v1
```

**Tested Sun Oct 25, 5 AM, on one laptop** (RTX 4050 laptop GPU, 32 GB RAM, Windows, Ollama 0.40.11), with our 5 samples (`node scripts/e2e.mjs`, strict: price, scam tier, lease verdict, flag count and injection must all match):

| Local model | Where it ran | Samples passing | Text check | Lease photo | What went wrong |
|---|---|---|---|---|---|
| `gemma4:e2b-it-qat` (4.3 GB) | 100% GPU | 1 of 5 | 13–16 s | 27 s | Invented "lease clauses" from plain listings (quotes were real, so they counted); flagged 9 of 9 on the Facebook deal (expected 7); one false "Some red flags" on the normal listing |
| `gemma4:e4b-it-qat` (6.1 GB) | 50% CPU / 50% GPU | 3 of 5 | 17–23 s | 42 s | 8 of 9 on the Facebook deal (expected 7); one false "Some red flags" on the normal listing that didn't repeat on a re-run |
| `gemma4:26b` (what we host) | not tested | — | — | — | Needs about 16–19 GB of GPU or unified memory, more than this laptop has free |

- Both local models read the lease photo and returned "Fix before signing" with 2 conflicts; the hosted model finds 3.
- Locally, the strict JSON-schema request worked first time on every call, so each check is one model call.
- Our honest reading: the small models run on a laptop at hosted-like speed, but they over-flag and the smallest invents clauses. A nonprofit should run `gemma4:26b` on a machine with enough memory and re-run `scripts/eval` before relying on it.
- We haven't run the full evaluation on a local model.

Weights: [Hugging Face](https://huggingface.co/google/gemma-4-26B-A4B-it), [Kaggle](https://www.kaggle.com/models/google/gemma-4) or [Ollama](https://ollama.com/library/gemma4) (`gemma4:26b`), under [Apache 2.0](https://ai.google.dev/gemma/apache_2). Environment variables: see [`setup.md`](setup.md).
