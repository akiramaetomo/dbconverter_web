export type LinearQuantity = "impedance" | "voltage" | "current" | "power";
export type Quantity = LinearQuantity | "voltageLevel" | "powerLevel";
export type QuantityGroup = LinearQuantity;

export interface SelectedValue {
  quantity: Quantity;
  value: number;
  unit: string;
}

export interface BaseValues {
  impedance: number;
  voltage: number;
  voltageLevel: number;
  current: number;
  power: number;
  powerLevel: number;
}

export interface CalculationResult {
  values: BaseValues;
  selected: readonly [Quantity, Quantity];
}

export const quantityGroup: Record<Quantity, QuantityGroup> = {
  impedance: "impedance",
  voltage: "voltage",
  voltageLevel: "voltage",
  current: "current",
  power: "power",
  powerLevel: "power",
};

