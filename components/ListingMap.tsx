"use client";

import { AdvancedMarker, APIProvider, Map, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import type { MapsConfig } from "@/lib/server/maps-config";

/** Small map of the ZIP code's area, so a renter 300 miles away can see where the listing is. Optional. */
export function ListingMap({ config, zip, place }: { config: MapsConfig; zip: string; place: string | null }) {
  return (
    <figure className="mt-4">
      <APIProvider apiKey={config.apiKey}>
        <ZipMap zip={zip} mapId={config.mapId} label={`Map of the area around ZIP ${zip}${place ? `, ${place}` : ""}`} />
      </APIProvider>
      <figcaption className="mt-1 text-[13px] text-ink-soft">
        Approximate area: ZIP {zip}
        {place ? ` (${place})` : ""}. We map the ZIP code, not the exact address.
      </figcaption>
    </figure>
  );
}

function ZipMap({ zip, mapId, label }: { zip: string; mapId: string; label: string }) {
  const geocoding = useMapsLibrary("geocoding");
  const [center, setCenter] = useState<{ zip: string; at: google.maps.LatLngLiteral | null } | null>(null);

  useEffect(() => {
    if (!geocoding) return;
    let alive = true;
    new geocoding.Geocoder()
      .geocode({ componentRestrictions: { postalCode: zip, country: "US" } })
      .then((r) => alive && setCenter({ zip, at: r.results[0]?.geometry.location.toJSON() ?? null }))
      .catch(() => alive && setCenter({ zip, at: null }));
    return () => {
      alive = false;
    };
  }, [geocoding, zip]);

  const at = center?.zip === zip ? center.at : undefined;
  if (at === null) return <p className="text-[14px] text-ink-soft">The map couldn&apos;t load for this ZIP code.</p>;
  return (
    <div role="img" aria-label={label} className="h-52 overflow-hidden rounded-xs border border-rule bg-paper">
      {at && (
        <Map mapId={mapId} defaultCenter={at} defaultZoom={13} gestureHandling="cooperative" disableDefaultUI clickableIcons={false}>
          <AdvancedMarker position={at} title={`ZIP ${zip}`} />
        </Map>
      )}
    </div>
  );
}
