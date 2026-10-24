// Saved Census ACS 2020–2024 5-year, B25064_001E (median gross rent, all unit sizes), fetched 2026-10-24.
// Source and caveats: docs/research/census-acs.md. Gross rent includes utilities the renter pays.

export const ACS_VINTAGE = "2020–2024 ACS 5-year";

export const CENSUS_SOURCE = {
  name: `Census ${ACS_VINTAGE}, median gross rent (B25064)`,
  url: "https://api.census.gov/data/2024/acs/acs5/variables/B25064_001E.json",
};

export const ACS_MEDIAN_GROSS_RENT_BY_COUNTY: Record<string, { name: string; median: number; moe: number }> = {
  "11001": { name: "District of Columbia", median: 1954, moe: 26 },
  "51013": { name: "Arlington County, VA", median: 2322, moe: 26 },
  "51510": { name: "Alexandria city, VA", median: 2089, moe: 32 },
  "51059": { name: "Fairfax County, VA", median: 2276, moe: 15 },
  "51600": { name: "Fairfax city, VA", median: 2245, moe: 107 },
  "51610": { name: "Falls Church city, VA", median: 2190, moe: 104 },
  "51107": { name: "Loudoun County, VA", median: 2386, moe: 44 },
  "51153": { name: "Prince William County, VA", median: 2067, moe: 34 },
  "51121": { name: "Montgomery County, VA", median: 1240, moe: 48 },
  "24031": { name: "Montgomery County, MD", median: 2068, moe: 20 },
  "24033": { name: "Prince George's County, MD", median: 1799, moe: 14 },
  "24027": { name: "Howard County, MD", median: 2099, moe: 33 },
  "24003": { name: "Anne Arundel County, MD", median: 2071, moe: 29 },
  "24510": { name: "Baltimore city, MD", median: 1331, moe: 15 },
  "24021": { name: "Frederick County, MD", median: 1774, moe: 37 },
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

/** Census returns negative sentinels (-666666666 etc.) for missing data; 3501 means "≥ $3,500". */
export function parseAcsValue(v: unknown): { value: number; topCoded: boolean } | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return { value: n, topCoded: n >= 3501 };
}
