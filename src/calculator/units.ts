import type { Quantity, SelectedValue } from "./model";

const linearUnitFactors: Partial<Record<Quantity, Readonly<Record<string, number>>>> = {
  impedance: {
    "TΩ": 1e12,
    "GΩ": 1e9,
    "MΩ": 1e6,
    "kΩ": 1e3,
    "Ω": 1,
    "mΩ": 1e-3,
    "μΩ": 1e-6,
    "nΩ": 1e-9,
    "pΩ": 1e-12,
  },
  voltage: {
    GV: 1e9,
    MV: 1e6,
    kV: 1e3,
    V: 1,
    mV: 1e-3,
    "μV": 1e-6,
    nV: 1e-9,
    pV: 1e-12,
  },
  current: {
    GA: 1e9,
    MA: 1e6,
    kA: 1e3,
    A: 1,
    mA: 1e-3,
    "μA": 1e-6,
    nA: 1e-9,
    pA: 1e-12,
  },
  power: {
    TW: 1e12,
    GW: 1e9,
    MW: 1e6,
    kW: 1e3,
    W: 1,
    mW: 1e-3,
    "μW": 1e-6,
    nW: 1e-9,
    pW: 1e-12,
    fW: 1e-15,
  },
};

const levelOffsets: Partial<Record<Quantity, Readonly<Record<string, number>>>> = {
  voltageLevel: {
    dBV: 0,
    "dBμ": 120,
  },
  powerLevel: {
    dBm: 0,
    dBW: -30,
  },
};

export function toBaseValue(selected: SelectedValue): number {
  const factors = linearUnitFactors[selected.quantity];
  if (factors) {
    return selected.value * getUnitValue(factors, selected.unit, selected.quantity);
  }

  const offsets = levelOffsets[selected.quantity];
  if (offsets) {
    return selected.value - getUnitValue(offsets, selected.unit, selected.quantity);
  }

  throw new Error(`Unsupported quantity: ${selected.quantity}`);
}

export function fromBaseValue(quantity: Quantity, value: number, unit: string): number {
  const factors = linearUnitFactors[quantity];
  if (factors) {
    return value / getUnitValue(factors, unit, quantity);
  }

  const offsets = levelOffsets[quantity];
  if (offsets) {
    return value + getUnitValue(offsets, unit, quantity);
  }

  throw new Error(`Unsupported quantity: ${quantity}`);
}

function getUnitValue(
  values: Readonly<Record<string, number>>,
  unit: string,
  quantity: Quantity,
): number {
  const value = values[unit];
  if (value === undefined) {
    throw new Error(`Unsupported unit "${unit}" for ${quantity}`);
  }
  return value;
}
