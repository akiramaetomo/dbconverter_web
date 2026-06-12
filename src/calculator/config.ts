import type { Quantity, QuantityGroup } from "./model";

export interface QuantityConfig {
  id: Quantity;
  group: QuantityGroup;
  label: string;
  units: readonly string[];
  defaultUnit: string;
}

export const quantities: readonly QuantityConfig[] = [
  {
    id: "impedance",
    group: "impedance",
    label: "R",
    units: ["TΩ", "GΩ", "MΩ", "kΩ", "Ω", "mΩ", "μΩ", "nΩ", "pΩ"],
    defaultUnit: "Ω",
  },
  {
    id: "voltage",
    group: "voltage",
    label: "V",
    units: ["GV", "MV", "kV", "V", "mV", "μV", "nV", "pV"],
    defaultUnit: "V",
  },
  {
    id: "voltageLevel",
    group: "voltage",
    label: "dBV",
    units: ["dBV", "dBμ"],
    defaultUnit: "dBV",
  },
  {
    id: "current",
    group: "current",
    label: "I",
    units: ["GA", "MA", "kA", "A", "mA", "μA", "nA", "pA"],
    defaultUnit: "A",
  },
  {
    id: "power",
    group: "power",
    label: "P",
    units: ["TW", "GW", "MW", "kW", "W", "mW", "μW", "nW", "pW", "fW"],
    defaultUnit: "W",
  },
  {
    id: "powerLevel",
    group: "power",
    label: "dBm",
    units: ["dBm", "dBW"],
    defaultUnit: "dBm",
  },
] as const;

export const quantityById = Object.fromEntries(
  quantities.map((quantity) => [quantity.id, quantity]),
) as Record<Quantity, QuantityConfig>;

