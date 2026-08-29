import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const listenMock = vi.hoisted(() => {
  const handlers = new Map<string, () => void>();
  return {
    handlers,
    useTauriListen: (event: string, handler: () => void) => {
      handlers.set(event, handler);
    },
  };
});

vi.mock("../../lib/use-tauri-listen", () => ({
  useTauriListen: listenMock.useTauriListen,
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);

import { formatTime, CountdownDisplay } from "./countdown-display";
import { PauseButtons } from "./pause-buttons";
import { QuickPanel } from "./index";
import {
  applyLocalTick,
  deadlinesFromStatus,
  remainingFromDeadline,
} from "./tick";
import { readWindowKind, titleForWindow } from "../../lib/window-kind";
import type { QuickStatus } from "./types";

describe("quick panel routing and titles", () => {
  it("routes ?window=quick to 'quick'", () => {
    expect(readWindowKind("?window=quick")).toBe("quick");
  });

  it("provides window title for 'quick'", () => {
    expect(titleForWindow("quick")).toBe("Entracte — Quick Panel");
  });
});

describe("formatTime", () => {
  it("formats seconds under one minute", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(59)).toBe("0:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(277)).toBe("4:37");
    expect(formatTime(599)).toBe("9:59");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3665)).toBe("1:01:05");
    expect(formatTime(7325)).toBe("2:02:05");
  });
});

