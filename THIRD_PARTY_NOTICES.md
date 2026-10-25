# Third-party notices

Clearlease is licensed under [Apache 2.0](LICENSE). It uses the third-party software, data, fonts, services and model listed below, each under its own terms. This page is a good-faith inventory, not legal advice. Each package's own license file in `node_modules/` is the authoritative text.

## How this list was made (Oct 25, 2026)

- **Production dependencies:** `npm ls --omit=dev --all --json --long` on the installed tree (from `package-lock.json`, Node 25.6.1 on macOS arm64). For every installed package we read the `license` field of its own `node_modules/<name>/package.json`, and checked that its version matched what `npm ls` reported (0 mismatches).
- **Dev dependencies:** the direct ones in `package.json`, read the same way. We also scanned the full dev tree (494 installed packages) for copyleft or unknown licenses.
- **Platform-specific binaries:** `npm` installs only the optional native packages for the machine it runs on. The table lists what's installed on our macOS arm64 machine. The Linux build in the `Dockerfile` (`node:24-slim`) installs the Linux versions instead. Their licenses, from `package-lock.json`, are: `@img/sharp-linux-x64` 0.35.5 Apache-2.0, `@img/sharp-libvips-linux-x64` 1.3.4 LGPL-3.0-or-later, `@next/swc-linux-x64-gnu` 16.4.3 MIT. Optional and peer packages that aren't installed (other platforms' `@img/sharp-*` and `@next/swc-*`, plus `@modelcontextprotocol/sdk`, `@playwright/test`, `babel-plugin-react-compiler`, `bufferutil`, `sass` and `utf-8-validate`) are not listed.
- This page doesn't replace a full legal review, and it doesn't cover the licenses of code bundled inside each package (for example, the libraries inside the libvips binary, listed in that package's README).

## Licenses to note

**No GPL, AGPL, SSPL, UNLICENSED or unknown licenses were found** in the production tree (155 installed packages) or the full dev tree (494 installed packages). Every installed package declares a license. Some need attention:

| Package | License | Where | Note |
|---|---|---|---|
| `@img/sharp-libvips-darwin-arm64` 1.3.4 (on Linux: `@img/sharp-libvips-linux-x64`) | LGPL-3.0-or-later | Production. `next` → `sharp`. Shipped in `.next/standalone` and in the Docker image. | **Weak copyleft.** This is the prebuilt libvips library that sharp loads at runtime. Clearlease doesn't modify it or include it in the source repository, and the LGPL allows it to be used by software under other licenses. If you **distribute** a build or container image, keep this package's license and notices with it, and follow the LGPL's terms for that library. The package README lists the bundled libraries and their licenses (glib, libvips, pango, librsvg, libheif and others are LGPLv3; cairo is MPL 1.1). |
| `@img/sharp-wasm32` 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | Production (optional dependency of `sharp`) | The WebAssembly build of sharp with libvips. Same note as above. |
| `caniuse-lite` 1.0.30001819 | CC-BY-4.0 | Production (`next`) | Browser-support data. Attribution is required, and its license file must be kept. Compatible with Apache-2.0. |
| `axe-core`, `lightningcss` (and its darwin-arm64 binary) | MPL-2.0 | Dev only (`axe-core` for the a11y script; `lightningcss` through Tailwind CSS and Vite) | File-level copyleft that applies only to changes made to those files. Not shipped in the production server. |
| `argparse` 2.0.1 | Python-2.0 | Dev only (`eslint`) | Permissive. |

No incompatibility with distributing this project's source under Apache-2.0 was found. The only copyleft in what we ship is the LGPL libvips library, which comes with the `sharp` dependency of Next.js.

## Production dependencies

Direct dependencies are marked "(direct)". Everything else is transitive. Counts: MIT 89, Apache-2.0 28, ISC 18, BSD-3-Clause 12, BlueOak-1.0.0 4, LGPL-3.0-or-later 1, Apache-2.0 AND LGPL-3.0-or-later AND MIT 1, CC-BY-4.0 1, 0BSD 1 (155 packages).

| Package | Version | License |
|---|---|---|
| `@emnapi/core` | 1.10.0 | MIT |
| `@emnapi/runtime` | 1.11.3 | MIT |
| `@emnapi/wasi-threads` | 1.2.1 | MIT |
| `@google-cloud/firestore` (direct) | 9.4.0 | Apache-2.0 |
| `@google-cloud/firestore-api` | 0.2.0 | Apache-2.0 |
| `@google/genai` (direct) | 2.31.0 | Apache-2.0 |
| `@googlemaps/js-api-loader` | 2.1.3 | Apache-2.0 |
| `@grpc/grpc-js` | 1.14.6 | Apache-2.0 |
| `@grpc/proto-loader` | 0.8.1 | Apache-2.0 |
| `@img/colour` | 1.1.0 | MIT |
| `@img/sharp-darwin-arm64` | 0.35.5 | Apache-2.0 |
| `@img/sharp-libvips-darwin-arm64` | 1.3.4 | LGPL-3.0-or-later |
| `@img/sharp-wasm32` | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| `@isaacs/cliui` | 8.0.2 | ISC |
| `@js-sdsl/ordered-map` | 4.4.2 | MIT |
| `@napi-rs/wasm-runtime` | 1.2.5 | MIT |
| `@next/env` | 16.4.3 | MIT |
| `@next/swc-darwin-arm64` | 16.4.3 | MIT |
| `@opentelemetry/api` | 1.10.0 | Apache-2.0 |
| `@pkgjs/parseargs` | 0.11.0 | MIT |
| `@protobufjs/aspromise` | 1.1.2 | BSD-3-Clause |
| `@protobufjs/base64` | 1.1.2 | BSD-3-Clause |
| `@protobufjs/codegen` | 2.0.5 | BSD-3-Clause |
| `@protobufjs/eventemitter` | 1.1.1 | BSD-3-Clause |
| `@protobufjs/fetch` | 1.1.1 | BSD-3-Clause |
| `@protobufjs/float` | 1.0.2 | BSD-3-Clause |
| `@protobufjs/path` | 1.1.2 | BSD-3-Clause |
| `@protobufjs/pool` | 1.1.0 | BSD-3-Clause |
| `@protobufjs/utf8` | 1.1.2 | BSD-3-Clause |
| `@swc/helpers` | 0.5.23 | Apache-2.0 |
| `@tybys/wasm-util` | 0.10.4 | MIT |
| `@types/google.maps` | 3.66.7 | MIT |
| `@types/node` | 24.19.2 | MIT |
| `@types/retry` | 0.12.0 | MIT |
| `@vis.gl/react-google-maps` (direct) | 1.10.1 | MIT |
| `agent-base` | 7.1.4 | MIT |
| `ansi-regex` | 5.0.1 | MIT |
| `ansi-regex` | 6.4.0 | MIT |
| `ansi-styles` | 4.3.0 | MIT |
| `ansi-styles` | 6.2.3 | MIT |
| `balanced-match` | 1.0.2 | MIT |
| `base64-js` | 1.5.1 | MIT |
| `baseline-browser-mapping` | 2.11.32 | Apache-2.0 |
| `bignumber.js` | 9.3.1 | MIT |
| `brace-expansion` | 2.1.7 | MIT |
| `buffer-equal-constant-time` | 1.0.1 | BSD-3-Clause |
| `caniuse-lite` | 1.0.30001819 | CC-BY-4.0 |
| `client-only` | 0.0.1 | MIT |
| `cliui` | 8.0.1 | ISC |
| `color-convert` | 2.0.1 | MIT |
| `color-name` | 1.1.4 | MIT |
| `cross-spawn` | 7.0.6 | MIT |
| `data-uri-to-buffer` | 4.0.1 | MIT |
| `debug` | 4.4.3 | MIT |
| `detect-libc` | 2.1.2 | Apache-2.0 |
| `duplexify` | 4.1.3 | MIT |
| `eastasianwidth` | 0.2.0 | MIT |
| `ecdsa-sig-formatter` | 1.0.11 | Apache-2.0 |
| `emoji-regex` | 8.0.0 | MIT |
| `emoji-regex` | 9.2.2 | MIT |
| `end-of-stream` | 1.4.5 | MIT |
| `escalade` | 3.2.0 | MIT |
| `extend` | 3.0.2 | MIT |
| `fast-deep-equal` | 3.1.3 | MIT |
| `fast-equals` | 6.2.1 | MIT |
| `fetch-blob` | 3.2.0 | MIT |
| `foreground-child` | 3.3.1 | ISC |
| `formdata-polyfill` | 4.0.10 | MIT |
| `functional-red-black-tree` | 1.0.1 | MIT |
| `gaxios` | 7.3.1 | Apache-2.0 |
| `gaxios` | 8.3.2 | Apache-2.0 |
| `gcp-metadata` | 8.1.2 | Apache-2.0 |
| `gcp-metadata` | 9.2.2 | Apache-2.0 |
| `get-caller-file` | 2.0.5 | ISC |
| `glob` | 10.5.0 | ISC |
| `google-auth-library` | 10.5.0 | Apache-2.0 |
| `google-auth-library` | 10.9.1 | Apache-2.0 |
| `google-auth-library` | 11.3.1 | Apache-2.0 |
| `google-gax` | 5.0.8 | Apache-2.0 |
| `google-gax` | 6.13.0 | Apache-2.0 |
| `google-logging-utils` | 1.1.3 | Apache-2.0 |
| `google-logging-utils` | 2.1.0 | Apache-2.0 |
| `gtoken` | 8.0.0 | MIT |
| `http-proxy-agent` | 7.0.2 | MIT |
| `https-proxy-agent` | 7.0.6 | MIT |
| `inherits` | 2.0.4 | ISC |
| `is-fullwidth-code-point` | 3.0.0 | MIT |
| `isexe` | 2.0.0 | ISC |
| `jackspeak` | 3.4.3 | BlueOak-1.0.0 |
| `json-bigint` | 1.0.0 | MIT |
| `jwa` | 2.0.1 | MIT |
| `jws` | 4.0.1 | MIT |
| `lodash.camelcase` | 4.3.0 | MIT |
| `long` | 5.3.2 | Apache-2.0 |
| `lru-cache` | 10.4.3 | ISC |
| `minimatch` | 9.0.9 | ISC |
| `minipass` | 7.1.3 | BlueOak-1.0.0 |
| `ms` | 2.1.3 | MIT |
| `nanoid` | 3.3.20 | MIT |
| `next` (direct) | 16.4.3 | MIT |
| `node-domexception` | 1.0.0 | MIT |
| `node-fetch` | 3.3.2 | MIT |
| `object-hash` | 3.0.0 | MIT |
| `once` | 1.4.0 | ISC |
| `p-retry` | 4.6.2 | MIT |
| `package-json-from-dist` | 1.0.1 | BlueOak-1.0.0 |
| `path-key` | 3.1.1 | MIT |
| `path-scurry` | 1.11.1 | BlueOak-1.0.0 |
| `picocolors` | 1.1.1 | ISC |
| `postcss` | 8.5.23 | MIT |
| `proto3-json-serializer` | 3.0.4 | Apache-2.0 |
| `proto3-json-serializer` | 4.1.0 | Apache-2.0 |
| `protobufjs` | 7.6.6 | BSD-3-Clause |
| `react` (direct) | 19.3.0 | MIT |
| `react-dom` (direct) | 19.3.0 | MIT |
| `readable-stream` | 3.6.2 | MIT |
| `require-directory` | 2.1.1 | MIT |
| `retry` | 0.13.1 | MIT |
| `retry-request` | 8.0.4 | MIT |
| `retry-request` | 9.1.0 | MIT |
| `rimraf` | 5.0.10 | ISC |
| `safe-buffer` | 5.2.1 | MIT |
| `scheduler` | 0.28.0 | MIT |
| `semver` | 7.8.5 | ISC |
| `sharp` | 0.35.5 | Apache-2.0 |
| `shebang-command` | 2.0.0 | MIT |
| `shebang-regex` | 3.0.0 | MIT |
| `signal-exit` | 4.1.0 | ISC |
| `source-map-js` | 1.2.2 | BSD-3-Clause |
| `stream-events` | 1.0.5 | MIT |
| `stream-shift` | 1.0.3 | MIT |
| `string_decoder` | 1.3.0 | MIT |
| `string-width` | 4.2.3 | MIT |
| `string-width` | 5.1.2 | MIT |
| `string-width-cjs` | 4.2.3 | MIT |
| `strip-ansi` | 6.0.1 | MIT |
| `strip-ansi` | 7.2.0 | MIT |
| `strip-ansi-cjs` | 6.0.1 | MIT |
| `stubs` | 3.0.0 | MIT |
| `styled-jsx` | 5.1.6 | MIT |
| `teeny-request` | 10.1.4 | Apache-2.0 |
| `tslib` | 2.8.1 | 0BSD |
| `undici-types` | 7.24.6 | MIT |
| `util-deprecate` | 1.0.2 | MIT |
| `web-streams-polyfill` | 3.3.3 | MIT |
| `which` | 2.0.2 | ISC |
| `wrap-ansi` | 7.0.0 | MIT |
| `wrap-ansi` | 8.1.0 | MIT |
| `wrap-ansi-cjs` | 7.0.0 | MIT |
| `wrappy` | 1.0.2 | ISC |
| `ws` | 8.22.0 | MIT |
| `y18n` | 5.0.8 | ISC |
| `yargs` | 17.7.3 | MIT |
| `yargs-parser` | 21.1.1 | ISC |
| `zod` (direct) | 4.6.7 | MIT |

## Dev dependencies (direct)

Used to build, lint and test Clearlease. They are not part of the production server.

| Package | Version installed | License |
|---|---|---|
| `@tailwindcss/turbopack` | 4.3.3 | MIT |
| `@types/node` | 24.19.2 | MIT |
| `@types/react` | 19.3.0 | MIT |
| `@types/react-dom` | 19.3.0 | MIT |
| `axe-core` | 4.14.0 per `package-lock.json` and `npm ls`; its `package.json` on disk says 4.10.3 | MPL-2.0 |
| `eslint` | 9.39.5 | MIT |
| `eslint-config-next` | 16.4.3 | MIT |
| `playwright-core` | 1.64.1 | Apache-2.0 |
| `tailwindcss` | 4.3.3 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |
| `vitest` | 5.0.5 | MIT |

Full dev tree (494 installed packages, production included): MIT 382, Apache-2.0 47, ISC 29, BSD-3-Clause 13, BSD-2-Clause 7, MPL-2.0 5, BlueOak-1.0.0 5, Python-2.0 1, CC0-1.0 1, CC-BY-4.0 1, 0BSD 1, LGPL-3.0-or-later 1, Apache-2.0 AND LGPL-3.0-or-later AND MIT 1.

## Fonts

Loaded with `next/font/google`, which downloads the font files at build time and serves them from the app.

| Font | License | Source |
|---|---|---|
| Public Sans | SIL Open Font License 1.1. A modified version of Libre Franklin; GSA's changes are CC0. | <https://github.com/uswds/public-sans/blob/develop/LICENSE.md>, <https://github.com/google/fonts/blob/main/ofl/publicsans/OFL.txt> |
| IBM Plex Mono | SIL Open Font License 1.1, Reserved Font Name "Plex" | <https://github.com/IBM/plex/blob/master/LICENSE.txt>, <https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt> |

## Data

Saved figures ship in `lib/data/`, and live figures are fetched when keys are set. Sources and caveats are in [`docs/research/`](docs/research).

- **U.S. government works.** "Copyright protection under this title is not available for any work of the United States Government" ([17 U.S.C. § 105](https://www.law.cornell.edu/uscode/text/17/105)). USAGov notes exceptions: third-party content on federal sites, agency logos and trademarks, and works of state and local governments, which the designation doesn't cover ([usa.gov/government-copyright](https://www.usa.gov/government-copyright)). We use no agency logos.
- **HUD Fair Market Rents (FY2027)**, from the [HUD USER FMR dataset](https://www.huduser.gov/portal/datasets/fmr.html) and the HUD FMR API. HUD's *Web Publication Procedures and Style Guide* says: "As a rule, all content--including written materials and graphics--on HUD's Internet websites is in the public domain. Anyone can use or link to any material written or created for HUD's Internet websites." (§ D, "Copyrights and Attribution", [hud.gov/sites/documents/webpubstandards.pdf](https://www.hud.gov/sites/documents/webpubstandards.pdf), fetched Oct 25, 2026.)
- **U.S. Census Bureau, American Community Survey 2020–2024 5-year estimates** (tables B25064 and B25031), from the [Census Data API](https://www.census.gov/data/developers/data-sets/acs-5year.html). These are federal government works under 17 U.S.C. § 105. The Census Bureau asks users to cite it as the source of the data ([census.gov/about/policies/citation.html](https://www.census.gov/about/policies/citation.html)). Its API terms of service say that services using the API "should display the following notice prominently within the application": **"This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau."** ([census.gov/data/developers/about/terms-of-service.html](https://www.census.gov/data/developers/about/terms-of-service.html), fetched Oct 25, 2026.)
- **FTC consumer guidance.** The scam red flags are short quotes or paraphrases of FTC consumer-education pages, with links: [Rental listing scams](https://consumer.ftc.gov/articles/rental-listing-scams), [What to do if you were scammed](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed), [ReportFraud.ftc.gov](https://reportfraud.ftc.gov/), and the [Dec 2025 Data Spotlight on rental scams](https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses). Clearlease isn't affiliated with or endorsed by the FTC.
- **State and DC law, and other agencies.** The lease rule summaries in `lib/data/rule-sheets.ts` are our own plain-language paraphrases. Each one cites and links the official text: [Code of Virginia](https://law.lis.virginia.gov/), [D.C. Code](https://code.dccouncil.gov/), [Maryland Code](https://mgaleg.maryland.gov/) and DC Office of the Tenant Advocate pages. Help links point to the DC Office of the Attorney General, the DC Office of the Tenant Advocate, the Maryland Attorney General, Virginia DHCD, Virginia Tech Student Legal Services and legal-aid sites. The research notes in `docs/research/` also cite the Arizona Attorney General. 17 U.S.C. § 105 doesn't cover state or DC works, so we link to these sources and quote them only briefly, with citations. We don't copy them.
- **Sample listings and the lease** in `public/samples/` and the eval items in `scripts/eval/` were written by the team and are fictional. A few are reconstructions of publicly reported cases, labelled as such.

## Services

Clearlease calls these services at runtime under each provider's own terms. None of their code is included here beyond the npm packages listed above: the Gemini API (`@google/genai`), Google Maps JavaScript API and Geocoding (`@vis.gl/react-google-maps`), Google Cloud Firestore (`@google-cloud/firestore`), Secret Manager and Cloud Run.

## Model

Clearlease uses the **Gemma 4** model `gemma-4-26b-a4b-it`, accessed through the Gemini API. No model weights are included in this repository. The model's license is described in [README.md](README.md).
