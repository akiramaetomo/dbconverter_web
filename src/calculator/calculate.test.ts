import { describe, expect, it } from "vitest";
import { calculate } from "./calculate";

describe("calculate", () => {
  it("matches the Android initial example", () => {
    const result = calculate(
      { quantity: "impedance", value: 1, unit: "Ω" },
      { quantity: "voltage", value: 1, unit: "V" },
    );

    expect(result.values).toEqual({
      impedance: 1,
      voltage: 1,
      voltageLevel: 0,
      current: 1,
      power: 1,
      powerLevel: 30,
    });
  });

  it("calculates voltage from impedance and power", () => {
    const { values } = calculate(
      { quantity: "impedance", value: 8, unit: "Ω" },
      { quantity: "power", value: 1, unit: "W" },
    );

    expect(values.voltage).toBeCloseTo(2.82842712474619, 14);
    expect(values.current).toBeCloseTo(0.353553390593274, 14);
    expect(values.voltageLevel).toBeCloseTo(9.03089986991944, 14);
    expect(values.powerLevel).toBe(30);
  });

  it("calculates impedance from voltage and power", () => {
    const { values } = calculate(
      { quantity: "voltage", value: 2, unit: "V" },
      { quantity: "power", value: 0.5, unit: "W" },
    );

    expect(values.impedance).toBe(8);
    expect(values.current).toBe(0.25);
    expect(values.voltageLevel).toBeCloseTo(6.02059991327962, 14);
    expect(values.powerLevel).toBeCloseTo(26.9897000433602, 13);
  });

  it("supports dBm input", () => {
    const { values } = calculate(
      { quantity: "impedance", value: 50, unit: "Ω" },
      { quantity: "powerLevel", value: 0, unit: "dBm" },
    );

    expect(values.power).toBe(0.001);
    expect(values.voltage).toBeCloseTo(0.223606797749979, 14);
    expect(values.voltageLevel).toBeCloseTo(-13.0102999566398, 13);
  });

  it("supports current with impedance", () => {
    const { values } = calculate(
      { quantity: "impedance", value: 8, unit: "Ω" },
      { quantity: "current", value: 0.5, unit: "A" },
    );

    expect(values.voltage).toBe(4);
    expect(values.power).toBe(2);
    expect(values.voltageLevel).toBeCloseTo(12.0411998265592, 13);
    expect(values.powerLevel).toBeCloseTo(33.0102999566398, 13);
  });

  it("uses the specified zero-value calculation path", () => {
    const rv = calculate(
      { quantity: "impedance", value: 0, unit: "Ω" },
      { quantity: "voltage", value: 0, unit: "V" },
    );
    const ri = calculate(
      { quantity: "impedance", value: 0, unit: "Ω" },
      { quantity: "current", value: 0, unit: "A" },
    );

    expect(rv.values.current).toBeNaN();
    expect(rv.values.power).toBeNaN();
    expect(ri.values.voltage).toBe(0);
    expect(ri.values.power).toBe(0);
  });

  it("rejects two representations of the same quantity group", () => {
    expect(() =>
      calculate(
        { quantity: "voltage", value: 1, unit: "V" },
        { quantity: "voltageLevel", value: 0, unit: "dBV" },
      ),
    ).toThrow("different quantity groups");
  });
});
