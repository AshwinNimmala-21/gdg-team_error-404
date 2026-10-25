import { describe, expect, it } from "vitest";
import { ruleToSpanish } from "../rules-es";

describe("ruleToSpanish", () => {
  it("translates fixed rule sentences and headlines with numbers", () => {
    expect(ruleToSpanish("Won't show the unit in person")).toBe("No muestra la vivienda en persona");
    expect(ruleToSpanish("7 of 9 checks flagged")).toBe("7 de 9 revisiones con alerta");
    expect(ruleToSpanish("45% below the usual range for a 1-bedroom in ZIP 24060")).toBe("45% por debajo de lo usual para una vivienda de 1 recámara en el código postal 24060");
    expect(ruleToSpanish("Rough comparison only for one bedroom's share of a 4-bedroom in ZIP 24060")).toMatch(/aproximada para la parte de una recámara en una vivienda de 4 recámaras/);
    expect(ruleToSpanish("3 clauses may conflict with Virginia law")).toBe("3 cláusulas pueden contradecir la ley de Virginia");
  });
  it("leaves anything unknown unchanged rather than hiding it", () => {
    expect(ruleToSpanish("Some new English sentence")).toBe("Some new English sentence");
  });
});
