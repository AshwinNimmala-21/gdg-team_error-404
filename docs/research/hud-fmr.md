# HUD Fair Market Rent (FMR) API: research notes

Checked 2026-10-24. Tags: **VERIFIED** means I fetched the source or ran the call and saw the result. **UNVERIFIED** means the claim is inferred, comes from a secondary source, or the fetch failed.

> **Access caveat.** Every `huduser.gov/portal/...` page (API docs, FMR schedule PDFs, the FMR documentation system) answers non-browser clients with an AWS WAF JavaScript challenge (`HTTP 202`, `x-amzn-waf-action: challenge`, empty body). I could not read HUD's own doc page directly. The API host `www.huduser.gov/hudapi/public/...` is **not** behind the challenge; it returns JSON. Field names below come from search-engine extracts of the HUD doc page, a secondary parser, and live unauthenticated probes. **Before coding, run one authenticated call (with `HUD_TOKEN`) and save the raw JSON as a test fixture.**

## 1. Current fiscal year: FY2027 (not FY2026)

- **VERIFIED.** FY2027 FMRs took effect on 2026-10-01. Federal Register Vol. 91, No. 168, Sept. 1, 2026, Docket FR-6553-N-03: *"Effective Date of FY 2027 FMRs: October 1, 2026, unless HUD receives a valid request for reevaluation of specific area FMRs as described below."* https://www.govinfo.gov/content/pkg/FR-2026-09-01/pdf/2026-17891.pdf
- **VERIFIED** (same notice): *"The methodology for calculating SAFMRs is unchanged from FY 2026."*
- **VERIFIED** (same notice): the Washington metro is a mandatory Small Area FMR (SAFMR) area. Its boundary changed in FY2026: *"Calvert County, MD was removed from the Washington-ArlingtonAlexandria, DC-VA-MD HUD Metro FMR Area … PHAs in all these areas are required to use Small Area FMRs in determining payment standards."*
- **Build impact:** label all static fallback data "FY2027". Call the API with no `year` so it returns the current year.

## 2. Endpoints

Base URL: `https://www.huduser.gov/hudapi/public/fmr`

| Purpose | Method and path | Status |
|---|---|---|
| FMR for one county, town or metro | `GET /fmr/data/{entityid}` with optional `?year=YYYY` | VERIFIED: path exists and returns 401 without a token |
| All FMRs in a state | `GET /fmr/statedata/{statecode}` (e.g. `VA`) | VERIFIED via secondary OpenAPI listing (apievangelist); not probed |
| Counties in a state, with entity IDs | `GET /fmr/listCounties/{statecode}` (e.g. `VA`) | VERIFIED: returns 401 without a token. The response field names are UNVERIFIED |
| List of metro areas | `GET /fmr/listMetroAreas` | Path from a search extract of the HUD docs. The extract gives the fields `cbsa_code`, `area_name` and `category` (`"MetroArea"`). UNVERIFIED |
| List of states | `GET /fmr/listStates` | UNVERIFIED (from the docs table of contents) |

