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
  daily_reminders: [],
  micro_physical_hints: ["Look away"],
  micro_psychological_hints: ["Breathe"],
  long_hints: ["Take a walk"],
  long_social_hints: ["Call a friend"],
  sleep_hints: ["Wind down"],
} as unknown as SchedulerSettings;

const nonSupporter: SupporterStatus = {
  is_supporter: false,
  masked_key: null,
  last_validated_at: null,
};

/**
 * Fork contract for the local supporter-gate unlock: the appearance
 * features upstream hides behind `is_supporter` render for everyone, even
 * when the (ignored) prop reports a non-supporter. See `BreaksTab`'s
 * `isSupporter` override. spec-round6 stage 4 moved the hint pools into
 * the Hints tab, so the contract is asserted there now.
 */
describe("HintsTab fork unlock", () => {
  it("shows the hint pools regardless of supporter status", () => {
    render(
      <HintsTab
        settings={baseSettings}
        update={(() => {}) as never}
        supporter={nonSupporter}
      />,
    );
    expect(
      screen.getByText("Solo reminders"),
    ).toBeTruthy();
    expect(
      screen.getByText("Social reminders"),
    ).toBeTruthy();
    expect(
      screen.getByText("Wind-down reminders"),
    ).toBeTruthy();
  });

  it("still saves edits to the unlocked micro hint pool on blur", () => {
    const update = vi.fn();
    render(
      <HintsTab
        settings={baseSettings}
        update={update as never}
        supporter={nonSupporter}
      />,
    );
    const input = screen.getByLabelText("Body reminders hint 1");
    fireEvent.change(input, { target: { value: "Roll your shoulders." } });
    fireEvent.blur(input);
    expect(update).toHaveBeenCalledWith("micro_physical_hints", [
      "Roll your shoulders.",
    ]);
  });
});
