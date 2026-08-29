import { t } from "../../lib/i18n";
import type { QuickStatus } from "./types";

export function PauseButtons({
  status,
  onPause,
  onResume,
  onMore,
}: {
  status: QuickStatus;
  onPause: (secs: number | null) => void;
  onResume: () => void;
  onMore: () => void;
}) {
  if (status.state === "paused") {
    return (
      <div className="quick-panel-actions">
        <button
          type="button"
          className="quick-panel-btn primary full-width"
          onClick={onResume}
        >
          {t("quickPanel.resume")}
        </button>
      </div>
    );
  }

  return (
    <div className="quick-panel-actions">
      <div className="quick-panel-actions-grid">
        <button
          type="button"
          className="quick-panel-btn"
          onClick={() => onPause(15 * 60)}
        >
          {t("quickPanel.pause15m")}
        </button>
        <button
          type="button"
          className="quick-panel-btn"
          onClick={() => onPause(30 * 60)}
        >
          {t("quickPanel.pause30m")}
        </button>
        <button
          type="button"
          className="quick-panel-btn"
          onClick={() => onPause(60 * 60)}
        >
          {t("quickPanel.pause1h")}
        </button>
        <button
          type="button"
          className="quick-panel-btn"
          onClick={() => onPause(null)}
        >
          {t("quickPanel.pauseIndef")}
        </button>
      </div>
      <button
        type="button"
        className="quick-panel-btn quick-panel-more"
        onClick={onMore}
      >
        {t("quickPanel.more")}
      </button>
    </div>
  );
}
