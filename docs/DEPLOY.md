# Deploying Clearlease to Cloud Run

Stub. The full runbook gets written in Phase 3. Every command will work in PowerShell, and the team runs gcloud itself.

Planned outline:
1. Prerequisites: gcloud CLI, project ID, billing, region `us-east4`.
2. Enable APIs: `run`, `cloudbuild`, `artifactregistry`, `secretmanager`.
3. Create secrets: `GEMINI_API_KEY`, `HUD_TOKEN`, `CENSUS_KEY`.
4. Grant roles: runtime service account → `roles/secretmanager.secretAccessor`. Deployer → Cloud Run Source Developer. Compute Engine default service account → Cloud Run Builder.
5. Deploy:
   `gcloud run deploy clearlease --source . --region us-east4 --allow-unauthenticated --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,HUD_TOKEN=HUD_TOKEN:latest,CENSUS_KEY=CENSUS_KEY:latest`
6. Build: `output: "standalone"` plus a multi-stage `Dockerfile` (Node 24). Build-time vars go through `--set-build-env-vars`, but only if we ever add `NEXT_PUBLIC_*`.
7. Redeploy and roll back.
8. Smoke test: open the URL and run the three samples.
