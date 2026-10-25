# Deploy Clearlease to Google Cloud Run

**On macOS or Linux, use `scripts/deploy.sh` instead** (`PROJECT=your-project-id ./scripts/deploy.sh --dry-run` first). It runs the same steps, asks for secrets with hidden input and is safe to re-run.

These commands are for Windows PowerShell and assume you've never used gcloud. Run them from the repo root. Each step has a one-line "why". Expect about 15 minutes the first time. Hosting is Google Cloud only.

**What gets deployed:**
- **Cloud Run:** one service, `clearlease`, in `us-east4`, built from the repo's `Dockerfile` (Next.js standalone server, Node 24).
- **Secret Manager:** holds `GEMINI_API_KEY`, `HUD_TOKEN`, `CENSUS_KEY` and `COMMUNITY_SALT`. They reach the service as env vars at runtime and are never baked into the image.
- **Firestore (Native mode, `us-east4`):** the anonymous community flag counter. It's written to only when someone flags a listing, and stores keyed hashes (one-way fingerprints), a count and a date, and nothing else.
- **Maps settings:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` are plain runtime env vars. The server reads them per request and passes them to the map as props. That's why they don't need to exist at build time. Google documents `--set-build-env-vars` for buildpacks only, not Dockerfile builds; we checked on 2026-10-24.

> `.env`/`.env.local` never leave your laptop. `.gcloudignore` and `.dockerignore` exclude them. Without that, Next.js would copy `.env` into the standalone server inside the image.

---

## 0. One-time setup on your laptop

```powershell
winget install --id Google.CloudSDK -e      # installs the gcloud CLI; close and reopen PowerShell afterwards
gcloud auth login                            # opens a browser to sign in with the Google account that owns the project
```

## 1. Pick the project and region

```powershell
$PROJECT = "your-project-id"                 # the Google Cloud project ID (not the name)
gcloud config set project $PROJECT           # every later command targets this project
gcloud config set run/region us-east4        # Northern Virginia: closest to DMV users
$PROJECT_NUMBER = gcloud projects describe $PROJECT --format="value(projectNumber)"   # needed for service-account emails
$RUNTIME_SA = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"                 # default identity Cloud Run runs as, and Cloud Build builds as
```

Billing must be enabled on the project (Console, Billing). Cloud Run, Firestore and Secret Manager all have free tiers that cover a hackathon.

## 2. Enable the APIs

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com firestore.googleapis.com
# run = hosting, cloudbuild = builds the Dockerfile, artifactregistry = stores the image,
# secretmanager = keys, firestore = community counter
gcloud services enable maps-backend.googleapis.com geocoding-backend.googleapis.com
# Maps JavaScript API + Geocoding API, used by the optional "approximate area" map
```

## 3. Create the Firestore database

```powershell
gcloud firestore databases create --location=us-east4 --type=firestore-native   # one "(default)" Native-mode database, same region as the service
```

If it says the database already exists, that's fine.

## 4. Create the secrets

Paste each value between the quotes. The app trims whitespace, so PowerShell's trailing newline doesn't matter.

```powershell
"PASTE_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-   # from aistudio.google.com/apikey
"PASTE_HUD_TOKEN"      | gcloud secrets create HUD_TOKEN --data-file=-        # from huduser.gov/hudapi/public/register
"PASTE_CENSUS_KEY"     | gcloud secrets create CENSUS_KEY --data-file=-       # from api.census.gov/data/key_signup.html

# A random salt for the community counter's keyed hashes. Nobody needs to know it; don't lose it, or old counts stop matching.
$SALT = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
$SALT | gcloud secrets create COMMUNITY_SALT --data-file=-
```

To change a value later, run `"NEW_VALUE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-`, then redeploy (step 7).

## 5. Grant the roles

```powershell
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:$RUNTIME_SA" --role="roles/secretmanager.secretAccessor"   # runtime can read the 4 secrets
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:$RUNTIME_SA" --role="roles/datastore.user"                 # runtime can read/write Firestore (the "Cloud Datastore User" role covers Firestore)
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:$RUNTIME_SA" --role="roles/run.builder"                    # source deploys build as this account
```

