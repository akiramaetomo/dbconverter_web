// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("application initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders the calculator and initial values", async () => {
    await import("./main");

    expect(document.querySelectorAll(".quantity-row")).toHaveLength(6);
    expect(document.querySelector(".table-header")?.textContent).not.toContain("VALUE");
    expect(document.querySelector<HTMLButtonElement>('[data-key="C"]')?.textContent).toBe("C");
    expect(document.querySelector('[data-key="C/AC"]')).toBeNull();
    expect(document.querySelector<HTMLInputElement>('[data-value="impedance"]')?.value).toBe("1.0");
    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.value).toBe("1.0");
    expect(document.querySelector<HTMLInputElement>('[data-value="current"]')?.value).toBe("1.00000");
    expect(document.querySelectorAll('input[name="selected"]:checked')).toHaveLength(2);
    expect(document.querySelector("#selection-summary")?.textContent).toContain("INPUT R, V");
    expect(document.querySelector<HTMLInputElement>('[data-value="current"]')?.readOnly).toBe(true);
  });

  it("requires two inputs from different quantity groups", async () => {
    await import("./main");

    const voltage = document.querySelector<HTMLInputElement>(
      'input[name="selected"][value="voltage"]',
    )!;
    const current = document.querySelector<HTMLInputElement>(
      'input[name="selected"][value="current"]',
    )!;

    voltage.checked = false;
    voltage.dispatchEvent(new Event("change"));

    current.checked = true;
    current.dispatchEvent(new Event("change"));

    expect(document.querySelectorAll('input[name="selected"]:checked')).toHaveLength(2);
    expect(document.querySelector("#selection-summary")?.textContent).toContain("INPUT R, I");
    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.readOnly).toBe(true);
    expect(document.querySelector<HTMLInputElement>('[data-value="current"]')?.readOnly).toBe(false);
  });

  it("clears only the active input with C", async () => {
    await import("./main");

    document.querySelector<HTMLButtonElement>('[data-key="C"]')!.click();

    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.value).toBe("");
    expect(document.querySelector<HTMLInputElement>('[data-value="impedance"]')?.value).toBe("1.0");
  });

  it("replaces the active input when a third input selector is chosen", async () => {
    await import("./main");

    const current = document.querySelector<HTMLInputElement>(
      'input[name="selected"][value="current"]',
    )!;
    current.checked = true;
    current.dispatchEvent(new Event("change"));

    expect(current.checked).toBe(true);
    expect(document.querySelectorAll('input[name="selected"]:checked')).toHaveLength(2);
    expect(document.querySelector("#selection-summary")?.textContent).toContain("INPUT R, I");
    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.readOnly).toBe(true);
    expect(document.querySelector<HTMLInputElement>('[data-value="current"]')?.readOnly).toBe(false);
  });

  it("replaces the same-group input when a third value field is focused", async () => {
    await import("./main");

    const voltageLevel = document.querySelector<HTMLInputElement>('[data-value="voltageLevel"]')!;
    voltageLevel.focus();

    expect(document.querySelectorAll('input[name="selected"]:checked')).toHaveLength(2);
    expect(document.querySelector("#selection-summary")?.textContent).toContain("INPUT R, dBV");
    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.readOnly).toBe(true);
    expect(voltageLevel.readOnly).toBe(false);
    expect(document.querySelector('[data-row="voltageLevel"]')?.classList.contains("is-active")).toBe(
      true,
    );
  });

  it("calculates when Enter is pressed", async () => {
    await import("./main");

    const voltage = document.querySelector<HTMLInputElement>('[data-value="voltage"]')!;
    voltage.value = "2";
    voltage.dispatchEvent(new Event("input"));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", cancelable: true }));

    expect(document.querySelector<HTMLInputElement>('[data-value="power"]')?.value).toBe("4.00000");
    expect(document.querySelector("#status")?.textContent).toBe("Calculated.");
  });

  it("allows calculated result units to change and preserves result styling", async () => {
    await import("./main");

    const power = document.querySelector<HTMLInputElement>('[data-value="power"]')!;
    const powerUnit = document.querySelector<HTMLSelectElement>('[data-unit="power"]')!;
    const powerRow = document.querySelector<HTMLDivElement>('[data-row="power"]')!;

    expect(power.readOnly).toBe(true);
    expect(powerUnit.disabled).toBe(false);
    expect(power.value).toBe("1.00000");
    expect(powerRow.classList.contains("is-calculated")).toBe(true);

    powerUnit.value = "mW";
    powerUnit.dispatchEvent(new Event("change"));

    expect(power.value).toBe("1000.00");
    expect(powerRow.classList.contains("is-calculated")).toBe(true);
  });
});
