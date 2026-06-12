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
    expect(document.querySelector<HTMLInputElement>('[data-value="impedance"]')?.value).toBe("1.0");
    expect(document.querySelector<HTMLInputElement>('[data-value="voltage"]')?.value).toBe("1.0");
    expect(document.querySelector<HTMLInputElement>('[data-value="current"]')?.value).toBe("1.00000");
    expect(document.querySelector("#selection-summary")?.textContent).toContain("FIXED R");
  });
});
