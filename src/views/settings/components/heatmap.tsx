import { t } from "../../../lib/i18n";
import {
  buildHeatmapWeeks,
  heatmapLevel,
  heatmapMonthLabels,
} from "../../../lib/stats-format";
import type { DayBucket } from "../types";

export function Heatmap({ days }: { days: DayBucket[] }) {
  const max = Math.max(1, ...days.map((d) => d.taken));
  const weeks = buildHeatmapWeeks(days);
  const monthByCol = new Map(
    heatmapMonthLabels(weeks).map((m) => [m.col, m.label]),
  );
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-months" aria-hidden="true">
        {weeks.map((_, wi) => (
          <span key={wi} className="heatmap-month-slot">
            {monthByCol.get(wi) ?? ""}
          </span>
        ))}
      </div>
      <div className="heatmap-days" aria-hidden="true">
        <span className="heatmap-day-mon">{t("stats.heatmapDay.mon")}</span>
        <span className="heatmap-day-wed">{t("stats.heatmapDay.wed")}</span>
        <span className="heatmap-day-fri">{t("stats.heatmapDay.fri")}</span>
      </div>
      <div
        className="heatmap"
        role="img"
        aria-label={t("stats.heatmapAria")}
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-week">
            {week.map((day, di) => (
              <div
                key={di}
                className={day ? "heatmap-cell" : "heatmap-cell empty"}
                data-level={day ? heatmapLevel(day.taken, max) : 0}
                title={
                  day
                    ? t("stats.heatmapTooltip", {
                        date: day.date,
                        taken: day.taken,
                        dismissed: day.dismissed,
                      })
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend" aria-hidden="true">
        <span className="heatmap-legend-label">{t("stats.less")}</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span key={lvl} className="heatmap-cell" data-level={lvl} />
        ))}
        <span className="heatmap-legend-label">{t("stats.more")}</span>
      </div>
    </div>
  );
}
