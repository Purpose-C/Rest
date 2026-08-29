export type QuickPanelState =
  | "running"
  | "paused"
  | "bedtime"
  | "on_break"
  | "suppressed"
  | "idle"
  | "disabled";

export interface QuickStatus {
  state: QuickPanelState;
  remaining_secs: number | null;
  pause_remaining_secs: number | null;
}
