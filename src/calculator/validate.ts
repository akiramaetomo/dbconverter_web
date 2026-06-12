import { quantityGroup, type SelectedValue } from "./model";

export interface ValidationError {
  field: "fixed" | "input";
  message: string;
}

export function validateSelections(
  fixed: SelectedValue,
  input: SelectedValue,
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateValue(fixed, "fixed", errors);
  validateValue(input, "input", errors);

  if (quantityGroup[fixed.quantity] === quantityGroup[input.quantity]) {
    errors.push({
      field: "input",
      message: "FIXED and INPUT must use different quantity groups.",
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

