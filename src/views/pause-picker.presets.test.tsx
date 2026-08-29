// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

import { invoke } from "@tauri-apps/api/core";
import { PausePicker } from "./pause-picker";

const invokeMock = vi.mocked(invoke);

function mockBackend() {
  invokeMock.mockImplementation(async (cmd: string) => {
    if (cmd === "get_locale") return "en-US";
    if (cmd === "get_settings") return { clock_format: "24h" };
    if (cmd === "seconds_until_tomorrow_morning") return 8 * 60 * 60;
    return undefined;
  });
}

afterEach(() => {
  cleanup();
  invokeMock.mockReset();
});

describe("PausePicker presets", () => {
  it.each([
    ["2 hours", 2 * 60 * 60],
    ["4 hours", 4 * 60 * 60],
  ])("pauses for the %s preset, then closes", async (label, durationSecs) => {
    mockBackend();
    render(<PausePicker />);

    fireEvent.click(screen.getByRole("button", { name: label }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith("pause", { durationSecs }),
    );
    expect(invokeMock).toHaveBeenCalledWith("close_pause_window");
  });

  it("gets the tomorrow at 6 AM duration from the backend", async () => {
    mockBackend();
    render(<PausePicker />);

    fireEvent.click(screen.getByRole("button", { name: "Tomorrow at 6 AM" }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("seconds_until_tomorrow_morning");
      expect(invokeMock).toHaveBeenCalledWith("pause", {
        durationSecs: 8 * 60 * 60,
      });
      expect(invokeMock).toHaveBeenCalledWith("close_pause_window");
    });
  });
});
