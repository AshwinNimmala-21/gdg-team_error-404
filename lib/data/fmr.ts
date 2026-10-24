// Saved HUD Fair Market Rents, FY2027 (effective 2026-10-01).
// Source and caveats: docs/research/hud-fmr.md. Values are the metro-wide rows; inside the
// Washington metro HUD uses ZIP-level Small Area FMRs, which we fetch live when HUD_TOKEN is set.

export const FMR_YEAR = "FY2027";

export type FmrAreaId = "washington" | "baltimore" | "blacksburg";

export interface FmrArea {
  id: FmrAreaId;
  name: string;
  shortName: string;
  metroEntityId: string;
  smallArea: boolean;
  // index = bedrooms (0 = studio … 4)
  rents: [number, number, number, number, number];
}

export const FMR_AREAS: Record<FmrAreaId, FmrArea> = {
  washington: {
    id: "washington",
    name: "Washington-Arlington-Alexandria, DC-VA-MD HUD Metro FMR Area",
    shortName: "Washington metro",
    metroEntityId: "METRO47900M47900",
    smallArea: true,
    rents: [2111, 2204, 2438, 3107, 3658],
  },
  baltimore: {
    id: "baltimore",
    name: "Baltimore-Columbia-Towson, MD MSA",
    shortName: "Baltimore metro",
    metroEntityId: "METRO12580M12580",
    smallArea: false,
    rents: [1523, 1625, 2006, 2509, 2789],
  },
  blacksburg: {
    id: "blacksburg",
    name: "Blacksburg-Christiansburg-Radford, VA MSA",
    shortName: "Blacksburg area",
    metroEntityId: "METRO13980M13980",
    smallArea: false,
    rents: [1043, 1050, 1340, 1783, 2048],
  },
};

export const HUD_SOURCE = {
  name: `HUD Fair Market Rents ${FMR_YEAR}`,
  url: "https://www.huduser.gov/portal/datasets/fmr.html",
};

/** FMR for a bedroom count. HUD publishes 0–4BR; larger units are compared with the 4BR figure. */
export function fmrForBedrooms(rents: readonly number[], bedrooms: number): number {
  return rents[Math.min(4, Math.max(0, Math.trunc(bedrooms)))];
}