- **Default year.** A secondary parser (sgarcese/federal-mcps PR #246) says one call *"with no ?year (HUD's current fiscal year)"* returns the current FY. https://github.com/sgarcese/federal-mcps/pull/246 (secondary; UNVERIFIED)
- **Token sign-up:** https://www.huduser.gov/hudapi/public/register (VERIFIED in secondary sources; the page itself sits behind the WAF).

## 3. Auth, rate limits, errors

- **Auth header:** `Authorization: Bearer <HUD_TOKEN>`. VERIFIED: the OpenAPI listing names `bearerAuth`, and a request with no token gets 401.
- **Rate limit:** **60 requests per window.** VERIFIED from live response headers:
  ```
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json
  X-RateLimit-Limit: 60
  X-RateLimit-Remaining: 59
  ```
  The window length is not stated, and no `Retry-After` header appeared on the 401. My guess is 60 per minute (Laravel-style default), which is **UNVERIFIED**. Cache responses per entity: FMRs change once a year.
- **Error body with no or invalid token.** VERIFIED (live, both cases):
  ```json
  {"error":"Unauthenticated"}
  ```
- **Other codes:** the OpenAPI listing shows `200`, `401` and `404` for `/fmr/data/{entityid}`. A secondary parser treats `400` and `404` as "no data for that year". The exact 404 body is UNVERIFIED.

## 4. Response shape for `/fmr/data/{entityid}`

Field names come from the HUD doc page (via search extract) and the rhud R package docs, which list: *"county_name, counties_msa, town_name, metro_status, metro_name, smallarea_status, basicdata, Efficiency, One-Bedroom, Two-Bedroom, Three-Bedroom, Four-Bedroom, and year"*. https://etam4260.github.io/rhud/reference/hud_fmr.html (secondary; the field list is VERIFIED there.)

From the HUD doc extract (UNVERIFIED wording):
- `smallarea_status` is a string: `"1"` means a Small Area FMR area, `"0"` means not.
- `metro_status` is `"1"` when the area is in a metro, and then `metro_name` holds the metro name.
- `basicdata` is **an object** for non-SAFMR areas and **an array of ZIP rows** for SAFMR areas. In the array, the first row has `zip_code: "MSA level"`. HUD's doc note says *"MSA level"* "provides MSA-level data for regions utilizing Small Area FMRs".
- Bedroom values can be **strings or numbers** depending on the endpoint and example, so parse defensively with `Number(x)`.

**Shape A: non-SAFMR county** (e.g. Montgomery County VA, 5112199999). Reconstructed; UNVERIFIED.
```json
{
  "data": {
    "county_name": "Montgomery County",
    "counties_msa": "...",
    "town_name": "",
    "metro_status": "1",
    "metro_name": "Blacksburg-Christiansburg-Radford, VA MSA",
    "area_name": "...",
    "smallarea_status": "0",
    "basicdata": {
      "Efficiency": 1043,
      "One-Bedroom": 1050,
      "Two-Bedroom": 1340,
      "Three-Bedroom": 1783,
      "Four-Bedroom": 2048,
      "year": "2027"
    }
  }
}
```

**Shape B: SAFMR county or metro** (DC, Arlington, Montgomery MD, and others in the Washington HUD Metro FMR Area). Reconstructed; UNVERIFIED.
```json
{
  "data": {
    "county_name": "District of Columbia",
    "metro_status": "1",
    "metro_name": "Washington-Arlington-Alexandria, DC-VA-MD HUD Metro FMR Area",
    "smallarea_status": "1",
    "basicdata": [
      { "zip_code": "MSA level", "Efficiency": 2111, "One-Bedroom": 2204, "Two-Bedroom": 2438, "Three-Bedroom": 3107, "Four-Bedroom": 3658, "year": "2027" },
      { "zip_code": "20001", "Efficiency": 0, "One-Bedroom": 0, "Two-Bedroom": 0, "Three-Bedroom": 0, "Four-Bedroom": 0, "year": "2027" }
    ]
  }
}
```
(The dollar values in the ZIP row are placeholders. Get real ones from a live call.)

**Recommended TypeScript parse.** If `smallarea_status === "1"` and `basicdata` is an array, look for the row whose `zip_code` equals the listing ZIP. If there is no match, use the row where `zip_code === "MSA level"`. Otherwise treat `basicdata` as a single object.

## 5. Entity IDs (county FIPS + `99999`)

VERIFIED: the FIPS-to-name mapping was confirmed by a Census Reporter API response for the same geoids (`05000US{FIPS}`). VERIFIED: the "+99999" county format is stated in the rhud docs (*"5 digit FIPS code + 99999 at end"*).

| Jurisdiction | FIPS | HUD entityid | FMR area (FY2027) | SAFMR? |
|---|---|---|---|---|
| District of Columbia | 11001 | `1100199999` | Washington-Arlington-Alexandria HMFA | Yes (mandatory) |
| Arlington County, VA | 51013 | `5101399999` | Washington HMFA | Yes |
| Alexandria city, VA | 51510 | `5151099999` | Washington HMFA | Yes |
| Fairfax County, VA | 51059 | `5105999999` | Washington HMFA | Yes |
| Fairfax city, VA | 51600 | `5160099999` | Washington HMFA | Yes |
| Falls Church city, VA | 51610 | `5161099999` | Washington HMFA | Yes |
| Loudoun County, VA | 51107 | `5110799999` | Washington HMFA | Yes |
| Prince William County, VA | 51153 | `5115399999` | Washington HMFA | Yes |
| Manassas city, VA | 51683 | `5168399999` | Washington HMFA | Yes |
| Montgomery County, VA (Blacksburg) | 51121 | `5112199999` | Blacksburg-Christiansburg-Radford, VA | No (UNVERIFIED) |
| Montgomery County, MD | 24031 | `2403199999` | Washington HMFA | Yes |
| Prince George's County, MD (College Park) | 24033 | `2403399999` | Washington HMFA | Yes |
| Frederick County, MD | 24021 | `2402199999` | Washington HMFA | Yes |
| Howard County, MD | 24027 | `2402799999` | Baltimore-Columbia-Towson, MD | No (secondary source) |
| Anne Arundel County, MD | 24003 | `2400399999` | Baltimore-Columbia-Towson, MD | No (secondary source) |
| Baltimore city, MD | 24510 | `2451099999` | Baltimore-Columbia-Towson, MD | No (secondary source) |

Metro entity IDs:
- Washington: `METRO47900M47900`. VERIFIED: it appears in HUD SAFMR calculation URLs (`metro_code=METRO47900M47900`) in search results and in the DC DHS page links.
- Baltimore `METRO12580M12580` and Blacksburg `METRO13980M13980` follow the CBSA pattern but are **UNVERIFIED**. Confirm them with `/fmr/listMetroAreas`.
- Note: Manassas Park city (51685) is also in the Washington HMFA if it is ever needed.

Area assignments for VA and MD are secondary: VoucherMatch FY2027 tables, https://vouchermatch.com/blog/section-8-rent-limits-virginia-2026-by-county and https://vouchermatch.com/blog/section-8-rent-limits-maryland-2026-by-county. The Washington SAFMR status is VERIFIED by the Federal Register notice above.

## 6. Static fallback values: FY2027 metro-level FMR (0 to 4 BR)

**Secondary source; UNVERIFIED against HUD's own schedule,** because the HUD PDF https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY2027_FMR_Schedule.pdf is behind the WAF. Source: VoucherMatch (citing HUD's FY2027 dataset, published 2026-10-01). A search-engine extract of HUD's FY2027 schedule PDF reported the same Washington numbers.

