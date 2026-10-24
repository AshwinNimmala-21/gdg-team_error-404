import { parseAcsValue } from "./acs";
import { fmrForBedrooms } from "./fmr";

// Optional live lookups. Each one has a short timeout and returns null on any problem, so the
// caller falls back to the saved figures. Results are cached in memory (FMRs change once a year).

const TIMEOUT_MS = 3000;
const TTL_MS = 12 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, load: () => Promise<T | null>): Promise<T | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T | null;
  const value = await load();
  // Cache misses briefly too, so a down API doesn't add 3 s to every request.
  cache.set(key, { at: value === null ? Date.now() - TTL_MS + 5 * 60 * 1000 : Date.now(), value });
  return value;
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok || !res.headers.get("content-type")?.includes("json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type BedroomRow = Record<string, unknown>;
const BR_KEYS = ["Efficiency", "One-Bedroom", "Two-Bedroom", "Three-Bedroom", "Four-Bedroom"] as const;

function rowToRents(row: BedroomRow): number[] | null {
  const rents = BR_KEYS.map((k) => Number(row[k]));
  return rents.every((n) => Number.isFinite(n) && n > 0) ? rents : null;
}

export interface LiveFmr {
  amount: number;
  level: "zip" | "county" | "metro";
  year: string;
}

/** HUD FMR for a ZIP, from the county entity (or metro entity) — ZIP row if HUD publishes Small Area FMRs. */
export async function liveFmr(opts: { zip: string; countyFips: string | null; metroEntityId: string; bedrooms: number }): Promise<LiveFmr | null> {
  const token = process.env.HUD_TOKEN?.trim();
  if (!token) return null;
  const entity = opts.countyFips ? `${opts.countyFips}99999` : opts.metroEntityId;
  const data = await cached(`hud:${entity}`, async () => {
    const json = (await getJson(`https://www.huduser.gov/hudapi/public/fmr/data/${entity}`, {
      Authorization: `Bearer ${token}`,
    })) as { data?: { basicdata?: BedroomRow | BedroomRow[]; year?: string } } | null;
    return json?.data ?? null;
  });
  if (!data?.basicdata) return null;

  const rows = Array.isArray(data.basicdata) ? data.basicdata : [data.basicdata];
  const zipRow = rows.find((r) => String(r.zip_code) === opts.zip);
  const metroRow = rows.find((r) => String(r.zip_code ?? "").toLowerCase() === "msa level") ?? rows[0];
  const row = zipRow ?? metroRow;
  const rents = row ? rowToRents(row) : null;
  if (!rents) return null;
  const year = String(row.year ?? data.year ?? "");
  return {
    amount: fmrForBedrooms(rents, opts.bedrooms),
    level: zipRow ? "zip" : opts.countyFips && !Array.isArray(data.basicdata) ? "county" : "metro",
    year: year ? `FY${year}` : "current year",
  };
}

/** Census ACS 5-year median gross rent for a ZCTA, overall (B25064) and by bedrooms (B25031). Requires CENSUS_KEY. */
export async function liveCensus(zip: string): Promise<{ all: { value: number; topCoded: boolean } | null; byBedrooms: (number | null)[] } | null> {
  const key = process.env.CENSUS_KEY?.trim();
  if (!key) return null;
  return cached(`acs:${zip}`, async () => {
    const vars = ["B25064_001E", "B25031_002E", "B25031_003E", "B25031_004E", "B25031_005E", "B25031_006E"];
    const url =
      `https://api.census.gov/data/2024/acs/acs5?get=${vars.join(",")}` +
      `&for=zip%20code%20tabulation%20area:${zip}&key=${encodeURIComponent(key)}`;
    const json = await getJson(url);
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[0])) return null;
    const header = json[0] as unknown[];
    const row = json[1] as unknown[];
    const get = (v: string) => (header.indexOf(v) >= 0 ? parseAcsValue(row[header.indexOf(v)]) : null);
    return {
      all: get("B25064_001E"),
      byBedrooms: vars.slice(1).map((v) => {
        const p = get(v);
        return p && !p.topCoded ? p.value : null;
      }),
    };
  });
}
