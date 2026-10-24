# Verified facts for Clearlease (checked Oct 24, 2026)

Use these in the README, the UI's "why this matters" copy, and the video. Every number below has a source; do not add numbers without one.

## Rental scams (FTC Data Spotlight, Dec 2025)
- Since 2020, consumers reported nearly 65,000 rental scams to the FTC, with about $65 million in reported losses; median loss about $1,000. Most scams are never reported, so this is a floor.
- Ages 18–29 were three times more likely than other adults to report losing money to a rental scam.
- In the 12 months ending June 2025, about half of reported rental scams started with a fake ad on Facebook; about 16% on Craigslist.
- FTC red flags: rent much cheaper than similar rentals nearby; pressure to pay before seeing the unit; "out of town" landlord; same address listed with different prices/contacts; property listed for sale, not rent; requests for wire/gift card/payment-app deposits.
- Sources: https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses ; https://consumer.ftc.gov/articles/rental-listing-scams
- FBI IC3 2024: 9,359 real-estate/rental fraud complaints, >$173M losses (secondary; cite the IC3 2024 report if used).

## DMV rent burden
- Washington, DC metro (2020–2024 ACS): median rent $2,027/month; median renter household monthly income $6,827 (USAFacts from Census ACS). https://usafacts.org/answers/how-much-do-households-spend-on-rent/state/washington-dc/
- Maryland 2024: 51.5% of renter households cost-burdened (≥30% of income on housing). https://usafacts.org/answers/how-many-households-in-the-united-states-spend-too-much-on-housing/state/maryland/
- DC metro 2019–2023: renter cost-burden share higher than owners by ~16 points; metro-area renter cost burden nationally 51%. https://usafacts.org/answers/how-many-households-in-the-united-states-spend-too-much-on-housing/state/washington-dc
- DC Ward 8: lowest median rent (~$1,363) but highest cost-burden rate (57.1%) — "cheap" rent still burdens low incomes. (DCFPI / Datawrapper chart.)
- Harvard JCHS: record ~half of US renters cost-burdened. https://jchs.harvard.edu

## Model (verified)
- Gemini API hosts Gemma 4 as `gemma-4-31b-it` and `gemma-4-26b-a4b-it`; supports image input, function calling, thinking level "high"/"minimal". https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
- Gemma license: link the current Gemma Terms of Use page from ai.google.dev in the README (researcher: fetch the exact URL).

## Cloud Run (verified)
- `gcloud run deploy SERVICE --source . --set-build-env-vars KEY=VALUE` sets build-time env vars (source deploys only; not for `--image`). Also `--update-build-env-vars`, `--build-env-vars-file file.yaml`. https://docs.cloud.google.com/run/docs/configuring/services/build-environment-variables
- Runtime secrets: `--set-secrets=ENV_NAME=secret-name:latest` with Secret Manager; service account needs Secret Manager Secret Accessor. Deployer needs Cloud Run Source Developer; the Compute Engine default SA needs Cloud Run Builder for source builds.

## Data APIs
- HUD FMR: `GET https://www.huduser.gov/hudapi/public/fmr/data/{entityid}`, header `Authorization: Bearer <HUD_TOKEN>`; county entity id = 5-digit FIPS + "99999" (e.g., Montgomery County VA = 5112199999; Arlington County VA = 5101399999; DC = 1100199999; Montgomery County MD = 2403199999). Researcher: confirm metro-area entity IDs and the response field names before coding.
- Census ACS 5-year: table B25064_001E (median gross rent), query by ZCTA with CENSUS_KEY.

## Validation plan (fill docs/validation.md)
Ask 5+ students today: (1) Have you or a friend seen a listing you suspected was fake? What tipped you off? (2) Did you understand your lease before signing? Which clause surprised you later? (3) If a free tool checked price + scam risk + lease clauses in 10 seconds, would you use it before paying a deposit — and what would make you distrust it?
Template: `Name/role — Q1: … — Q2: … — Q3: … — quote: "…"`
