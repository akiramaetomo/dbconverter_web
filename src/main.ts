import "./styles.css";
import {
  calculate,
  formatJavaGeneral,
  fromBaseValue,
  quantities,
  quantityById,
  quantityGroup,
  toBaseValue,
  validateSelections,
  type BaseValues,
  type Quantity,
  type SelectedValue,
} from "./calculator";

interface RowState {
  unit: string;
  text: string;
  calculated: boolean;
  error: string;
}

const state = {
  selected: ["impedance", "voltage"] as Quantity[],
  active: "voltage" as Quantity,
  rows: Object.fromEntries(
    quantities.map((quantity) => [
      quantity.id,
      {
        unit: quantity.defaultUnit,
        text: quantity.id === "impedance" || quantity.id === "voltage" ? "1.0" : "",
        calculated: false,
        error: "",
      },
    ]),
  ) as Record<Quantity, RowState>,
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Application root was not found");
}

app.innerHTML = `
  <main class="shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">Electrical level calculator</p>
        <h1>dBconverter</h1>
      </div>
      <p class="selection-summary" id="selection-summary"></p>
    </header>

    <section class="calculator" aria-label="dB converter">
      <div class="table-header" aria-hidden="true">
        <span></span><span>INPUT</span><span>UNIT</span><span>NUMBER</span>
      </div>
      <div id="quantity-rows"></div>
      <p class="status" id="status" role="status"></p>
    </section>

    <section class="keypad" aria-label="Calculator keypad">
      ${["7", "8", "9", "BS", "4", "5", "6", "C", "1", "2", "3", "e", ".", "0", "-", "Ans"]
        .map((key) => `<button type="button" data-key="${key}" class="${key === "Ans" ? "answer" : ""}">${key}</button>`)
        .join("")}
    </section>
  </main>
`;

const rowsElement = getElement<HTMLDivElement>("#quantity-rows");
const statusElement = getElement<HTMLParagraphElement>("#status");
const summaryElement = getElement<HTMLParagraphElement>("#selection-summary");

renderRows();
renderState();
calculateAndRender();

document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((button) => {
  button.addEventListener("click", () => handleKey(button.dataset.key ?? ""));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    calculateAndRender();
  }
});

function renderRows(): void {
  rowsElement.innerHTML = quantities
    .map(
      (quantity) => `
        <div class="quantity-row group-${quantity.group}" data-row="${quantity.id}">
          <span class="quantity-label">${quantity.label}</span>
          <label class="role-choice" title="Use ${quantity.label} as an input">
            <input type="checkbox" name="selected" value="${quantity.id}" />
            <span></span>
          </label>
          <select data-unit="${quantity.id}" aria-label="${quantity.label} unit">
            ${quantity.units.map((unit) => `<option value="${unit}">${unit}</option>`).join("")}
          </select>
          <div class="value-cell">
            <input
              data-value="${quantity.id}"
              aria-label="${quantity.label} value"
              autocomplete="off"
              inputmode="none"
              maxlength="12"
            />
            <span class="field-error" data-error="${quantity.id}"></span>
          </div>
        </div>
      `,
    )
    .join("");

  rowsElement.querySelectorAll<HTMLInputElement>('input[name="selected"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () =>
      toggleSelection(checkbox.value as Quantity, checkbox.checked),
    );
  });
  rowsElement.querySelectorAll<HTMLInputElement>("[data-value]").forEach((input) => {
    const quantity = input.dataset.value as Quantity;
    input.addEventListener("focus", () => activateValue(quantity));
    input.addEventListener("input", () => {
      state.rows[quantity].text = input.value;
      state.rows[quantity].calculated = false;
      clearErrors();
      renderState();
    });
  });
  rowsElement.querySelectorAll<HTMLSelectElement>("[data-unit]").forEach((select) => {
    const quantity = select.dataset.unit as Quantity;
    select.addEventListener("change", () => changeUnit(quantity, select.value));
  });
}

function toggleSelection(quantity: Quantity, checked: boolean): void {
  if (checked) {
    selectQuantity(quantity);
  } else {
    state.selected = state.selected.filter((selected) => selected !== quantity);
    state.active = state.selected.at(-1) ?? quantity;
  }
  state.rows[quantity].calculated = false;
  clearErrors();
  renderState();
  if (checked) {
    focusValue(quantity);
  }
}

function activateValue(quantity: Quantity): void {
  if (!state.selected.includes(quantity)) {
    selectQuantity(quantity);
  }
  state.active = quantity;
  state.rows[quantity].calculated = false;
  clearErrors();
  renderState();
}

function selectQuantity(quantity: Quantity): void {
  if (state.selected.includes(quantity)) {
    state.active = quantity;
    return;
  }

  const sameGroup = state.selected.find(
    (selected) => quantityGroup[selected] === quantityGroup[quantity],
  );
  const replaced =
    sameGroup ??
    (state.selected.length >= 2 && state.selected.includes(state.active) ? state.active : undefined);

  if (replaced) {
    const replacedIndex = state.selected.indexOf(replaced);
    state.selected.splice(replacedIndex, 1, quantity);
  } else {
    state.selected.push(quantity);
  }
  state.active = quantity;
}

