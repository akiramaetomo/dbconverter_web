import {
  quantityGroup,
  type BaseValues,
  type CalculationResult,
  type LinearQuantity,
  type SelectedValue,
} from "./model";
import { toBaseValue } from "./units";

export function calculate(
  first: SelectedValue,
  second: SelectedValue,
): CalculationResult {
  const firstGroup = quantityGroup[first.quantity];
  const secondGroup = quantityGroup[second.quantity];

  if (firstGroup === secondGroup) {
    throw new Error("Selected values must use different quantity groups");
  }

  const known = new Map<LinearQuantity, number>([
    [firstGroup, toLinearValue(first)],
    [secondGroup, toLinearValue(second)],
  ]);
  const values = calculateLinearValues(known);

  return {
    selected: [first.quantity, second.quantity],
    values: {
      ...values,
      voltageLevel: 20 * Math.log10(values.voltage),
      powerLevel: 10 * Math.log10(values.power / 0.001),
    },
  };
}

function toLinearValue(selected: SelectedValue): number {
  const baseValue = toBaseValue(selected);
  if (selected.quantity === "voltageLevel") {
    return 10 ** (baseValue / 20);
  }
  if (selected.quantity === "powerLevel") {
    return 0.001 * 10 ** (baseValue / 10);
  }
  return baseValue;
}

function calculateLinearValues(
  known: ReadonlyMap<LinearQuantity, number>,
): Pick<BaseValues, LinearQuantity> {
  const r = known.get("impedance");
  const v = known.get("voltage");
  const i = known.get("current");
  const p = known.get("power");

  if (r !== undefined && v !== undefined) {
    return { impedance: r, voltage: v, current: v / r, power: (v * v) / r };
  }
  if (r !== undefined && i !== undefined) {
    return { impedance: r, voltage: i * r, current: i, power: i * i * r };
  }
  if (r !== undefined && p !== undefined) {
    return {
      impedance: r,
      voltage: Math.sqrt(p * r),
      current: Math.sqrt(p / r),
      power: p,
    };
  }
  if (v !== undefined && i !== undefined) {
    return { impedance: v / i, voltage: v, current: i, power: v * i };
  }
  if (v !== undefined && p !== undefined) {
    return { impedance: (v * v) / p, voltage: v, current: p / v, power: p };
  }
  if (i !== undefined && p !== undefined) {
    return {
      impedance: p / (i * i),
      voltage: p / i,
      current: i,
      power: p,
    };
  }

  throw new Error("Exactly two different quantity groups are required");
}
