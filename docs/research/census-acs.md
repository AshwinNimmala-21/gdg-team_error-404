# Census ACS 5-year: median gross rent (B25064_001E)

Researched 2026-10-24. Status tags: **VERIFIED** means I fetched the page or endpoint and saw the content. **UNVERIFIED** means it was inferred, or the fetch failed.

## TL;DR for the build

1. **A key is now required on every request. Keyless calls fail.** VERIFIED. I called `https://api.census.gov/data/2024/acs/acs5?get=NAME,B25064_001E&for=county:11001&in=state:11` with no key and got the "Missing Key" page: *"A valid key must be included with each data API request."* The Census video page (dated May 11, 2026) says: *"The Census Bureau now requires an API key for all queries made to the Census Data Application Programming Interface (API)."* and *"This change affects every user of the Census Data API."* Source: https://www.census.gov/library/video/2026/adrm/requesting-a-census-data-api-key.html
   - The older "500 queries per IP per day without a key" rule (user guide page last revised Oct 8, 2021) is **out of date**. Don't design around keyless access.
2. **The latest 5-year vintage is 2024 (the 2020–2024 ACS 5-year).** VERIFIED. It was released Jan 29, 2026. `https://api.census.gov/data/2025/acs/acs5.html` returns HTTP 404, so 2025 isn't available.
3. **ZCTA queries take no `in=state:` parent.** In the 2024 `geography.json`, the `860` (ZCTA) object has no `requires`, `wildcard` or `optionalWithWCFor` keys. VERIFIED. That `in=state:51` returns an error for ZCTA is UNVERIFIED (I couldn't test it without a key).
4. **Medians are top-coded at $3,500.** VERIFIED in B25031 for ZCTA 22201: the estimate is `"3501"`, the annotation `EA` is `"3,500+"`, and the MOE is `"-333333333"`. Treat `3501` as "≥ $3,500", not as an exact value.
5. **Recommendation (our design choice):** bake the values below into a static TS data file (for example `src/data/acsMedianRent.ts`) and use the live API only as an optional refresh with `CENSUS_KEY`. The demo then has no runtime dependency on a key or the network.

---

## 1. Endpoint, vintage, variable

| Item | Value | Status | Source |
|---|---|---|---|
| Base URL | `https://api.census.gov/data/2024/acs/acs5` | VERIFIED | https://api.census.gov/data/2024/acs/acs5.html |
| Dataset title | "ACS 5-Year Detailed Tables", vintage 2024 | VERIFIED | same |
| Release | 2020–2024 ACS 5-year, public release **Jan 29, 2026** | VERIFIED | https://www.census.gov/programs-surveys/acs/news/updates/2026.html ("On January 29, the U.S. Census Bureau released the 2020-2024 American Community Survey (ACS) 5-Year estimates"); https://www.census.gov/newsroom/press-releases/2026/embargo-acs-5-year-estimates.html |
| 2025 5-year | `https://api.census.gov/data/2025/acs/acs5.html` returns **HTTP 404** as of 2026-10-24 | VERIFIED | fetched |
| 2025 ACS 1-year | "scheduled for Thursday, October 29, 2026." (1-year doesn't cover ZCTAs or small counties, so it's not useful here) | VERIFIED | https://www.census.gov/programs-surveys/acs/news/updates/2026.html |
| Release date for the 2021–2025 5-year | Not stated on the 2026 updates page | UNVERIFIED | — |

Variable metadata, verbatim from `https://api.census.gov/data/2024/acs/acs5/variables/B25064_001E.json` (VERIFIED):

```json
{
  "name": "B25064_001E",
  "label": "Estimate!!Median gross rent",
  "concept": "Median Gross Rent (Dollars)",
  "predicateType": "int",
  "group": "B25064",
  "limit": 0,
  "attributes": "B25064_001EA,B25064_001M,B25064_001MA"
}
```

So each estimate comes with these related columns:
- `B25064_001M` is the margin of error (90%)
- `B25064_001EA` is the estimate annotation
- `B25064_001MA` is the MOE annotation

### Optional: rent by bedroom count (B25031), for a fairer like-for-like comparison

Group B25031, concept "Median Gross Rent by Bedrooms". Labels below are from `https://api.census.gov/data/2024/acs/acs5/variables/<VAR>.json`:

| Var | Label | Status |
|---|---|---|
| `B25031_001E` | median gross rent, total (same as B25064_001E: 2550 for 22201) | VERIFIED (value matches) |
| `B25031_002E` | "Estimate!!Median gross rent --!!Total:!!No bedroom" | VERIFIED |
| `B25031_003E` | "Estimate!!Median gross rent --!!Total:!!1 bedroom" | VERIFIED |
| `B25031_004E` | "Estimate!!Median gross rent --!!Total:!!2 bedrooms" | VERIFIED |
| `B25031_005E` | 3 bedrooms | UNVERIFIED (inferred from the sequence) |
| `B25031_006E` | 4 bedrooms | UNVERIFIED (inferred from the sequence) |
| `B25031_007E` | "Estimate!!Median gross rent --!!Total:!!5 or more bedrooms" | VERIFIED |

ZCTA 22201 values from B25031 (VERIFIED, via `https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25031&g=860XX00US22201`):

| Bedrooms | Estimate | MOE | EA |
|---|---|---|---|
| Studio | 2116 | 127 | null |
| 1 bedroom | 2389 | 64 | null |
| 2 bedrooms | 3022 | 133 | null |
| 3 bedrooms | 3443 | 782 | null |
| 4 bedrooms | 3501 | -333333333 | "3,500+" |
| 5 or more bedrooms | 3501 | -333333333 | "3,500+" |

**Gross rent vs. asking rent.** The Census definition is: *"Gross rent is the contract rent plus the estimated average monthly cost of utilities and fuels, if these are paid by the renter"*. This is UNVERIFIED: I saw it only in census.gov search snippets (https://www.census.gov/quickfacts/fact/note/US/HSG860221 and the ACS Subject Definitions PDFs) and didn't fetch the page. The implication is that a listing's asking rent, which usually excludes utilities, will tend to look *lower* than the ACS median gross rent. That biases the comparison toward false "too cheap" flags, so keep the threshold conservative (see `ftc-red-flags.md`).

---

## 2. Query syntax

### ZCTA (geo level 860)

From the 2024 `geography.json` (VERIFIED, https://api.census.gov/data/2024/acs/acs5/geography.json):
- `name: zip code tabulation area`, `geoLevelDisplay: 860`, `referenceDate: 2024-01-01`
- **no** `requires`, `wildcard` or `optionalWithWCFor` keys
- the geography.html hierarchy shows just "zip code tabulation area", with no state parent

Census's own example, verbatim from https://api.census.gov/data/2024/acs/acs5/examples.html (VERIFIED):

```
https://api.census.gov/data/2024/acs/acs5?get=NAME,B01001_001E&for=zip%20code%20tabulation%20area:*&key=YOUR_KEY_GOES_HERE
```

The second example on that page uses `zip%20code%20tabulation%20area:77494`. VERIFIED (paraphrased: the fetch tool truncated the quote by one character).

Our query:

```
GET https://api.census.gov/data/2024/acs/acs5?get=NAME,B25064_001E,B25064_001M&for=zip%20code%20tabulation%20area:22201&key=${CENSUS_KEY}
```

Several ZCTAs in one call, comma-separated. This is standard API syntax but UNVERIFIED here, because I had no key to test it:

```
...&for=zip%20code%20tabulation%20area:22201,22202,22203,22204,20001,20009,20740,24060&key=${CENSUS_KEY}
```

- **Don't add `in=state:XX` for ZCTA in the 2024 vintage.** The geography metadata defines no parent for 860. (Before 2020, ACS vintages had a `state› zip code tabulation area` level; that's background knowledge, UNVERIFIED.)
- **Alternative `ucgid` predicate.** Census's own data.census.gov backend generates this URL (VERIFIED, from the `dataAPIURI` field it returned): `https://api.census.gov/data/2024/acs/acs5?get=group(B25064)&ucgid=860Z200US22201`. The ZCTA GEO_ID format is `860Z200US<5-digit ZCTA>`.

### County (geo level 050)

From the 2024 `geography.json` (VERIFIED): `name: county`, `geoLevelDisplay: 050`, `requires: state`, `wildcard: state`, `optionalWithWCFor: state`. The hierarchy is "state› county".

Census examples, verbatim from examples.html (VERIFIED):

```
https://api.census.gov/data/2024/acs/acs5?get=NAME,B01001_001E&for=county:037&in=state:06&key=YOUR_KEY_GOES_HERE
https://api.census.gov/data/2024/acs/acs5?get=NAME,B01001_001E&for=county:*&in=state:*&key=YOUR_KEY_GOES_HERE
https://api.census.gov/data/2024/acs/acs5?get=NAME,B01001_001E&for=county:*&key=YOUR_KEY_GOES_HERE
```

Our queries (3-digit county code in `for`, 2-digit state FIPS in `in`):

```
https://api.census.gov/data/2024/acs/acs5?get=NAME,B25064_001E,B25064_001M&for=county:001&in=state:11&key=${CENSUS_KEY}
https://api.census.gov/data/2024/acs/acs5?get=NAME,B25064_001E,B25064_001M&for=county:013,510,059,600,610,107,153,121&in=state:51&key=${CENSUS_KEY}
https://api.census.gov/data/2024/acs/acs5?get=NAME,B25064_001E,B25064_001M&for=county:031,033,027,003,510,021&in=state:24&key=${CENSUS_KEY}
```

A comma-separated county list is standard syntax but UNVERIFIED here (no key). The county GEO_ID format is `0500000US<5-digit FIPS>` (VERIFIED from responses). Independent cities (VA 510/600/610, MD Baltimore 510) are county-equivalents at level 050 (VERIFIED: they returned at 050 with names like "Alexandria city, Virginia").

### The `key` parameter

- Append it as `&key=<KEY>` in the query string. The examples.html URLs end in `&key=YOUR_KEY_GOES_HERE` (VERIFIED). There's no auth header.
- Signup: `https://api.census.gov/data/key_signup.html` (VERIFIED: the page is "Request a U.S. Census Data API Key" with a terms-of-service checkbox). The key arrives by email.
- **Security note:** the key travels in the URL. Call Census only from the server (a Next.js route handler or server action) and never ship `CENSUS_KEY` to the client. Leave the full URL out of logs.

### Rate limits

| Claim | Status | Source |
|---|---|---|
| *"You can include up to 50 variables in a single API query and can make up to 500 queries per IP address per day."* and *"More than 500 queries per IP address per day requires that you register for a Census key."* | VERIFIED as text, but **out of date**: the page is "Last Revised - October 8, 2021" and a key is now mandatory | https://www.census.gov/data/developers/guidance/api-user-guide/query-components.html |
| Keyless limit today | **Zero.** Keyless requests get the "Missing Key" page | VERIFIED (live fetch, 2026-10-24) |
| Daily or rate limit *with* a key | Not stated on any page I could read. The May 21, 2026 User Guide PDF (https://www2.census.gov/data/api-documentation/api-user-guide.pdf) wouldn't parse | **UNVERIFIED** |
| 50 variables per query | VERIFIED (same 2021 page). Our query uses 3–4, so it's not a concern | as above |

### Errors

| Case | What happens | Status |
|---|---|---|
| Missing key | HTML page titled "Missing Key": *"A valid key must be included with each data API request."* / *"If you don't have one, request an API Key here."* It links to `key_signup.html`. Canonical page: https://api.census.gov/data/missing_key.html | VERIFIED (content). **HTTP status code UNVERIFIED** (the fetch tool doesn't expose it; it may be a 200 or a redirect). Detect it by `Content-Type` not being `application/json`, or by the body starting with `<` |
| Invalid key | Not tested (no key available) | UNVERIFIED. Expect an HTML "Invalid Key" page. Handle it the same way as a missing key |
| Unknown geography or variable | Not tested | UNVERIFIED. Census usually returns HTTP 400 or 204 with a plain-text error. Handle it generically: if the response isn't a JSON array of arrays, treat it as "no data" |

Suggested client guard (design choice): `res.ok && res.headers.get('content-type')?.includes('json')`, then `JSON.parse` the body and check that it is a `string[][]` with at least 2 rows.

---

## 3. Response shape

### api.census.gov (with key)

The documented shape is VERIFIED from the 2021 user guide: *"The results from your Census Data API data queries will return in JavaScript Object Notation (JSON) format,"* and *"Data are represented in a two-dimensional array"*. In the guide's example, the first row is the column names. The exact shape below for our query is UNVERIFIED, since I couldn't call it without a key; it follows the standard Census layout of header row first, then the geography columns appended last:

```json
[
  ["NAME","B25064_001E","B25064_001M","zip code tabulation area"],
  ["ZCTA5 22201","2550","54","22201"]
]
```

```json
[
  ["NAME","B25064_001E","B25064_001M","state","county"],
  ["Arlington County, Virginia","2322","26","51","013"]
]
```

- **All values are strings**, numbers included (`"2550"`). Parse them with `Number()`.
- Annotation columns (`..._EA`, `..._MA`) can be JSON `null`.

### data.census.gov backend (keyless, used here to fetch the values; VERIFIED)

`GET https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25064&g=860XX00US22201` returned this (VERIFIED):

```json
{
  "response": {
    "data": [
      ["GEO_ID","B25064_001MA","B25064_001E","B25064_001EA","B25064_001M","NAME"],
      ["860Z200US22201",null,"2550",null,"54","ZCTA5 22201"]
    ],
    "dataAPIURI": "https://api.census.gov/data/2024/acs/acs5?get=group(B25064)&ucgid=860Z200US22201",
    "objectId": "ACSDT5Y2024.B25064",
    "tableName": "B25064",
    "metadataAPIURI": "https://api.census.gov/data/2024/acs/acs5"
  }
}
```

Notes:
- The column order is **not** stable (B25031 came back in shuffled order). Always look columns up by name from the header row, never by index.
- The `g=` parameter takes one geography: `860XX00US<zcta>` or `050XX00US<fips5>`. A comma-separated list of 8 ZCTAs returned an empty body (VERIFIED).
- This is the undocumented internal backend of data.census.gov, not the public API. **Don't depend on it in production.** It may change or be rate-limited without notice. I used it only to collect the values below.

---

## 4. Null and sentinel values

Source: https://www.census.gov/data/developers/data-sets/acs-1year/notes-on-acs-estimate-and-annotation-values.html (VERIFIED). The page sits under the 1-year section, but the -666666666 entry explicitly mentions 5-year medians: *"For a 5-year median estimate, the margin of error associated with a median was larger than the median itself."*

| Estimate value | Annotation | Meaning (verbatim, may be truncated) | Our handling (design choice) |
|---|---|---|---|
| `-666666666` | `-` | "The estimate could not be computed because there were an insufficient number of sample observations." | Treat as `null` (no market data) |
| `-999999999` | `N` | "The estimate or margin of error cannot be displayed because there were an insufficient number of sample cases" | `null` |
| `-888888888` | `(X)` | "The estimate or margin of error is not applicable or not available." | `null` |
| varies | `median-` | "The median falls in the lowest interval of an open-ended distribution" | Use as an upper bound; skip the "too cheap" rule |
| varies | `median+` | "The median falls in the highest interval of an open-ended distribution" | Use as a lower bound (≥) |
| `-222222222` (MOE) | `**` | "The margin of error could not be computed because there were an insufficient number of sample observations." | Ignore the MOE |
| `-333333333` (MOE) | `***` | "The margin of error could not be computed because the median falls in the lowest interval" (continues: or upper interval of an open-ended distribution) | Ignore the MOE; check the EA for top or bottom coding |
| `-555555555` (MOE) | `*****` | "A margin of error is not appropriate because the corresponding estimate is controlled to an independent population" | Ignore the MOE |
| `null` | — | "A null value in the estimate means there is no data available for the requested geography." | `null` |

**Top-coding, observed** (VERIFIED, B25031 for ZCTA 22201): estimate `"3501"`, EA `"3,500+"`, MOE `"-333333333"`, MA `"***"`. Rule: if `EA` is non-null, or the estimate is `3501`, treat it as "≥ $3,500" and don't run a "rent X% below median" comparison against it. Parse rule: `n = Number(v); if (!Number.isFinite(n) || n < 0) return null;`, which covers every negative sentinel.

**ZCTA ≠ ZIP code.** ZCTAs approximate USPS ZIP codes. PO-box-only or single-building ZIPs may have no ZCTA, in which case we fall back to the county. Our design choice: ZIP → ZCTA, then county, then HUD FMR.

---

## 5. Actual values: ACS 2020–2024 5-year, B25064_001E (median gross rent, USD/month)

**How fetched:** all VERIFIED on 2026-10-24 via `https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25064&g=<GEO>`, one request per geography. The canonical public-API equivalent (needs a key) is `https://api.census.gov/data/2024/acs/acs5?get=group(B25064)&ucgid=<GEO_ID>`. Every row came back with `B25064_001EA = null` and `B25064_001MA = null`, so none is top-coded or suppressed.

### Counties

| FIPS | NAME (verbatim) | GEO_ID | B25064_001E | B25064_001M | Query `g=` |
|---|---|---|---|---|---|
| 11001 | District of Columbia, District of Columbia | 0500000US11001 | 1954 | 26 | 050XX00US11001 |
| 51013 | Arlington County, Virginia | 0500000US51013 | 2322 | 26 | 050XX00US51013 |
| 51510 | Alexandria city, Virginia | 0500000US51510 | 2089 | 32 | 050XX00US51510 |
| 51059 | Fairfax County, Virginia | 0500000US51059 | 2276 | 15 | 050XX00US51059 |
| 51600 | Fairfax city, Virginia | 0500000US51600 | 2245 | 107 | 050XX00US51600 |
| 51610 | Falls Church city, Virginia | 0500000US51610 | 2190 | 104 | 050XX00US51610 |
| 51107 | Loudoun County, Virginia | 0500000US51107 | 2386 | 44 | 050XX00US51107 |
| 51153 | Prince William County, Virginia | 0500000US51153 | 2067 | 34 | 050XX00US51153 |
| 51121 | Montgomery County, Virginia | 0500000US51121 | 1240 | 48 | 050XX00US51121 |
| 24031 | Montgomery County, Maryland | 0500000US24031 | 2068 | 20 | 050XX00US24031 |
| 24033 | Prince George's County, Maryland | 0500000US24033 | 1799 | 14 | 050XX00US24033 |
| 24027 | Howard County, Maryland | 0500000US24027 | 2099 | 33 | 050XX00US24027 |
| 24003 | Anne Arundel County, Maryland | 0500000US24003 | 2071 | 29 | 050XX00US24003 |
| 24510 | Baltimore city, Maryland | 0500000US24510 | 1331 | 15 | 050XX00US24510 |
| 24021 | Frederick County, Maryland | 0500000US24021 | 1774 | 37 | 050XX00US24021 |

### ZCTAs

| ZCTA | NAME (verbatim) | GEO_ID | B25064_001E | B25064_001M | Query `g=` |
|---|---|---|---|---|---|
| 22201 | ZCTA5 22201 | 860Z200US22201 | 2550 | 54 | 860XX00US22201 |
| 22202 | ZCTA5 22202 | 860Z200US22202 | 2484 | 63 | 860XX00US22202 |
| 22203 | ZCTA5 22203 | 860Z200US22203 | 2416 | 68 | 860XX00US22203 |
| 22204 | ZCTA5 22204 | 860Z200US22204 | 1894 | 42 | 860XX00US22204 |
| 20001 | ZCTA5 20001 | 860Z200US20001 | 2499 | 103 | 860XX00US20001 |
| 20009 | ZCTA5 20009 | 860Z200US20009 | 2341 | 59 | 860XX00US20009 |
| 20740 | ZCTA5 20740 | 860Z200US20740 | 1839 | 105 | 860XX00US20740 |
| 24060 | ZCTA5 24060 | 860Z200US24060 | 1314 | 61 | 860XX00US24060 |

Ready-to-paste TS literal (values exactly as above):

```ts
// Source: ACS 2020-2024 5-year, B25064_001E (median gross rent), fetched 2026-10-24.
// https://api.census.gov/data/2024/acs/acs5?get=group(B25064)&ucgid=<GEO_ID>
export const ACS_VINTAGE = "2020-2024 ACS 5-year" as const;
export const ACS_MEDIAN_GROSS_RENT_BY_COUNTY: Record<string, { name: string; median: number; moe: number }> = {
  "11001": { name: "District of Columbia, District of Columbia", median: 1954, moe: 26 },
  "51013": { name: "Arlington County, Virginia", median: 2322, moe: 26 },
  "51510": { name: "Alexandria city, Virginia", median: 2089, moe: 32 },
  "51059": { name: "Fairfax County, Virginia", median: 2276, moe: 15 },
  "51600": { name: "Fairfax city, Virginia", median: 2245, moe: 107 },
  "51610": { name: "Falls Church city, Virginia", median: 2190, moe: 104 },
  "51107": { name: "Loudoun County, Virginia", median: 2386, moe: 44 },
  "51153": { name: "Prince William County, Virginia", median: 2067, moe: 34 },
  "51121": { name: "Montgomery County, Virginia", median: 1240, moe: 48 },
  "24031": { name: "Montgomery County, Maryland", median: 2068, moe: 20 },
  "24033": { name: "Prince George's County, Maryland", median: 1799, moe: 14 },
  "24027": { name: "Howard County, Maryland", median: 2099, moe: 33 },
  "24003": { name: "Anne Arundel County, Maryland", median: 2071, moe: 29 },
  "24510": { name: "Baltimore city, Maryland", median: 1331, moe: 15 },
  "24021": { name: "Frederick County, Maryland", median: 1774, moe: 37 },
};
export const ACS_MEDIAN_GROSS_RENT_BY_ZCTA: Record<string, { median: number; moe: number }> = {
  "22201": { median: 2550, moe: 54 },
  "22202": { median: 2484, moe: 63 },
  "22203": { median: 2416, moe: 68 },
  "22204": { median: 1894, moe: 42 },
  "20001": { median: 2499, moe: 103 },
  "20009": { median: 2341, moe: 59 },
  "20740": { median: 1839, moe: 105 },
  "24060": { median: 1314, moe: 61 },
};
```

Sanity cross-check: the DC county value of $1,954 is plausibly below the brief's DC *metro* figure of $2,027 (`docs/brief/research-facts.md`, USAFacts, secondary). They're different geographies, so this isn't a contradiction.

## Sources

- https://api.census.gov/data/2024/acs/acs5.html
- https://api.census.gov/data/2024/acs/acs5/geography.json and https://api.census.gov/data/2024/acs/acs5/geography.html
- https://api.census.gov/data/2024/acs/acs5/examples.html
- https://api.census.gov/data/2024/acs/acs5/variables/B25064_001E.json
- https://api.census.gov/data/2024/acs/acs5/variables/B25031_002E.json (also 003E, 004E, 007E)
- https://api.census.gov/data/missing_key.html
- https://api.census.gov/data/key_signup.html
- https://www.census.gov/library/video/2026/adrm/requesting-a-census-data-api-key.html
- https://www.census.gov/data/developers/guidance/api-user-guide/query-components.html
- https://www.census.gov/data/developers/data-sets/acs-1year/notes-on-acs-estimate-and-annotation-values.html
- https://www.census.gov/programs-surveys/acs/news/updates/2026.html
- https://www.census.gov/newsroom/press-releases/2026/embargo-acs-5-year-estimates.html
- https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25064&g=… (values)
