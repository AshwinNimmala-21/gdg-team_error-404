"use client";

import { AdvancedMarker, APIProvider, APILoadingStatus, Map, useApiLoadingStatus, useMapsLibrary } from "@vis.gl/react-google-maps";
import { geocodeZip } from "@/lib/client/geocode";
import { mapViewFor, type MapView } from "@/lib/data/map-centers";
import { useLang } from "./Lang";
import { useEffect, useState } from "react";
import type { MapsConfig } from "@/lib/server/maps-config";

/**
 * Small map of the ZIP code's area, so a renter 300 miles away can see where the listing is. Optional.
 * The map is decorative: the figcaption is the text alternative. Google's map has its own focusable parts, so the
 * box is inert + aria-hidden rather than role="img" (axe: nested interactive content).
 */
export function ListingMap({ config, zip, place }: { config: MapsConfig; zip: string; place: string | null }) {
  const { lang } = useLang();
  const view = mapViewFor(zip);
  const area =
    lang === "es"
      ? view
        ? `${view.labelEs} (código postal ${zip})`
        : `código postal ${zip}${place ? ` (${place})` : ""}`
      : view
        ? `${view.label} (ZIP ${zip})`
        : `ZIP ${zip}${place ? ` (${place})` : ""}`;
  return (
    <figure className="mt-4">
      <APIProvider apiKey={config.apiKey}>
        {view ? (
          <AreaMap view={view} mapId={config.mapId} />
        ) : (
          <ZipMap zip={zip} mapId={config.mapId} />
        )}
      </APIProvider>
      <figcaption className="mt-1 text-[13px] text-ink-soft">
        {lang === "es" ? `Zona mostrada: ${area}. Mostramos la zona, no la dirección exacta.` : `Area shown: ${area}. We map the area, not the exact address.`}
      </figcaption>
    </figure>
  );
}

/** A fixed, recognisable view (e.g. downtown + campus) instead of the ZIP's centroid. No pin: it's an area. */
function AreaMap({ view, mapId }: { view: MapView; mapId: string }) {
  // If Maps rejected the key, don't mount <Map>: Google's code throws when it renders after an auth failure.
  if (useMapsFailed()) return <MapUnavailable />;
  return (
    <div aria-hidden inert className="h-52 overflow-hidden rounded-xs border border-rule bg-paper">
      <Map mapId={mapId} defaultCenter={{ lat: view.lat, lng: view.lng }} defaultZoom={view.zoom} gestureHandling="cooperative" disableDefaultUI clickableIcons={false} />
    </div>
  );
}

function useMapsFailed() {
  const status = useApiLoadingStatus();
  return status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED;
}

function MapUnavailable() {
  const { lang } = useLang();
  return <p className="text-[14px] text-ink-soft">{lang === "es" ? "No se pudo cargar el mapa de este código postal." : "The map couldn't load for this ZIP code."}</p>;
}

function ZipMap({ zip, mapId }: { zip: string; mapId: string }) {
  const geocoding = useMapsLibrary("geocoding");
  const [center, setCenter] = useState<{ zip: string; at: google.maps.LatLngLiteral | null } | null>(null);

  useEffect(() => {
    if (!geocoding) return;
    let alive = true;
    // geocodeZip never throws: a rejected Maps key used to crash the whole report here (see lib/client/geocode.ts).
    void geocodeZip(new geocoding.Geocoder(), zip).then((at) => alive && setCenter({ zip, at }));
    return () => {
      alive = false;
    };
  }, [geocoding, zip]);

  const failed = useMapsFailed();
  const at = center?.zip === zip ? center.at : undefined;
  if (at === null || failed) return <MapUnavailable />;
  return (
    <div aria-hidden inert className="h-52 overflow-hidden rounded-xs border border-rule bg-paper">
      {at && (
        <Map mapId={mapId} defaultCenter={at} defaultZoom={13} gestureHandling="cooperative" disableDefaultUI clickableIcons={false}>
          <AdvancedMarker position={at} title={`ZIP ${zip}`} />
        </Map>
      )}
    </div>
  );
}
