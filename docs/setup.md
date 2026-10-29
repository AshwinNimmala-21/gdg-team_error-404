# Setup, configuration and checks

Requires Node 20+ (we use 24).

```bash
git clone https://github.com/AshwinNimmala-21/gdg-team_error-404.git && cd gdg-team_error-404
npm install
cp .env.example .env                  # optional: add keys; without them it runs in demo mode
npm run dev                           # http://localhost:3000
```

## Minimum setup
Only **one key is required**: `GEMINI_API_KEY` (free from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Everything else is optional and degrades visibly:

| Key | Required? | Without it |
|---|---|---|
| `GEMINI_API_KEY` | **Yes**, for live Gemma | Demo mode: the 5 samples use recorded extractions in Gemma's exact format; other text gets a basic keyword reader; photos can't be read. Force it with `MOCK_AI=1`. |
| `HUD_TOKEN` | No | Saved HUD FY2027 Fair Market Rents, labelled "saved figure" in the evidence |
| `CENSUS_KEY` | No | Saved Census ACS 2020–24 medians, labelled the same way |
| `COMMUNITY_SALT` (+ Firestore) | No | The anonymous "flag this listing" counter is simply off |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | No area map. The key is a browser key restricted by referrer: ours only allows `http://localhost:3000` and our Cloud Run URL. On any other port or domain the report shows "The map couldn't load for this ZIP code" and everything else still works. Self-hosters need their own key with their own referrers. |
| `GEMMA_PROVIDER`, `GEMMA_BASE_URL` | No | The Gemini API is used. Set `GEMMA_PROVIDER=ollama` to run Gemma 4 on your own machine (no `GEMINI_API_KEY` needed); `GEMMA_BASE_URL` defaults to `http://localhost:11434/v1`. See [`self-host.md`](self-host.md). |

Checked on Oct 25: a production build with only `GEMINI_API_KEY` set (the other four blanked) passed all 5 samples live (`node scripts/e2e.mjs`), showed saved figures, no counter and no map.

```bash
npm test            # 160 unit tests (rules, grounding, redaction, injection, schema, pricing, leases, map, keyword fallback)
npm run lint
npm run build && npm start              # production server (standalone, like Cloud Run)
node scripts/e2e.mjs http://localhost:3000            # API check of the 5 samples
node scripts/screenshots.mjs http://localhost:3000    # clicks every sample at 375 and 1280 px (uses your installed Chrome)
```

## Deploy your own (Google Cloud Run)
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
- The script's dry run is tested. The real run follows the same commands as [`DEPLOY.md`](DEPLOY.md), the PowerShell runbook we used for the live deploy.
