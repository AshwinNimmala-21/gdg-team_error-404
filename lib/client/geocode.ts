// ZIP → map center, defensive against the Maps JS API misbehaving.
// Regression (Oct 24): after Maps rejects the key (e.g. RefererNotAllowedMapError), Geocoder.geocode() can
// return undefined instead of a promise. ListingMap called .then on it, which crashed the whole report
// (seen as: text sample → photo sample → Next.js error page). Any non-answer must resolve to null.

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface GeocoderLike {
  geocode(req: { componentRestrictions: { postalCode: string; country: string } }): unknown;
}

type GeocodeResponse = { results?: { geometry?: { location?: { toJSON(): LatLngLiteral } } }[] } | null | undefined;

/** Resolves to the ZIP's center, or null if Maps can't answer. Never throws, never rejects. */
export async function geocodeZip(geocoder: GeocoderLike, zip: string): Promise<LatLngLiteral | null> {
  try {
    const r = (await geocoder.geocode({ componentRestrictions: { postalCode: zip, country: "US" } })) as GeocodeResponse;
    return r?.results?.[0]?.geometry?.location?.toJSON() ?? null;
  } catch {
    return null;
  }
}
