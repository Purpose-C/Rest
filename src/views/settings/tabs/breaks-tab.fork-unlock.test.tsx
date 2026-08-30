import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);
afterEach(() => {
  invokeMock.mockReset();
  invokeMock.mockResolvedValue(undefined);
});

const { BreaksTab } = await import("./breaks-tab");
import type { SchedulerSettings, SupporterStatus } from "../types";

const baseSettings = {
  overlay_opacity: 0.92,
  overlay_font_scale: 1,
  overlay_color: "dark",
  overlay_custom_rgb: "20, 24, 32",
  overlay_high_contrast: false,
  break_health_enabled: false,
  morning_chore_prompt_enabled: true,
  show_hint: true,
  hint_rotate_seconds: 0,
  show_current_time: true,
  monitor_placement: "primary",
  micro_enabled: true,
  long_enabled: true,
  micro_break_mode: "overlay",
  long_break_mode: "overlay",
  sound_volume: 0.5,
  micro_sound: { mode: "off", sound_id: "" },
  long_sound: { mode: "off", sound_id: "" },
  strict_mode: false,
  postpone_enabled: true,
  micro_postpone_enabled: true,
  long_postpone_enabled: true,
  micro_skip_enabled: true,
  long_skip_enabled: true,
  micro_manual_finish: false,
  long_manual_finish: false,
  micro_enforceable: false,
  long_enforceable: false,
  postpone_escalation_enabled: false,
  postpone_escalation_step_secs: 120,
  postpone_max_count: 3,
  postpone_minutes: 5,
  micro_hint_mix: "both",
  long_hint_mix: "both",
  micro_physical_hints: ["Look away"],
  micro_psychological_hints: ["Breathe"],
  long_hints: ["Take a walk"],
  long_social_hints: ["Call a friend"],
  sleep_hints: ["Wind down"],
  micro_routine: "",
  long_routine: "",
  micro_routine_categories: [],
  long_routine_categories: [],
  micro_routine_max_difficulty: "active",
  long_routine_max_difficulty: "active",
  custom_routines: [],
  custom_css: "",
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
 * `isSupporter` override. Replaces the upstream case asserting these are
 * hidden from free users, which the unlock voids.
 */
describe("BreaksTab fork unlock", () => {
  it("shows the hint pools and Custom CSS regardless of supporter status", () => {
    render(
      <BreaksTab
        settings={baseSettings}
        update={(() => {}) as never}
        supporter={nonSupporter}
        reload={async () => {}}
      />,
    );
    expect(
      screen.getByText("Solo (stretch, fresh air, snack, tidy)"),
    ).toBeTruthy();
    expect(
      screen.getByText("Social (call, walk together, share a coffee)"),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Bedtime" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Custom CSS" })).toBeTruthy();
  });

  it("still saves edits to the unlocked micro hint pool on blur", async () => {
    const update = vi.fn();
    render(
      <BreaksTab
        settings={baseSettings}
        update={update as never}
        supporter={nonSupporter}
        reload={async () => {}}
      />,
    );
    const textarea = screen.getByLabelText(
      "Physical (stretches, eye rest, movement)",
    );
    fireEvent.change(textarea, { target: { value: "Roll your shoulders." } });
    fireEvent.blur(textarea);
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith("micro_physical_hints", [
        "Roll your shoulders.",
      ]),
    );
  });
});
