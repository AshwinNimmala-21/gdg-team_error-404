import { CENSUS_BEDROOM_SOURCE, CENSUS_SOURCE } from "@/lib/data/acs";
import type { Benchmarks } from "@/lib/data/benchmarks";
import { HUD_SOURCE } from "@/lib/data/fmr";
import type { Evidence, PriceCheck } from "@/lib/types";

// The "usual range" for a unit runs from the lower to the higher of two local references:
// the Census median for the same bedroom count in the ZIP, and HUD's Fair Market Rent.
// HUD's ZIP-level figures in pricey ZIPs sit at HUD's ceiling, while Census medians include
// long-time tenants, so using both edges keeps either source from deciding alone.
// Cut-offs are Clearlease rules of thumb, not HUD or FTC numbers.
export const BELOW_RATIO = 0.85; // under 85% of the low edge → below market
export const ABOVE_RATIO = 1.25; // over 125% of the high edge → above market
export const FAR_BELOW_RATIO = 0.75; // 25%+ under the low edge → FTC "a lot cheaper" scam sign

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

  const saved = (live: boolean) => (live ? "" : " (saved figure)");
  const refs: { amount: number; name: string }[] = [];
  if (b.censusBedroom && bedrooms !== null) {
    refs.push({ amount: b.censusBedroom.amount, name: `Census median for a ${bedLabel(bedrooms)} in ${b.censusBedroom.geography}` });
    evidence.push({
      label: `Census median rent for a ${bedLabel(bedrooms)}`,
      value: `${money(b.censusBedroom.amount)} a month in ${b.censusBedroom.geography}, ${b.censusBedroom.vintage}${saved(b.censusBedroom.live)}`,
      counted: true,
      source: CENSUS_BEDROOM_SOURCE,
    });
  }
  if (b.fmr && b.fmrArea && bedrooms !== null) {
    const where = b.fmr.level === "zip" ? `ZIP ${zip}` : b.fmrArea.shortName;
    refs.push({ amount: b.fmr.amount, name: `HUD ${b.fmr.year} benchmark, ${where}` });
    evidence.push({
      label: "HUD benchmark rent (Fair Market Rent)",
      value: `${money(b.fmr.amount)} a month for a ${bedLabel(bedrooms)}, ${where}, ${b.fmr.year}${saved(b.fmr.live)}`,
      counted: true,
      source: HUD_SOURCE,
    });
  }
  if (b.census) {
    evidence.push({
      label: "Census median rent, all unit sizes (context)",
      value: `${b.census.topCoded ? "At least " : ""}${money(b.census.amount)} a month in ${b.census.geography}, ${b.census.vintage}${saved(b.census.live)}`,
      counted: true,
      source: CENSUS_SOURCE,
    });
  }

  const base = { rent, bedrooms, zip, areaName: b.fmrArea?.shortName ?? null, benchmark: b.fmr, census: b.census, evidence, missing };

  if (rent === null || bedrooms === null || refs.length === 0 || rent <= 0) {
    return { ...base, status: "unknown", ratio: null, range: null, farBelow: false, ...unknownCopy(missing) };
  }

  const lowRef = refs.reduce((a, r) => (r.amount < a.amount ? r : a));
  const highRef = refs.reduce((a, r) => (r.amount > a.amount ? r : a));
  const ratio = rent / lowRef.amount;
  const status: PriceCheck["status"] = ratio < BELOW_RATIO ? "below" : rent / highRef.amount > ABOVE_RATIO ? "above" : "typical";
  const farBelow = ratio <= FAR_BELOW_RATIO;
  const unit = `a ${bedLabel(bedrooms)} in ${zip ? `ZIP ${zip}` : "this area"}`;

  const rangeLine =
    lowRef === highRef
      ? `Local benchmark: ${money(lowRef.amount)} (${lowRef.name}).`
      : `Usual range: ${money(lowRef.amount)} (${lowRef.name}) to ${money(highRef.amount)} (${highRef.name}).`;

  const headline =
    status === "below"
      ? `${Math.round((1 - ratio) * 100)}% below the usual range for ${unit}`
      : status === "above"
        ? `${Math.round((rent / highRef.amount - 1) * 100)}% above the usual range for ${unit}`
        : `Within the usual range for ${unit}`;
  const detail = `${rangeLine} ${
    status === "below"
      ? farBelow
        ? "Rent this far under local rents is a common scam sign, according to the FTC. Our cut-off (25% under) is a Clearlease rule of thumb, not an FTC number."
        : "Cheaper than most places like it. That can be a real deal, but see the unit before you pay anything."
      : status === "above"
        ? "Ask what's included (utilities, parking, amenities) and compare a few similar listings nearby."
        : "Both figures include utilities, so a listing without utilities can sit a bit lower and still be normal."
  }`;

  return { ...base, status, ratio, range: { low: lowRef.amount, high: highRef.amount }, farBelow, headline, detail };
}

function unknownCopy(missing: PriceCheck["missing"]): { headline: string; detail: string } {
  if (missing.includes("area")) {
    return {
      headline: "We don't have rent data for this ZIP yet",
      detail: "Clearlease covers DC, Northern Virginia, suburban Maryland, Baltimore and the Blacksburg area.",
    };
  }
  const need = missing.map((m) => (m === "rent" ? "the monthly rent" : m === "bedrooms" ? "the number of bedrooms" : "the ZIP code"));
  const list = need.length > 1 ? `${need.slice(0, -1).join(", ")} and ${need.at(-1)}` : (need[0] ?? "the rent details");
  return {
    headline: `Add ${list} to check the price`,
    detail: "We couldn't read it from what you shared. Use Edit above to fill it in.",
  };
}
