import { describe, expect, it } from "vitest";
import { validateSelections } from "./validate";

describe("validateSelections", () => {
  it("allows zero linear values", () => {
    expect(
      validateSelections(
        { quantity: "impedance", value: 0, unit: "Ω" },
        { quantity: "voltage", value: 0, unit: "V" },
      ),
    ).toEqual([]);
  });

  it("rejects negative linear values", () => {
    expect(
      validateSelections(
        { quantity: "impedance", value: 8, unit: "Ω" },
        { quantity: "power", value: -1, unit: "W" },
      ),
    ).toContainEqual({
      field: "input",
      message: "Linear input values cannot be negative.",
    });
  });

  it("allows negative dB values", () => {
    expect(
      validateSelections(
        { quantity: "impedance", value: 50, unit: "Ω" },
        { quantity: "powerLevel", value: -20, unit: "dBm" },
      ),
    ).toEqual([]);
  });
});

