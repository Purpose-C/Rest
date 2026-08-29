import { t } from "../../../lib/i18n";
import {
  KIND_ORDER,
  groupSuppressionsByReason,
} from "../../../lib/stats-format";
import type { SuppressionByKind } from "../types";

function kindLabel(kind: string): string {
  if (kind === "micro") return t("suppressionBars.kindMicro");
  if (kind === "long") return t("suppressionBars.kindLong");
  if (kind === "sleep") return t("suppressionBars.kindSleep");
  return kind;
}

export function SuppressionBars({ rows }: { rows: SuppressionByKind[] }) {
  const grouped = groupSuppressionsByReason(rows);
  if (grouped.length === 0) return null;
  const max = Math.max(1, ...grouped.map((g) => g.total));
  const kindsPresent = Array.from(
    new Set(grouped.flatMap((g) => g.segments.map((s) => s.kind))),
  ).sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b));
  return (
    <div
      className="suppression-bars"
      role="table"
      aria-label={t("suppressionBars.tableAria")}
    >
      <div className="suppression-legend" role="presentation">
        {kindsPresent.map((kind) => (
          <span key={kind} className="suppression-legend-item" data-kind={kind}>
            <span className="suppression-swatch" aria-hidden="true" />
            {kindLabel(kind)}
          </span>
        ))}
      </div>
      {grouped.map((g) => {
        const widthPct = (g.total / max) * 100;
        return (
          <div key={g.reason} className="suppression-row" role="row">
            <span className="suppression-label" role="rowheader">
              {g.label}
            </span>
            <div
              className="suppression-track"
              role="cell"
              aria-label={t("suppressionBars.trackAria", {
                label: g.label,
                total: g.total,
              })}
            >
              <div
                className="suppression-bar"
                ref={(el) => {
                  el?.style.setProperty("--bar-width", `${widthPct}%`);
                }}
              >
                {g.segments.map((s) => {
                  const segPct = (s.count / g.total) * 100;
                  return (
                    <div
                      key={s.kind}
                      className="suppression-seg"
                      data-kind={s.kind}
                      ref={(el) => {
                        el?.style.setProperty("--seg-width", `${segPct}%`);
                      }}
                      title={t("suppressionBars.segTitle", {
                        kind: kindLabel(s.kind),
                        label: g.label,
                        count: s.count,
                      })}
                    />
                  );
                })}
              </div>
            </div>
            <span className="suppression-total" role="cell">
              {g.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
