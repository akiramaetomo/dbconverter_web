import { quantityGroup, type SelectedValue } from "./model";

export interface ValidationError {
  field: "first" | "second";
  message: string;
}

export function validateSelections(
  first: SelectedValue,
  second: SelectedValue,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateValue(first, "first", errors);
  validateValue(second, "second", errors);

  if (quantityGroup[first.quantity] === quantityGroup[second.quantity]) {
    errors.push({
      field: "second",
      message: "Select values from different quantity groups.",
    });
  }

  return errors;
}

function validateValue(
  selected: SelectedValue,
  field: ValidationError["field"],
  errors: ValidationError[],
): void {
  if (!Number.isFinite(selected.value)) {
    errors.push({ field, message: "Enter a finite numeric input." });
    return;
  }

  const isLinear = selected.quantity !== "voltageLevel" && selected.quantity !== "powerLevel";
  if (isLinear && selected.value < 0) {
    errors.push({ field, message: "Linear input values cannot be negative." });
  }
}