| FMR area | 0BR | 1BR | 2BR | 3BR | 4BR |
|---|---|---|---|---|---|
| Washington-Arlington-Alexandria, DC-VA-MD HMFA (metro-wide / "MSA level") | 2,111 | 2,204 | 2,438 | 3,107 | 3,658 |
| Baltimore-Columbia-Towson, MD MSA | 1,523 | 1,625 | 2,006 | 2,509 | 2,789 |
| Blacksburg-Christiansburg-Radford, VA (Montgomery Co. VA) | 1,043 | 1,050 | 1,340 | 1,783 | 2,048 |

- In the Washington HMFA every county shares the same metro-wide row. In SAFMR areas the ZIP-level value is what HUD actually uses, and it varies a lot by ZIP. Show the metro row as a fallback only, with a "metro-wide" label.
- FY2026 Washington metro values from a search extract (secondary, UNVERIFIED): 1,953 / 2,015 / 2,246 / 2,835 / 3,332.

### Reference: DC ZIP-level SAFMRs (FY2026, superseded)

VERIFIED from the DC DHS page, which reproduces HUD's table *"Washington-Arlington-Alexandria, DC-VA-MD HUD Metro FMR Area Small Area FMRs By Unit Bedrooms"*. The page's HUD links use `FY2026_code`, so these are **FY2026** values and are superseded as of 2026-10-01. https://dhs.dc.gov/page/monthly-income-limits-fair-market-rent

| ZIP | 0BR | 1BR | 2BR | 3BR | 4BR |
|---|---|---|---|---|---|
| 20001 | 2,730 | 2,820 | 3,140 | 3,960 | 4,660 |
| 20002 | 2,160 | 2,220 | 2,480 | 3,130 | 3,680 |
| 20003 | 2,930 | 3,020 | 3,370 | 4,250 | 5,000 |
| 20009 | 2,930 | 3,020 | 3,370 | 4,250 | 5,000 |
| 20010 | 2,060 | 2,130 | 2,370 | 2,990 | 3,520 |
| 20018 | 1,300 | 1,340 | 1,490 | 1,880 | 2,210 |
| 20019 | 1,400 | 1,440 | 1,610 | 2,030 | 2,390 |
| 20032 | 1,410 | 1,450 | 1,620 | 2,040 | 2,400 |
| 20036 | 2,260 | 2,330 | 2,600 | 3,280 | 3,860 |

A third-party site lists ZIP 20009 FY2026 2BR at $3,660 (https://www.checkmyvoucher.com/es/section-8-fmr/20009), which conflicts with DC DHS's $3,370. That figure may be FY2027 or revised; UNVERIFIED.

**I did not obtain FY2027 ZIP-level SAFMRs** for 22201, 22202, 22203, 22204, 20001, 20009 or 20740. Get them from a live API call against `METRO47900M47900` and commit the output as fixture data.

## 7. Methodology notes (for the UI's "why" copy)

- VERIFIED (FY2027 notice): SAFMR stability uses 3 years of ACS data. *"For example, for FY 2027 Small Area FMRs, HUD averages the gross rents from 2022, 2023, and 2024 5-Year ACS estimates."*
- FMRs are set at about the 40th percentile of gross rent (rent plus utilities), not the median. Our price check should therefore describe FMR as "HUD's benchmark for a modest unit", not "average rent". (The 40th-percentile fact is from the notice's methodology text. I did not extract the exact sentence; treat it as UNVERIFIED wording.)
