// Hand-picked map views for ZIPs where the geographic centroid isn't what a renter recognises.
// The map always shows an area, never the listing's address.

export interface MapView {
  lat: number;
  lng: number;
  zoom: number;
  /** What the view shows, for the caption and the map's accessible label. */
  label: string;
}

export const MAP_VIEWS: Record<string, MapView> = {
  // Midpoint of the VT Drillfield (37.22751, -80.42189, per vt.edu/about/buildings/drillfield) and downtown
  // Blacksburg (about 37.2297, -80.4137). Zoom 14 keeps campus and downtown both in view.
  "24060": { lat: 37.2286, lng: -80.4178, zoom: 14, label: "downtown Blacksburg and the Virginia Tech campus" },
};

export const mapViewFor = (zip: string): MapView | null => MAP_VIEWS[zip] ?? null;
