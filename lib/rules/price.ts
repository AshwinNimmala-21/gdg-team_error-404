import type { Benchmarks } from "@/lib/data/benchmarks";
import { CENSUS_SOURCE } from "@/lib/data/acs";
import { HUD_SOURCE } from "@/lib/data/fmr";
import type { Evidence, PriceCheck } from "@/lib/types";

// Clearlease rules of thumb (not HUD or FTC numbers). HUD's FMR sits near the 40th percentile of
// local gross rent (rent + utilities), so ordinary listings land near or above it.
export const BELOW_RATIO = 0.85;
export const ABOVE_RATIO = 1.3;
export const FAR_BELOW_RATIO = 0.75;

export interface PriceInput {
  rent: number | null;
  bedrooms: number | null;
  zip: string | null;
  rentEvidence?: Evidence;
  bedroomsEvidence?: Evidence;
}

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const bedLabel = (n: number) => (n === 0 ? "studio" : `${n}-bedroom`);

export function computePrice(input: PriceInput, b: Benchmarks): PriceCheck {
  const { rent, bedrooms, zip } = input;
  const missing: PriceCheck["missing"] = [];
  if (rent === null) missing.push("rent");
  if (bedrooms === null) missing.push("bedrooms");
  if (zip === null) missing.push("zip");
  else if (!b.area) missing.push("area");

  const evidence: Evidence[] = [];
  if (input.rentEvidence) evidence.push(input.rentEvidence);
  if (input.bedroomsEvidence) evidence.push(input.bedroomsEvidence);

  const areaName = b.fmrArea?.shortName ?? null;
  if (b.fmr && b.fmrArea && bedrooms !== null) {
    const where = b.fmr.level === "zip" ? `ZIP ${zip}` : b.fmrArea.shortName;
    evidence.push({
      label: "HUD benchmark rent (Fair Market Rent)",
      value: `${money(b.fmr.amount)} a month for a ${bedLabel(bedrooms)}, ${where}, ${b.fmr.year}${b.fmr.live ? "" : " (saved figure)"}`,
      counted: true,
      source: HUD_SOURCE,
    });
  }
  if (b.census) {
    evidence.push({
      label: "Census median rent, all unit sizes",
      value: `${b.census.topCoded ? "At least " : ""}${money(b.census.amount)} a month in ${b.census.geography}, ${b.census.vintage}${b.census.live ? "" : " (saved figure)"}`,
      counted: true,
      source: CENSUS_SOURCE,
    });
  }

  const base = {
    rent,
    bedrooms,
    zip,
    areaName,
    benchmark: b.fmr,
    census: b.census,
    evidence,
    missing,
  };

  if (rent === null || bedrooms === null || !b.fmr || !b.fmrArea || rent <= 0) {
    return { ...base, status: "unknown", ratio: null, farBelow: false, ...unknownCopy(missing) };
  }

  const ratio = rent / b.fmr.amount;
  const pct = Math.round(Math.abs(ratio - 1) * 100);
  const what = `HUD's benchmark rent for a ${bedLabel(bedrooms)} in the ${b.fmr.level === "zip" ? `${zip} ZIP code` : b.fmrArea.shortName}`;
  const status: PriceCheck["status"] = ratio < BELOW_RATIO ? "below" : ratio > ABOVE_RATIO ? "above" : "typical";
  const farBelow = ratio <= FAR_BELOW_RATIO;

  const headline =
    pct < 2 ? `About the same as ${what}` : `${pct}% ${ratio < 1 ? "below" : "above"} ${what}`;
  const detail =
    status === "below"
      ? farBelow
        ? "Rent this far under the local benchmark is a common scam sign, according to the FTC. Our cut-off (25% under) is a Clearlease rule of thumb, not an FTC number."
        : "Cheaper than most places like it. That can be a real deal, but confirm the unit exists and see it before you pay anything."
      : status === "above"
        ? "Well above the local benchmark. Ask what's included (utilities, parking, amenities) and compare a few similar listings nearby."
        : "In the normal range. HUD sets this benchmark near the 40th percentile of local rents including utilities, so most real listings land near or above it.";

  return { ...base, status, ratio, farBelow, headline, detail };
}

function unknownCopy(missing: PriceCheck["missing"]): { headline: string; detail: string } {
  if (missing.includes("area")) {
    return {
      headline: "We don't have rent data for this ZIP yet",
      detail: "Clearlease covers DC, Northern Virginia, suburban Maryland, Baltimore and the Blacksburg area.",
    };
  }
  const need = missing.map((m) => (m === "rent" ? "the monthly rent" : m === "bedrooms" ? "the number of bedrooms" : "the ZIP code"));
  const list = need.length > 1 ? `${need.slice(0, -1).join(", ")} and ${need.at(-1)}` : need[0] ?? "the rent details";
  return {
    headline: `Add ${list} to check the price`,
    detail: "We couldn't read it from what you shared. Use Edit above to fill it in.",
  };
}