If a teammate deploys and isn't a project Owner, also grant their user account `roles/run.sourceDeveloper` and `roles/iam.serviceAccountUser`.

## 6. Create and restrict the Maps key

In the Console, go to **APIs & Services → Credentials → Create credentials → API key**. Then edit the key:
- **Application restrictions:** Websites. Add `http://localhost:3000/*` and `https://*.run.app/*`.
- **API restrictions:** Maps JavaScript API and Geocoding API only.

This key is visible in the browser by design. The restrictions are what protect it. A Map ID is optional: without one we use `DEMO_MAP_ID`.

## 7. Deploy

```powershell
$MAPS_KEY = "PASTE_RESTRICTED_MAPS_KEY"
gcloud run deploy clearlease `
  --source . `
  --region us-east4 `
  --allow-unauthenticated `
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,HUD_TOKEN=HUD_TOKEN:latest,CENSUS_KEY=CENSUS_KEY:latest,COMMUNITY_SALT=COMMUNITY_SALT:latest" `
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$MAPS_KEY,NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID,RATE_LIMIT_PER_MIN=30" `
  --memory 512Mi --cpu 1 --concurrency 40 --timeout 120 --max-instances 3
```

What the flags do:
- `--source .` uploads the repo (minus `.gcloudignore`), and Cloud Build builds the `Dockerfile`.
- `--allow-unauthenticated` makes it a public website.
- `--set-secrets` mounts the Secret Manager values as env vars at runtime.
- `--timeout 120` covers a lease photo (about 34 s) plus up to two retries; `lib/ai/gemma.ts` stops at 110 s.
- `RATE_LIMIT_PER_MIN=30` raises the per-IP limit from the default 10. Judges and the demo often share one venue Wi-Fi IP.
- `--max-instances 3` caps cost and keeps the in-memory rate limit meaningful.

The first deploy asks to create an Artifact Registry repository. Answer **Y**. Building takes about 3–5 minutes.

```powershell
$URL = gcloud run services describe clearlease --region us-east4 --format="value(status.url)"   # the public https://…run.app address
$URL
```

## 8. Smoke test

```powershell
Start-Process $URL                                   # open the site; click the 5 samples
node scripts/e2e.mjs $URL                            # API check of the 5 samples (PASS/FAIL per sample)
```

With the real Gemini key the samples are read live by Gemma, so the wording can differ a little from demo mode. The verdict words should still match the table in `PLAN.md` §6. The report header should say "Read by Gemma 4 (gemma-4-26b-a4b-it)".

## 9. Redeploy after code changes

```powershell
git pull
gcloud run deploy clearlease --source . --region us-east4   # keeps the secrets, env vars and settings from step 7
```

## 10. Logs, rollback, cost guard

```powershell
gcloud run services logs read clearlease --region us-east4 --limit 50                       # recent logs (we never log user text)
gcloud run revisions list --service clearlease --region us-east4                            # every deployed version
gcloud run services update-traffic clearlease --region us-east4 --to-revisions REVISION_NAME=100   # roll back to a known-good revision
```

Inference cost is $0 on the Gemini API free tier (Gemma 4 is free-tier only). Cloud Run scales to zero when idle.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `PERMISSION_DENIED … secretmanager` on deploy or start | Re-run step 5 (secretAccessor on `$RUNTIME_SA`). |
| Report says "Demo mode" on the live site | The `GEMINI_API_KEY` secret is missing or empty. Check step 4 and the `--set-secrets` line. |
| No community counter in the scam section | `COMMUNITY_SALT` secret is missing, Firestore isn't created (step 3), or `roles/datastore.user` is missing. Any of these makes it skip silently. |
| Map shows "couldn't load" | Maps key restrictions: add the exact `*.run.app/*` referrer and enable the Geocoding API. |
| Build fails fetching fonts | Retry; Cloud Build needs outbound access to Google Fonts (normal). |
