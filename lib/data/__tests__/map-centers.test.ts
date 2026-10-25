import { describe, expect, it } from "vitest";
import { mapViewFor } from "../map-centers";

describe("map views", () => {
  it("shows downtown Blacksburg and the VT campus for 24060, zoomed out enough for landmarks", () => {
    const v = mapViewFor("24060")!;
    expect(v.label).toMatch(/Blacksburg.*Virginia Tech/);
    // Between the Drillfield (37.22751, -80.42189) and downtown (about 37.2297, -80.4137)
    expect(v.lat).toBeGreaterThan(37.2275);
    expect(v.lat).toBeLessThan(37.2297);
    expect(v.lng).toBeGreaterThan(-80.4219);
    expect(v.lng).toBeLessThan(-80.4137);
    expect(v.zoom).toBeLessThanOrEqual(14);
  });
  it("falls back to geocoding the ZIP elsewhere", () => {
    expect(mapViewFor("22201")).toBeNull();
  });
});
