import { describe, expect, it } from "vitest";
import { formatJavaGeneral } from "./format";

describe("formatJavaGeneral", () => {
  it.each([
    [0, "0.00000"],
    [1, "1.00000"],
    [30, "30.0000"],
    [2.82842712474619, "2.82843"],
    [0.001, "0.00100000"],
    [1e-5, "1.00000e-05"],
    [1e6, "1.00000e+06"],
  ])("formats %s like Java %%2.6g", (value, expected) => {
    expect(formatJavaGeneral(value)).toBe(expected);
  });

  it("formats special values according to the specification", () => {
    expect(formatJavaGeneral(Number.POSITIVE_INFINITY)).toBe("INF");
    expect(formatJavaGeneral(Number.NEGATIVE_INFINITY)).toBe("-INF");
    expect(formatJavaGeneral(Number.NaN)).toBe("NaN");
  });
});

