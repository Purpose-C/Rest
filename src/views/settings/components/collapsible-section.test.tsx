import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CollapsibleSection } from "./collapsible-section";

describe("CollapsibleSection", () => {
  beforeEach(() => localStorage.clear());

  it("toggles the whole section with disclosure semantics", () => {
    render(
      <CollapsibleSection id="settings-example" title="示例">
        <p>内容</p>
      </CollapsibleSection>,
    );
    const toggle = screen.getByRole("button", { name: "示例" });
    const content = screen.getByText("内容").closest("section");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(content?.hasAttribute("hidden")).toBe(false);

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(content?.hasAttribute("hidden")).toBe(true);
    expect(localStorage.getItem("settings.collapsed.settings-example")).toBe(
      "true",
    );
  });

  it("restores the persisted collapsed state", () => {
    localStorage.setItem("settings.collapsed.settings-example", "true");
    render(
      <CollapsibleSection id="settings-example" title="示例">
        <p>内容</p>
      </CollapsibleSection>,
    );
    expect(
      screen
        .getByRole("button", { name: "示例" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(
      screen.getByText("内容").closest("section")?.hasAttribute("hidden"),
    ).toBe(true);
  });
});
