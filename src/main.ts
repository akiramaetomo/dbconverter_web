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
  fixed: "impedance" as Quantity,
  input: "voltage" as Quantity,
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
        <span>VALUE</span><span>FIXED</span><span>INPUT</span><span>UNIT</span><span>NUMBER</span>
      </div>
      <div id="quantity-rows"></div>
      <p class="status" id="status" role="status"></p>
    </section>

    <section class="keypad" aria-label="Calculator keypad">
      ${["7", "8", "9", "BS", "4", "5", "6", "C/AC", "1", "2", "3", "e", ".", "0", "-", "Ans"]
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

function renderRows(): void {
  rowsElement.innerHTML = quantities
    .map(
      (quantity) => `
        <div class="quantity-row group-${quantity.group}" data-row="${quantity.id}">
          <span class="quantity-label">${quantity.label}</span>
          <label class="role-choice" title="Use ${quantity.label} as the fixed value">
            <input type="radio" name="fixed" value="${quantity.id}" />
            <span></span>
          </label>
          <label class="role-choice" title="Use ${quantity.label} as the current input">
            <input type="radio" name="input" value="${quantity.id}" />
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

  rowsElement.querySelectorAll<HTMLInputElement>('input[name="fixed"]').forEach((radio) => {
    radio.addEventListener("change", () => selectFixed(radio.value as Quantity));
  });
  rowsElement.querySelectorAll<HTMLInputElement>('input[name="input"]').forEach((radio) => {
    radio.addEventListener("change", () => selectInput(radio.value as Quantity));
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

function selectFixed(quantity: Quantity): void {
  state.fixed = quantity;
  state.active = quantity;
  state.rows[quantity].calculated = false;
  if (quantityGroup[state.input] === quantityGroup[quantity]) {
    state.input = firstAvailableInput(quantity);
    state.rows[state.input].calculated = false;
  }
  clearErrors();
  renderState();
  focusValue(quantity);
}

function selectInput(quantity: Quantity): void {
  if (quantityGroup[quantity] === quantityGroup[state.fixed]) {
    return;
  }
  state.input = quantity;
  state.active = quantity;
  state.rows[quantity].calculated = false;
  clearErrors();
  renderState();
  focusValue(quantity);
}

function activateValue(quantity: Quantity): void {
  state.active = quantity;
  state.rows[quantity].calculated = false;
  if (quantity !== state.fixed && quantityGroup[quantity] !== quantityGroup[state.fixed]) {
    state.input = quantity;
  }
  clearErrors();
  renderState();
}

function changeUnit(quantity: Quantity, newUnit: string): void {
  const row = state.rows[quantity];
  const parsed = Number(row.text);
  if (row.text.trim() !== "" && Number.isFinite(parsed)) {
    const base = toBaseValue({ quantity, value: parsed, unit: row.unit });
    row.text = formatJavaGeneral(fromBaseValue(quantity, base, newUnit));
  }
  row.unit = newUnit;
  row.calculated = false;
  clearErrors();
  renderState();
}

function handleKey(key: string): void {
  if (key === "Ans") {
    calculateAndRender();
    return;
  }

  const row = state.rows[state.active];
  row.calculated = false;
  if (key === "BS") {
    row.text = row.text.slice(0, -1);
  } else if (key === "C/AC") {
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
  const fixed = selectedValue(state.fixed);
  const input = selectedValue(state.input);
  const errors = [...parseErrors(fixed, "fixed"), ...parseErrors(input, "input")];

  if (errors.length === 0) {
    errors.push(...validateSelections(fixed.value, input.value));
  }

  if (errors.length > 0) {
    for (const error of errors) {
      const quantity = error.field === "fixed" ? state.fixed : state.input;
      state.rows[quantity].error = error.message;
    }
    statusElement.textContent = "Check the highlighted input.";
    renderState();
    return;
  }

  try {
    const result = calculate(fixed.value, input.value);
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
  field: "fixed" | "input",
): Array<{ field: "fixed" | "input"; message: string }> {
  if (selected.raw.trim() === "" || !Number.isFinite(selected.value.value)) {
    return [{ field, message: "Enter a numeric value." }];
  }
  return [];
}

function applyResults(values: BaseValues): void {
  for (const quantity of quantities) {
    if (quantity.id === state.fixed || quantity.id === state.input) {
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
    const fixedRadio = getElement<HTMLInputElement>(
      `input[name="fixed"][value="${quantity.id}"]`,
      rowElement,
    );
    const inputRadio = getElement<HTMLInputElement>(
      `input[name="input"][value="${quantity.id}"]`,
      rowElement,
    );
    const input = getElement<HTMLInputElement>(`[data-value="${quantity.id}"]`, rowElement);
    const unit = getElement<HTMLSelectElement>(`[data-unit="${quantity.id}"]`, rowElement);
    const error = getElement<HTMLSpanElement>(`[data-error="${quantity.id}"]`, rowElement);

    fixedRadio.checked = quantity.id === state.fixed;
    inputRadio.checked = quantity.id === state.input;
    inputRadio.disabled = quantityGroup[quantity.id] === quantityGroup[state.fixed];
    input.value = row.text;
    unit.value = row.unit;
    error.textContent = row.error;
    rowElement.classList.toggle("is-fixed", quantity.id === state.fixed);
    rowElement.classList.toggle("is-input", quantity.id === state.input);
    rowElement.classList.toggle("is-active", quantity.id === state.active);
    rowElement.classList.toggle("is-calculated", row.calculated);
    rowElement.classList.toggle("has-error", row.error !== "");
  }

  summaryElement.textContent = `FIXED ${quantityById[state.fixed].label}  +  INPUT ${quantityById[state.input].label}`;
}

function firstAvailableInput(fixed: Quantity): Quantity {
  return quantities.find((quantity) => quantityGroup[quantity.id] !== quantityGroup[fixed])!.id;
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
