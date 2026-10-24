import { ACS_MEDIAN_BY_BEDROOMS_ZCTA, ACS_MEDIAN_GROSS_RENT_BY_COUNTY, ACS_MEDIAN_GROSS_RENT_BY_ZCTA, ACS_VINTAGE } from "./acs";
import { FMR_AREAS, FMR_YEAR, fmrForBedrooms, type FmrArea } from "./fmr";
import { liveCensus, liveFmr } from "./live";
import { lookupZip, type ZipArea } from "./zip-areas";

export interface Benchmarks {
  area: ZipArea | null;
  fmrArea: FmrArea | null;
  /** HUD Fair Market Rent for the bedroom count (ZIP-level Small Area FMR when live). */
  fmr: { amount: number; level: "zip" | "county" | "metro"; year: string; live: boolean } | null;
  /** Census median gross rent, all unit sizes (context only). */
  census: { amount: number; geography: string; vintage: string; live: boolean; topCoded: boolean } | null;
  /** Census median gross rent for the same bedroom count in this ZIP (like-for-like). */
  censusBedroom: { amount: number; geography: string; vintage: string; live: boolean } | null;
}

const EMPTY: Benchmarks = { area: null, fmrArea: null, fmr: null, census: null, censusBedroom: null };

/** Saved figures only — pure and synchronous, used by tests and as the fallback. */
export function savedBenchmarks(zip: string | null, bedrooms: number | null): Benchmarks {
  const area = zip ? lookupZip(zip) : null;
  if (!area) return EMPTY;
  const fmrArea = FMR_AREAS[area.fmrArea];
  const fmr =
    bedrooms === null ? null : { amount: fmrForBedrooms(fmrArea.rents, bedrooms), level: "metro" as const, year: FMR_YEAR, live: false };

  const zcta = ACS_MEDIAN_GROSS_RENT_BY_ZCTA[area.zip];
  const county = area.countyFips ? ACS_MEDIAN_GROSS_RENT_BY_COUNTY[area.countyFips] : undefined;
  const census = zcta
    ? { amount: zcta.median, geography: `ZIP ${area.zip}`, vintage: ACS_VINTAGE, live: false, topCoded: zcta.median >= 3501 }
    : county
      ? { amount: county.median, geography: county.name, vintage: ACS_VINTAGE, live: false, topCoded: false }
      : null;

  const byBr = bedrooms === null ? null : (ACS_MEDIAN_BY_BEDROOMS_ZCTA[area.zip]?.[Math.min(4, bedrooms)] ?? null);
  const censusBedroom = byBr ? { amount: byBr, geography: `ZIP ${area.zip}`, vintage: ACS_VINTAGE, live: false } : null;

  return { area, fmrArea, fmr, census, censusBedroom };
}

/** Saved figures, upgraded with live HUD / Census values when keys are set and the APIs answer in time. */
export async function resolveBenchmarks(zip: string | null, bedrooms: number | null): Promise<Benchmarks> {
  const saved = savedBenchmarks(zip, bedrooms);
  if (!saved.area || !saved.fmrArea) return saved;
  const [fmr, census] = await Promise.all([
    bedrooms === null
      ? null
      : liveFmr({ zip: saved.area.zip, countyFips: saved.area.countyFips, metroEntityId: saved.fmrArea.metroEntityId, bedrooms }),
    liveCensus(saved.area.zip),
  ]);
  const liveBr = bedrooms === null ? null : (census?.byBedrooms[Math.min(4, bedrooms)] ?? null);
  return {
    ...saved,
    fmr: fmr ? { ...fmr, live: true } : saved.fmr,
    census: census?.all
      ? { amount: census.all.value, geography: `ZIP ${saved.area.zip}`, vintage: ACS_VINTAGE, live: true, topCoded: census.all.topCoded }
      : saved.census,
    censusBedroom: liveBr ? { amount: liveBr, geography: `ZIP ${saved.area.zip}`, vintage: ACS_VINTAGE, live: true } : saved.censusBedroom,
  };
}
