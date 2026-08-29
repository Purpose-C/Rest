import { t } from "../../lib/i18n";
import type { QuickStatus } from "./types";

export function formatTime(secs: number): string {
  if (secs < 0) secs = 0;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type StatusKey =
  | "quickPanel.onBreak"
  | "quickPanel.bedtime"
  | "quickPanel.suppressed"
  | "quickPanel.disabled"
  | "quickPanel.idle";

const statusTextMap: Partial<Record<QuickStatus["state"], StatusKey>> = {
  on_break: "quickPanel.onBreak",
  bedtime: "quickPanel.bedtime",
  suppressed: "quickPanel.suppressed",
  disabled: "quickPanel.disabled",
  idle: "quickPanel.idle",
};

export function CountdownDisplay({ status }: { status: QuickStatus }) {
  if (status.state === "paused") {
    const text =
      status.pause_remaining_secs !== null
        ? formatTime(status.pause_remaining_secs)
        : t("quickPanel.paused");
    return (
      <div className="quick-panel-countdown">
        <div className="quick-panel-time" aria-hidden="true">
          {text}
        </div>
        <div className="quick-panel-subtitle" aria-live="polite">
          {t("quickPanel.pausedLabel")}
        </div>
      </div>
    );
  }

  const statusKey = statusTextMap[status.state];
  if (statusKey) {
    const label = t(statusKey);
    return (
      <div className="quick-panel-countdown">
        <div className="quick-panel-status-text" aria-live="polite">
          {label}
        </div>
      </div>
    );
  }

  const timeStr =
    status.remaining_secs !== null ? formatTime(status.remaining_secs) : "--:--";
  return (
    <div className="quick-panel-countdown">
      <div className="quick-panel-time" aria-hidden="true">
        {timeStr}
      </div>
      <div className="quick-panel-subtitle" aria-live="polite">
        {t("quickPanel.nextBreak")}
      </div>
    </div>
  );
}
