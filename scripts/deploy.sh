#!/usr/bin/env bash
# Deploy Clearlease to Google Cloud Run (macOS/Linux; bash or zsh). The PowerShell runbook is docs/DEPLOY.md.
#
#   PROJECT=my-project ./scripts/deploy.sh             # deploy (asks for any secret it needs)
#   PROJECT=my-project ./scripts/deploy.sh --dry-run   # print the commands, change nothing
#
# Only GEMINI_API_KEY is required. HUD_TOKEN and CENSUS_KEY are optional (saved FY2027/ACS figures are used
# without them, labelled in the UI). The anonymous flag counter (Firestore + COMMUNITY_SALT) and the map
# (MAPS_KEY) are optional too. Re-running is safe: APIs, roles and the Firestore database are only created
# if missing, and a secret gets a new version only when you type a new value.
#
# Secrets: read from the environment if already exported, otherwise asked for with hidden input. They are
# passed to gcloud on stdin, never as command-line arguments, and never printed or written to disk.
# This script never reads .env files.
set -euo pipefail

DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1
REGION="${REGION:-us-east4}"
SERVICE="${SERVICE:-clearlease}"
RATE_LIMIT="${RATE_LIMIT_PER_MIN:-30}"

say() { printf '\n==> %s\n' "$*"; }
run() { # print, then run unless --dry-run
  printf '    $ %s\n' "$*"
  [[ $DRY == 1 ]] || "$@"
}
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1. $2" >&2; exit 1; }; }

need gcloud "Install it: brew install --cask gcloud-cli (macOS) or https://cloud.google.com/sdk/docs/install"
[[ -f Dockerfile && -f package.json ]] || { echo "Run this from the repo root." >&2; exit 1; }
PROJECT="${PROJECT:-}"
[[ -n "$PROJECT" ]] || { echo "Set PROJECT=<your-project-id> (gcloud projects list shows it)." >&2; exit 1; }
# --dry-run makes no gcloud calls at all, so it is safe to run anywhere.

say "Project $PROJECT, region $REGION, service $SERVICE$([[ $DRY == 1 ]] && echo ' (dry run: nothing will change)')"
export CLOUDSDK_CORE_PROJECT="$PROJECT" # every gcloud call below targets this project; your global config is untouched
if [[ $DRY == 1 ]]; then PROJECT_NUMBER="PROJECT_NUMBER"; else PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"; fi
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# --- Secrets: ask once, hidden. Empty answer = skip an optional one.
ask_secret() { # name, required(1/0), help
  local name="$1" required="$2" help="$3" value="${!1:-}"
  if [[ -z "$value" && $DRY == 0 ]]; then
    printf '%s (%s)%s: ' "$name" "$help" "$([[ $required == 1 ]] && echo '' || echo ', Enter to skip')" >&2
    IFS= read -rs value; echo >&2
  fi
  [[ -z "$value" && $required == 1 && $DRY == 0 ]] && { echo "$name is required." >&2; exit 1; }
  printf -v "$name" '%s' "$value"
}
ask_secret GEMINI_API_KEY 1 "aistudio.google.com/apikey"
ask_secret HUD_TOKEN 0 "optional, huduser.gov/hudapi/public/register"
ask_secret CENSUS_KEY 0 "optional, api.census.gov/data/key_signup.html"
ask_secret MAPS_KEY 0 "optional, a Maps JavaScript + Geocoding key restricted to *.run.app"
if [[ -z "${COMMUNITY:-}" ]]; then
  if [[ $DRY == 1 ]]; then COMMUNITY=n; else read -rp "Turn on the anonymous flag counter (Firestore)? [y/N] " COMMUNITY; fi
fi

say "Enable APIs (no-op if already on)"
APIS=(run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com)
[[ "$COMMUNITY" =~ ^[Yy] ]] && APIS+=(firestore.googleapis.com)
[[ -n "${MAPS_KEY:-}" ]] && APIS+=(maps-backend.googleapis.com geocoding-backend.googleapis.com)
run gcloud services enable "${APIS[@]}"

# Create the secret if missing, else add a version only if the value changed. Value goes in on stdin.
upsert_secret() { # name, value
  local name="$1" value="$2"
  printf '    $ (secret %s via stdin)\n' "$name"
  [[ $DRY == 1 ]] && return 0
  if gcloud secrets describe "$name" >/dev/null 2>&1; then
    local current
    current="$(gcloud secrets versions access latest --secret="$name" 2>/dev/null || true)"
    if [[ "$current" == "$value" ]]; then echo "      unchanged"; return 0; fi
    printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- >/dev/null && echo "      new version added"
  else
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=- >/dev/null && echo "      created"
  fi
}

say "Secrets (Secret Manager)"
SECRETS=("GEMINI_API_KEY=GEMINI_API_KEY:latest")
upsert_secret GEMINI_API_KEY "$GEMINI_API_KEY"
if [[ -n "$HUD_TOKEN" ]]; then upsert_secret HUD_TOKEN "$HUD_TOKEN"; SECRETS+=("HUD_TOKEN=HUD_TOKEN:latest"); fi
if [[ -n "$CENSUS_KEY" ]]; then upsert_secret CENSUS_KEY "$CENSUS_KEY"; SECRETS+=("CENSUS_KEY=CENSUS_KEY:latest"); fi
if [[ "$COMMUNITY" =~ ^[Yy] ]]; then
  # Keep an existing salt: changing it would orphan old counts.
  if [[ $DRY == 1 ]] || gcloud secrets describe COMMUNITY_SALT >/dev/null 2>&1; then
    echo "    COMMUNITY_SALT: keeping the existing salt"
  else
    upsert_secret COMMUNITY_SALT "$(openssl rand -base64 32)"
  fi
  SECRETS+=("COMMUNITY_SALT=COMMUNITY_SALT:latest")
  say "Firestore database (created only if missing)"
  if [[ $DRY == 1 ]] || ! gcloud firestore databases describe --database='(default)' >/dev/null 2>&1; then
    run gcloud firestore databases create --location="$REGION" --type=firestore-native
  else
    echo "    already exists"
  fi
fi

say "Roles for the runtime service account (adding an existing binding is a no-op)"
ROLES=(roles/secretmanager.secretAccessor roles/run.builder)
[[ "$COMMUNITY" =~ ^[Yy] ]] && ROLES+=(roles/datastore.user)
for role in "${ROLES[@]}"; do
  run gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$RUNTIME_SA" --role="$role" --condition=None --quiet --format=none
done

say "Deploy (Cloud Build builds the Dockerfile; .gcloudignore keeps .env files out)"
ENV_VARS="RATE_LIMIT_PER_MIN=$RATE_LIMIT"
[[ -n "${MAPS_KEY:-}" ]] && ENV_VARS+=",NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$MAPS_KEY,NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=${MAP_ID:-DEMO_MAP_ID}"
# The Maps key is a browser key (visible in the page by design); it's protected by its referrer restriction.
run gcloud run deploy "$SERVICE" --source . --region "$REGION" --allow-unauthenticated \
  --set-secrets "$(IFS=,; echo "${SECRETS[*]}")" \
  --set-env-vars "$ENV_VARS" \
  --memory 512Mi --cpu 1 --concurrency 40 --timeout 120 --max-instances 3 --quiet

if [[ $DRY == 1 ]]; then URL="https://<service>.run.app"; else URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"; fi
say "Done: $URL"
echo "    Smoke test: node scripts/e2e.mjs $URL"
