import { describe, expect, it } from "vitest";
import { fromBaseValue, toBaseValue } from "./units";

describe("unit conversion", () => {
  it("converts linear units to and from base units", () => {
    expect(toBaseValue({ quantity: "impedance", value: 2, unit: "kΩ" })).toBe(2000);
    expect(fromBaseValue("voltage", 1, "mV")).toBe(1000);
    expect(toBaseValue({ quantity: "current", value: 250, unit: "mA" })).toBe(0.25);
    expect(fromBaseValue("power", 0.001, "mW")).toBe(1);
  });

  it("converts dB display offsets", () => {
    expect(toBaseValue({ quantity: "voltageLevel", value: 120, unit: "dBμ" })).toBe(0);
    expect(fromBaseValue("voltageLevel", 0, "dBμ")).toBe(120);
    expect(toBaseValue({ quantity: "powerLevel", value: 0, unit: "dBW" })).toBe(30);
    expect(fromBaseValue("powerLevel", 0, "dBW")).toBe(-30);
  });
});

