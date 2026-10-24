// Google Maps settings are read on the server at request time and handed to the client as props.
// Cloud Run source deploys with a Dockerfile don't receive --set-build-env-vars (Google documents them
// for buildpacks only), and Next.js would freeze `process.env.NEXT_PUBLIC_*` at build time. Reading
// through an alias keeps the lookup at runtime.

export interface MapsConfig {
  apiKey: string;
  mapId: string;
}

export function readMapsConfig(): MapsConfig | null {
  const env = process.env;
  const apiKey = env["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]?.trim();
  if (!apiKey) return null;
  return { apiKey, mapId: env["NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID"]?.trim() || "DEMO_MAP_ID" };
}
