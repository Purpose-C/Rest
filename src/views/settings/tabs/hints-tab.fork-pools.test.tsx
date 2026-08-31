// spec-round6 stage 4: coverage for the Hints tab the five pools moved
// into, and for the per-item editor that replaced the textareas. Lives in
// its own file so upstream test bodies stay diff-clean.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

const { HintsTab } = await import("./hints-tab");
import type { SchedulerSettings, SupporterStatus } from "../types";

const baseSettings = {
  show_hint: true,
  hint_rotate_seconds: 0,
  daily_reminders: ["Reply to Alice"],
  micro_physical_hints: ["Look away", "Stretch your shoulders"],
  micro_psychological_hints: ["Breathe"],
  long_hints: ["Take a walk"],
  long_social_hints: ["Call a friend"],
  sleep_hints: ["Wind down"],
} as unknown as SchedulerSettings;

function renderTab(
  update: (key: string, value: unknown) => void = () => {},
  overrides: Partial<SchedulerSettings> = {},
) {
  const supporter: SupporterStatus = {
    is_supporter: false,
    masked_key: null,
    last_validated_at: null,
  };
  return render(
    <HintsTab
      settings={{ ...baseSettings, ...overrides }}
      update={update as never}
      supporter={supporter}
    />,
  );
}

describe("HintsTab pools", () => {
  it("renders all five pools flat, without micro/long chapter headings", () => {
    renderTab();
    for (const label of [
      "Body reminders",
      "Mind reminders",
      "Solo reminders",
      "Social reminders",
      "Wind-down reminders",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    // Round-6 feedback: no "Micro breaks" / "Long breaks" headings — the
    // categories are the top-level headings now.
    expect(
      screen.queryByRole("heading", { name: "Micro breaks" }),
    ).toBeNull();
    expect(screen.queryByRole("heading", { name: "Long breaks" })).toBeNull();
    // Daily reminders section renders alongside the break reminders.
    expect(screen.getByText("Daily reminders")).toBeTruthy();
  });

  it("renders one editable row per hint, each with a delete button", () => {
    renderTab();
    expect(
      (screen.getByLabelText("Body reminders hint 1") as HTMLInputElement).value,
    ).toBe("Look away");
    expect(
      (screen.getByLabelText("Body reminders hint 2") as HTMLInputElement).value,
    ).toBe("Stretch your shoulders");
    expect(screen.getAllByLabelText(/Delete .+ from Body reminders/)).toHaveLength(2);
  });

  it("deleting a hint persists the shortened pool immediately", () => {
    const update = vi.fn();
    renderTab(update);
    fireEvent.click(screen.getAllByLabelText(/Delete .+ from Body reminders/)[0]);
    expect(update).toHaveBeenCalledWith(
      "micro_physical_hints",
      ["Stretch your shoulders"],
    );
  });

  it("adding a hint from the bottom input persists the extended pool", () => {
    const update = vi.fn();
    renderTab(update);
    fireEvent.change(screen.getByLabelText("Add a hint to Body reminders"), {
      target: { value: "Roll your wrists" },
    });
    const addButton = screen
      .getByLabelText("Add a hint to Body reminders")
      .closest(".hint-list-add")
      ?.querySelector("button");
    if (!addButton) throw new Error("no add button in the Body reminders row");
    fireEvent.click(addButton);
    expect(update).toHaveBeenCalledWith("micro_physical_hints", [
      "Look away",
      "Stretch your shoulders",
      "Roll your wrists",
    ]);
  });

  it("editing a row persists the pool on blur", () => {
    const update = vi.fn();
    renderTab(update);
    fireEvent.change(screen.getByLabelText("Body reminders hint 2"), {
      target: { value: "Stand up" },
    });
    fireEvent.blur(screen.getByLabelText("Body reminders hint 2"));
    expect(update).toHaveBeenCalledWith("micro_physical_hints", [
      "Look away",
      "Stand up",
    ]);
  });

  it("empty rows are dropped when the pool is committed", () => {
    const update = vi.fn();
    renderTab(update);
    fireEvent.change(screen.getByLabelText("Body reminders hint 1"), {
      target: { value: "   " },
    });
    fireEvent.blur(screen.getByLabelText("Body reminders hint 1"));
    expect(update).toHaveBeenCalledWith("micro_physical_hints", [
      "Stretch your shoulders",
    ]);
  });

  it("hosts the show-hint toggle and rotate interval", () => {
    const update = vi.fn();
    renderTab(update);
    fireEvent.click(checkboxForLabel("Show break reminders"));
    expect(update).toHaveBeenCalledWith("show_hint", false);

    fireEvent.click(checkboxForLabel("Rotate reminders during the break"));
    expect(update).toHaveBeenCalledWith("hint_rotate_seconds", 12);
  });
});

function checkboxForLabel(label: string): HTMLInputElement {
  const row = screen.getByText(label).closest("label");
  if (!row) throw new Error(`no label row for ${label}`);
  const box = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!box) throw new Error(`no checkbox in row ${label}`);
  return box;
}