describe("CountdownDisplay", () => {
  it("renders countdown time and subtitle when running", () => {
    const status: QuickStatus = {
      state: "running",
      remaining_secs: 277,
      pause_remaining_secs: null,
    };
    render(<CountdownDisplay status={status} />);
    expect(screen.getByText("4:37")).toBeDefined();
    expect(screen.getByText("Next break")).toBeDefined();
    expect(screen.getByText("4:37").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Next break").getAttribute("aria-live")).toBe(
      "polite",
    );
  });

  it("renders paused status when paused", () => {
    const status: QuickStatus = {
      state: "paused",
      remaining_secs: null,
      pause_remaining_secs: 900,
    };
    render(<CountdownDisplay status={status} />);
    expect(screen.getByText("15:00")).toBeDefined();
    expect(screen.getByText("15:00").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Paused").getAttribute("aria-live")).toBe("polite");
  });

  it("renders special state labels", () => {
    const { rerender } = render(
      <CountdownDisplay
        status={{
          state: "on_break",
          remaining_secs: null,
          pause_remaining_secs: null,
        }}
      />,
    );
    expect(screen.getByText("On break")).toBeDefined();
    expect(screen.getByText("On break").getAttribute("aria-live")).toBe(
      "polite",
    );

    rerender(
      <CountdownDisplay
        status={{
          state: "bedtime",
          remaining_secs: null,
          pause_remaining_secs: null,
        }}
      />,
    );
    expect(screen.getByText("Bedtime")).toBeDefined();
  });
});

describe("PauseButtons", () => {
  it("renders 4 pause buttons plus More when running", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onMore = vi.fn();
    const status: QuickStatus = {
      state: "running",
      remaining_secs: 300,
      pause_remaining_secs: null,
    };

    render(
      <PauseButtons
        status={status}
        onPause={onPause}
        onResume={onResume}
        onMore={onMore}
      />,
    );

    const btn15m = screen.getByText("15m");
    fireEvent.click(btn15m);
    expect(onPause).toHaveBeenCalledWith(15 * 60);

    const btnIndef = screen.getByText("Indefinitely");
    fireEvent.click(btnIndef);
    expect(onPause).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByRole("button", { name: "More…" }));
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it("renders resume button when paused and triggers onResume", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onMore = vi.fn();
    const status: QuickStatus = {
      state: "paused",
      remaining_secs: null,
      pause_remaining_secs: 600,
    };

    render(
      <PauseButtons
        status={status}
        onPause={onPause}
        onResume={onResume}
        onMore={onMore}
      />,
    );

    const resumeBtn = screen.getByText("Resume");
    fireEvent.click(resumeBtn);
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});

describe("local countdown tick", () => {
  const running: QuickStatus = {
    state: "running",
    remaining_secs: 10,
    pause_remaining_secs: null,
  };

  it("uses wall-clock elapsed so a delayed tick jumps rather than drifting by 1", () => {
    const now = 1_000_000;
    const deadlines = deadlinesFromStatus(running, now);
    expect(remainingFromDeadline(deadlines.running!, now + 2500)).toBe(8);
    const jumped = applyLocalTick(running, deadlines, now + 5000);
    expect(jumped.status.remaining_secs).toBe(5);
    expect(jumped.hitZero).toBe(false);
  });

  it("signals hitZero when the deadline has passed", () => {
    const now = 1_000_000;
    const deadlines = deadlinesFromStatus(running, now);
    const done = applyLocalTick(running, deadlines, now + 10_000);
    expect(done.status.remaining_secs).toBe(0);
    expect(done.hitZero).toBe(true);
  });

  it("ticks pause remaining from the pause deadline", () => {
    const paused: QuickStatus = {
      state: "paused",
      remaining_secs: null,
      pause_remaining_secs: 90,
    };
    const now = 5_000;
    const deadlines = deadlinesFromStatus(paused, now);
    const next = applyLocalTick(paused, deadlines, now + 1000);
    expect(next.status.pause_remaining_secs).toBe(89);
  });
});

describe("QuickPanel component integration", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    listenMock.handlers.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches status on mount and displays countdown", async () => {
    invokeMock.mockResolvedValueOnce({
      state: "running",
      remaining_secs: 277,
      pause_remaining_secs: null,
    });

    render(<QuickPanel />);
    expect(invokeMock).toHaveBeenCalledWith("get_quick_status");

    await waitFor(() => {
      expect(screen.getByText("4:37")).toBeDefined();
    });
  });

  it("triggers pause IPC when a pause button is clicked", async () => {
    invokeMock.mockResolvedValue({
      state: "running",
      remaining_secs: 300,
      pause_remaining_secs: null,
    });

    render(<QuickPanel />);

    await waitFor(() => {
      expect(screen.getByText("15m")).toBeDefined();
    });

    fireEvent.click(screen.getByText("15m"));

    expect(invokeMock).toHaveBeenCalledWith("pause", { durationSecs: 900 });
  });

  it("opens the full pause picker from More", async () => {
    invokeMock.mockResolvedValue({
      state: "running",
      remaining_secs: 300,
      pause_remaining_secs: null,
    });

    render(<QuickPanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "More…" })).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: "More…" }));

    expect(invokeMock).toHaveBeenCalledWith("show_pause_window");
  });

  it("triggers resume IPC when resume button is clicked", async () => {
    invokeMock.mockResolvedValue({
      state: "paused",
      remaining_secs: null,
      pause_remaining_secs: 900,
    });

    render(<QuickPanel />);

    await waitFor(() => {
      expect(screen.getByText("Resume")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Resume"));

    expect(invokeMock).toHaveBeenCalledWith("resume");
  });

  it("decrements remaining seconds locally without re-fetching", async () => {
    vi.useFakeTimers();
    invokeMock.mockResolvedValue({
      state: "running",
      remaining_secs: 10,
      pause_remaining_secs: null,
    });

    render(<QuickPanel />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("0:10")).toBeDefined();
    expect(invokeMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText("0:09")).toBeDefined();
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it("decrements a timed pause from the deadline", async () => {
    vi.useFakeTimers();
    invokeMock.mockResolvedValue({
      state: "paused",
      remaining_secs: null,
      pause_remaining_secs: 10,
    });

    render(<QuickPanel />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("0:10")).toBeDefined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText("0:09")).toBeDefined();
  });

  it("refreshes from the backend when the local countdown hits zero", async () => {
    vi.useFakeTimers();
    invokeMock
      .mockResolvedValueOnce({
        state: "running",
        remaining_secs: 1,
        pause_remaining_secs: null,
      })
      .mockResolvedValueOnce({
        state: "on_break",
        remaining_secs: null,
        pause_remaining_secs: null,
      });

    render(<QuickPanel />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("0:01")).toBeDefined();
    expect(invokeMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(invokeMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes when pause:changed is emitted", async () => {
    invokeMock
      .mockResolvedValueOnce({
        state: "running",
        remaining_secs: 60,
        pause_remaining_secs: null,
      })
      .mockResolvedValueOnce({
        state: "paused",
        remaining_secs: null,
        pause_remaining_secs: 900,
      });

    render(<QuickPanel />);
    await waitFor(() => {
      expect(screen.getByText("1:00")).toBeDefined();
    });

    act(() => {
      listenMock.handlers.get("pause:changed")?.();
    });

    await waitFor(() => {
      expect(screen.getByText("Resume")).toBeDefined();
    });
    expect(invokeMock).toHaveBeenCalledTimes(2);
  });

  it("stays mounted if get_quick_status fails", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    invokeMock.mockRejectedValue(new Error("backend down"));
    render(<QuickPanel />);
    await waitFor(() => {
      expect(err).toHaveBeenCalled();
    });
    expect(screen.getByText("15m")).toBeDefined();
    err.mockRestore();
  });
});