function changeUnit(quantity: Quantity, newUnit: string): void {
  const row = state.rows[quantity];
  const parsed = Number(row.text);
  if (row.text.trim() !== "" && Number.isFinite(parsed)) {
    const base = toBaseValue({ quantity, value: parsed, unit: row.unit });
    row.text = formatJavaGeneral(fromBaseValue(quantity, base, newUnit));
  }
  row.unit = newUnit;
  clearErrors();
  renderState();
}

function handleKey(key: string): void {
  if (key === "Ans") {
    calculateAndRender();
    return;
  }

  if (!state.selected.includes(state.active)) {
    statusElement.textContent = "Select two input values.";
    return;
  }
  const row = state.rows[state.active];
  row.calculated = false;
  if (key === "BS") {
    row.text = row.text.slice(0, -1);
  } else if (key === "C") {
    row.text = "";
  } else {
    row.text += key;
  }
  clearErrors();
  renderState();
  focusValue(state.active);
}

function calculateAndRender(): void {
  clearErrors();
  if (state.selected.length !== 2) {
    statusElement.textContent = "Select two input values.";
    renderState();
    return;
  }
  const [firstQuantity, secondQuantity] = state.selected as [Quantity, Quantity];
  const first = selectedValue(firstQuantity);
  const second = selectedValue(secondQuantity);
  const errors = [...parseErrors(first, "first"), ...parseErrors(second, "second")];

  if (errors.length === 0) {
    errors.push(...validateSelections(first.value, second.value));
  }

  if (errors.length > 0) {
    for (const error of errors) {
      const quantity = error.field === "first" ? firstQuantity : secondQuantity;
      state.rows[quantity].error = error.message;
    }
    statusElement.textContent = "Check the highlighted input.";
    renderState();
    return;
  }

  try {
    const result = calculate(first.value, second.value);
    applyResults(result.values);
    statusElement.textContent = "Calculated.";
  } catch {
    statusElement.textContent = "The calculation could not be completed.";
  }
  renderState();
}

function selectedValue(quantity: Quantity): { raw: string; value: SelectedValue } {
  const row = state.rows[quantity];
  return {
    raw: row.text,
    value: { quantity, value: Number(row.text), unit: row.unit },
  };
}

function parseErrors(
  selected: ReturnType<typeof selectedValue>,
  field: "first" | "second",
): Array<{ field: "first" | "second"; message: string }> {
  if (selected.raw.trim() === "" || !Number.isFinite(selected.value.value)) {
    return [{ field, message: "Enter a numeric value." }];
  }
  return [];
}

function applyResults(values: BaseValues): void {
  for (const quantity of quantities) {
    if (state.selected.includes(quantity.id)) {
      state.rows[quantity.id].calculated = false;
      continue;
    }
    const row = state.rows[quantity.id];
    row.text = formatJavaGeneral(fromBaseValue(quantity.id, values[quantity.id], row.unit));
    row.calculated = true;
  }
}

function renderState(): void {
  for (const quantity of quantities) {
    const row = state.rows[quantity.id];
    const rowElement = getElement<HTMLDivElement>(`[data-row="${quantity.id}"]`, rowsElement);
    const selectedCheckbox = getElement<HTMLInputElement>(
      `input[name="selected"][value="${quantity.id}"]`,
      rowElement,
    );
    const input = getElement<HTMLInputElement>(`[data-value="${quantity.id}"]`, rowElement);
    const unit = getElement<HTMLSelectElement>(`[data-unit="${quantity.id}"]`, rowElement);
    const error = getElement<HTMLSpanElement>(`[data-error="${quantity.id}"]`, rowElement);

    const selected = state.selected.includes(quantity.id);
    selectedCheckbox.checked = selected;
    input.value = row.text;
    input.readOnly = !selected;
    unit.value = row.unit;
    error.textContent = row.error;
    rowElement.classList.toggle("is-selected", selected);
    rowElement.classList.toggle("is-active", quantity.id === state.active);
    rowElement.classList.toggle("is-calculated", row.calculated);
    rowElement.classList.toggle("has-error", row.error !== "");
  }

  summaryElement.textContent =
    state.selected.length === 2
      ? `INPUT ${state.selected.map((quantity) => quantityById[quantity].label).join(", ")}`
      : `INPUT ${state.selected.length} / 2`;
}

function clearErrors(): void {
  for (const quantity of quantities) {
    state.rows[quantity.id].error = "";
  }
  statusElement.textContent = "";
}

function focusValue(quantity: Quantity): void {
  getElement<HTMLInputElement>(`[data-value="${quantity}"]`, rowsElement).focus();
}

function getElement<T extends Element>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}
