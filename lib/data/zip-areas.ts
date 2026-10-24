import type { Jurisdiction } from "@/lib/types";
import type { FmrAreaId } from "./fmr";

// ZIP → state, HUD FMR area and (when we know it) county. Coverage is the DMV plus the Blacksburg
// area; anything else returns null and the price check says we don't have data for that ZIP yet.
// County assignment uses the main county for each ZIP; a few ZIPs straddle county lines.

export interface ZipArea {
  zip: string;
  state: Jurisdiction;
  fmrArea: FmrAreaId;
  countyFips: string | null;
  place: string;
}

type Range = [from: number, to: number, countyFips: string | null, place: string];

// Explicit ranges are checked first, then the 3-digit prefix defaults below.
const RANGES: Range[] = [
  // Virginia, Washington metro
  [22201, 22246, "51013", "Arlington, VA"],
  [22301, 22302, "51510", "Alexandria, VA"],
  [22304, 22305, "51510", "Alexandria, VA"],
  [22311, 22311, "51510", "Alexandria, VA"],
  [22313, 22314, "51510", "Alexandria, VA"],
  [22320, 22336, "51510", "Alexandria, VA"],
  [22303, 22303, "51059", "Alexandria (Fairfax County), VA"],
  [22306, 22310, "51059", "Alexandria (Fairfax County), VA"],
  [22312, 22312, "51059", "Alexandria (Fairfax County), VA"],
  [22315, 22315, "51059", "Alexandria (Fairfax County), VA"],
  [22046, 22046, "51610", "Falls Church, VA"],
  [22030, 22030, "51600", "Fairfax, VA"],
  [20110, 20110, "51683", "Manassas, VA"],
  [20112, 20112, "51153", "Manassas (Prince William County), VA"],
  [20136, 20136, "51153", "Bristow, VA"],
  [20155, 20156, "51153", "Gainesville, VA"],
  [20169, 20169, "51153", "Haymarket, VA"],
  [22025, 22026, "51153", "Dumfries, VA"],
  [22134, 22134, "51153", "Quantico, VA"],
  [22172, 22172, "51153", "Triangle, VA"],
  [22191, 22195, "51153", "Woodbridge, VA"],
  [20101, 20105, "51107", "Loudoun County, VA"],
  [20117, 20118, "51107", "Loudoun County, VA"],
  [20129, 20129, "51107", "Loudoun County, VA"],
  [20132, 20132, "51107", "Purcellville, VA"],
  [20141, 20141, "51107", "Round Hill, VA"],
  [20146, 20149, "51107", "Ashburn, VA"],
  [20158, 20160, "51107", "Loudoun County, VA"],
  [20164, 20167, "51107", "Sterling, VA"],
  [20175, 20177, "51107", "Leesburg, VA"],
  [20180, 20180, "51107", "Lovettsville, VA"],
  // Maryland, Washington metro
  [20705, 20708, "24033", "Prince George's County, MD"],
  [20710, 20710, "24033", "Bladensburg, MD"],
  [20712, 20712, "24033", "Mount Rainier, MD"],
  [20715, 20722, "24033", "Prince George's County, MD"],
  [20735, 20748, "24033", "Prince George's County, MD"],
  [20740, 20742, "24033", "College Park, MD"],
  [20769, 20774, "24033", "Prince George's County, MD"],
  [20781, 20785, "24033", "Hyattsville, MD"],
  [20810, 20918, "24031", "Montgomery County, MD"],
  [21701, 21705, "24021", "Frederick, MD"],
  // Maryland, Baltimore metro
  [21201, 21298, "24510", "Baltimore, MD"],
  [21029, 21029, "24027", "Clarksville, MD"],
  [21042, 21046, "24027", "Ellicott City / Columbia, MD"],
  [21075, 21075, "24027", "Elkridge, MD"],
  [21401, 21412, "24003", "Annapolis, MD"],
  [21122, 21122, "24003", "Pasadena, MD"],
  [21144, 21144, "24003", "Severn, MD"],
  [21146, 21146, "24003", "Severna Park, MD"],
  // Virginia Tech area (Blacksburg MSA)
  [24060, 24063, "51121", "Blacksburg, VA"],
  [24068, 24068, "51121", "Christiansburg, VA"],
  [24073, 24073, "51121", "Christiansburg, VA"],
  [24087, 24087, "51121", "Elliston, VA"],
  [24149, 24149, "51121", "Riner, VA"],
  [24162, 24162, "51121", "Shawsville, VA"],
  [24141, 24143, null, "Radford, VA"],
];

