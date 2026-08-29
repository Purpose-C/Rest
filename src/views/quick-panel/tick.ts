import type { QuickStatus } from "./types";

export function remainingFromDeadline(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.round((deadlineMs - nowMs) / 1000));
}

export function deadlinesFromStatus(
  status: QuickStatus,
  nowMs: number,
): { running: number | null; pause: number | null } {
  return {
    running:
      status.state === "running" && status.remaining_secs !== null
        ? nowMs + status.remaining_secs * 1000
        : null,
    pause:
      status.state === "paused" && status.pause_remaining_secs !== null
        ? nowMs + status.pause_remaining_secs * 1000
        : null,
  };
}

export function applyLocalTick(
  status: QuickStatus,
  deadlines: { running: number | null; pause: number | null },
  nowMs: number,
): { status: QuickStatus; hitZero: boolean } {
  if (status.state === "running" && deadlines.running !== null) {
    const next = remainingFromDeadline(deadlines.running, nowMs);
    return {
      status: { ...status, remaining_secs: next },
      hitZero: next <= 0,
    };
  }
  if (status.state === "paused" && deadlines.pause !== null) {
    const next = remainingFromDeadline(deadlines.pause, nowMs);
    return {
      status: { ...status, pause_remaining_secs: next },
      hitZero: next <= 0,
    };
  }
  return { status, hitZero: false };
}
