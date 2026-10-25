import { describe, expect, it } from "vitest";
import { geocodeZip } from "../geocode";

// Regression for the Oct 24 crash: text sample → photo sample → Next.js error page.
// After Maps rejected the key, Geocoder.geocode() returned undefined and ListingMap called .then on it.
const at = { lat: 37.23, lng: -80.41 };
const ok = { results: [{ geometry: { location: { toJSON: () => at } } }] };

describe("geocodeZip", () => {
  it("returns the ZIP's center on a normal answer", async () => {
    await expect(geocodeZip({ geocode: () => Promise.resolve(ok) }, "24060")).resolves.toEqual(at);
  });
  it("returns null, not a crash, when geocode() returns undefined (rejected Maps key)", async () => {
    await expect(geocodeZip({ geocode: () => undefined }, "24060")).resolves.toBeNull();
  });
  it("returns null when geocode() throws synchronously or rejects", async () => {
    await expect(geocodeZip({ geocode: () => { throw new Error("RefererNotAllowedMapError"); } }, "24060")).resolves.toBeNull();
    await expect(geocodeZip({ geocode: () => Promise.reject(new Error("ZERO_RESULTS")) }, "24060")).resolves.toBeNull();
  });
  it("returns null for empty or malformed answers", async () => {
    await expect(geocodeZip({ geocode: () => Promise.resolve({ results: [] }) }, "24060")).resolves.toBeNull();
    await expect(geocodeZip({ geocode: () => Promise.resolve(null) }, "24060")).resolves.toBeNull();
  });
});