type Prefix = { state: Jurisdiction; fmrArea: FmrAreaId; countyFips: string | null; place: string };

const PREFIXES: Record<string, Prefix> = {
  "200": { state: "DC", fmrArea: "washington", countyFips: "11001", place: "Washington, DC" },
  "202": { state: "DC", fmrArea: "washington", countyFips: "11001", place: "Washington, DC" },
  "203": { state: "DC", fmrArea: "washington", countyFips: "11001", place: "Washington, DC" },
  "204": { state: "DC", fmrArea: "washington", countyFips: "11001", place: "Washington, DC" },
  "205": { state: "DC", fmrArea: "washington", countyFips: "11001", place: "Washington, DC" },
  "201": { state: "VA", fmrArea: "washington", countyFips: "51059", place: "Northern Virginia" },
  "220": { state: "VA", fmrArea: "washington", countyFips: "51059", place: "Fairfax County, VA" },
  "221": { state: "VA", fmrArea: "washington", countyFips: "51059", place: "Fairfax County, VA" },
  "222": { state: "VA", fmrArea: "washington", countyFips: "51013", place: "Arlington, VA" },
  "223": { state: "VA", fmrArea: "washington", countyFips: "51059", place: "Northern Virginia" },
  "207": { state: "MD", fmrArea: "washington", countyFips: "24033", place: "Prince George's County, MD" },
  "208": { state: "MD", fmrArea: "washington", countyFips: "24031", place: "Montgomery County, MD" },
  "209": { state: "MD", fmrArea: "washington", countyFips: "24031", place: "Montgomery County, MD" },
  "210": { state: "MD", fmrArea: "baltimore", countyFips: null, place: "Baltimore area, MD" },
  "211": { state: "MD", fmrArea: "baltimore", countyFips: null, place: "Baltimore area, MD" },
  "212": { state: "MD", fmrArea: "baltimore", countyFips: "24510", place: "Baltimore, MD" },
  "214": { state: "MD", fmrArea: "baltimore", countyFips: "24003", place: "Annapolis area, MD" },
};

const STATE_BY_PREFIX: [number, number, Jurisdiction][] = [
  [200, 200, "DC"],
  [201, 201, "VA"],
  [202, 205, "DC"],
  [206, 219, "MD"],
  [220, 246, "VA"],
];

export function isZip(v: unknown): v is string {
  return typeof v === "string" && /^\d{5}$/.test(v);
}

/** The state for any ZIP in DC, Maryland or Virginia, even ones we have no rent data for. */
export function stateForZip(zip: string): Jurisdiction | null {
  if (!isZip(zip)) return null;
  const p = Number(zip.slice(0, 3));
  return STATE_BY_PREFIX.find(([a, b]) => p >= a && p <= b)?.[2] ?? null;
}

export function lookupZip(zip: string): ZipArea | null {
  if (!isZip(zip)) return null;
  const n = Number(zip);
  const state = stateForZip(zip);
  for (const [from, to, countyFips, place] of RANGES) {
    if (n >= from && n <= to && state) {
      const fmrArea: FmrAreaId = zip.startsWith("24")
        ? "blacksburg"
        : ["24510", "24027", "24003"].includes(countyFips ?? "")
          ? "baltimore"
          : "washington";
      return { zip, state, fmrArea, countyFips, place };
    }
  }
  const prefix = PREFIXES[zip.slice(0, 3)];
  return prefix ? { zip, ...prefix } : null;
}
