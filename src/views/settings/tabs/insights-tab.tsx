import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ask as askDialog,
  open as openDialog,
  save as saveDialog,
} from "@tauri-apps/plugin-dialog";
import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import {
  deltaDirection,
  deltaPct,
  dismissalRate,
  formatHoursMinutes,
} from "../../../lib/stats-format";
import { localDateString } from "../../../lib/time";
import { HourHistogram } from "../components/hour-histogram";
import { Heatmap } from "../components/heatmap";
import { PostponeDonut } from "../components/postpone-donut";
import { SuppressionBars } from "../components/suppression-bars";
import { WeekdayHistogram } from "../components/weekday-histogram";
import type { UseStats } from "../hooks/use-stats";
import type { StatsRange } from "../types";
import { downloadCsv } from "../utils";

function DeltaChip({
  curr,
  prev,
  goodDirection = "up",
}: {
  curr: number;
  prev: number;
  goodDirection?: "up" | "down";
}) {
  const dir = deltaDirection(curr, prev);
  const tone = dir === "flat" ? "flat" : dir === goodDirection ? "up" : "down";
  return (
    <span
      className={`delta-chip ${tone}`}
      title={t("insights.deltaChipPrev", { prev })}
    >
      {deltaPct(curr, prev)}
    </span>
  );
}

export function InsightsTab({ stats }: { stats: UseStats }) {
  // Destructure to stable callback references — `useStats` returns a fresh
  // object every parent render, so `[range, stats]` as effect deps used to
  // fire on every render and re-trigger `refreshDigest` indefinitely.
  const { stats: session, digest, digestLoading, reset, refreshDigest } = stats;
  const [range, setRange] = useState<StatsRange>("week");
  const [backupStatus, setBackupStatus] = useState<{
    kind: "ok" | "err";
    message: string;
  } | null>(null);

  useEffect(() => {
    refreshDigest(range);
  }, [range, refreshDigest]);

  const intensity = useMemo(() => {
    const total = session.taken + session.skipped;
    if (total === 0) return 0;
    return Math.round((session.skipped / total) * 100);
  }, [session.taken, session.skipped]);

  const onExportCsv = async () => {
    try {
      const csv = await invoke<string>("export_stats_csv");
      downloadCsv(`entracte-stats-${localDateString()}.csv`, csv);
    } catch (e) {
      console.error("export failed", e);
    }
  };

  const onClearLog = async () => {
    const confirmed = await askDialog(t("insights.clearPrompt"), {
      title: t("insights.clearTitle"),
      kind: "warning",
      okLabel: t("insights.clearOk"),
      cancelLabel: t("insights.cancel"),
    });
    if (!confirmed) return;
    try {
      await invoke("clear_event_log");
      await refreshDigest(range);
    } catch (e) {
      console.error("clear failed", e);
    }
  };

  const onExportBackup = async () => {
    setBackupStatus(null);
    try {
      const path = await saveDialog({
        defaultPath: `entracte-backup-${localDateString()}.json`,
        filters: [{ name: t("insights.backupFilter"), extensions: ["json"] }],
      });
      if (typeof path !== "string" || !path) return;
      await invoke("export_backup_to_path", { path });
      setBackupStatus({
        kind: "ok",
        message: t("insights.backupWritten", { path }),
      });
    } catch (e) {
      console.error("backup export failed", e);
      setBackupStatus({
        kind: "err",
        message: t("insights.backupExportFailed", { error: String(e) }),
      });
    }
  };

  const onImportBackup = async () => {
    setBackupStatus(null);
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: [{ name: t("insights.backupFilter"), extensions: ["json"] }],
      });
      if (typeof path !== "string" || !path) return;
      const confirmed = await askDialog(t("insights.importPrompt"), {
        title: t("insights.importTitle"),
        kind: "warning",
        okLabel: t("insights.importOk"),
        cancelLabel: t("insights.cancel"),
      });
      if (!confirmed) return;
      await invoke("import_backup_from_path", { path });
      await refreshDigest(range);
      setBackupStatus({ kind: "ok", message: t("insights.backupImported") });
    } catch (e) {
      console.error("backup import failed", e);
      setBackupStatus({
        kind: "err",
        message: t("insights.backupImportFailed", { error: String(e) }),
      });
    }
  };

  return (
    <>
      <CollapsibleSection
        id="settings-insights"
        title={t("insights.thisSession")}
      >
        <p className="placeholder">{t("insights.thisSessionDesc")}</p>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-value">{session.taken}</span>
            <span className="stat-label">{t("insights.taken")}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{session.skipped}</span>
            <span className="stat-label">{t("insights.skipped")}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{session.postponed}</span>
            <span className="stat-label">{t("insights.postponed")}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{intensity}%</span>
            <span className="stat-label">{t("insights.skipRate")}</span>
          </div>
        </div>
        <div className="actions inline">
          <button className="secondary" onClick={reset}>
            {t("insights.resetCounters")}
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-insights-range"
        title={t("insights.range")}
      >
        <div className="range-toggle">
          <button
            className={range === "week" ? "active" : "secondary"}
            onClick={() => setRange("week")}
          >
            {t("insights.pastWeek")}
          </button>
          <button
            className={range === "month" ? "active" : "secondary"}
            onClick={() => setRange("month")}
          >
            {t("insights.pastMonth")}
          </button>
        </div>
      </CollapsibleSection>

      {!digest || digestLoading ? (
        <p className="placeholder">{t("insights.loadingStats")}</p>
      ) : (
        <>
          <CollapsibleSection
            id="settings-insights-summary"
            title={t("insights.summary")}
          >
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-card-value">
                  {digest.micro_taken + digest.long_taken}
                  <DeltaChip
                    curr={digest.micro_taken + digest.long_taken}
                    prev={digest.previous.breaks_taken}
                  />
                </span>
                <span className="stat-card-label">
                  {t("insights.breaksTaken")}
                </span>
                <span className="stat-card-sub">
                  {t("insights.breaksTakenSub", {
                    micro: digest.micro_taken,
                    long: digest.long_taken,
                  })}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card-value">
                  {dismissalRate(
                    digest.micro_taken + digest.long_taken,
                    digest.micro_dismissed + digest.long_dismissed,
                  )}
                  <DeltaChip
                    curr={digest.micro_dismissed + digest.long_dismissed}
                    prev={digest.previous.breaks_dismissed}
                    goodDirection="down"
                  />
                </span>
                <span className="stat-card-label">
                  {t("insights.dismissalRate")}
                </span>
                <span className="stat-card-sub">
                  {t("insights.dismissalRateSub", {
                    dismissed: digest.micro_dismissed + digest.long_dismissed,
                    postponed: digest.postponed_total,
                  })}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card-value">
                  {formatHoursMinutes(digest.pause_total_secs)}
                </span>
                <span className="stat-card-label">
                  {t("insights.timePaused")}
                </span>
                <span className="stat-card-sub">
                  {t("insights.pauseCountSub", {
                    count: digest.pause_count,
                    suffix: digest.pause_count === 1 ? "" : "s",
                  })}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card-value">
                  {digest.suppressions[0]?.count ?? 0}
                </span>
                <span className="stat-card-label">
                  {t("insights.topSuppression")}
                </span>
                <span className="stat-card-sub">
                  {digest.suppressions[0]?.label ?? t("insights.none")}
                </span>
              </div>
            </div>
            <p className="stat-card-sub">
              {t("insights.deltaExplanation", {
                days: range === "month" ? 30 : 7,
              })}
            </p>
          </CollapsibleSection>

          {digest.postpone_follow_through.total > 0 && (
            <>
              <CollapsibleSection
                id="settings-insights-postpone-follow-through"
                title={t("insights.postponeFollowThrough")}
              >
                <p className="stat-card-sub">
                  {t("insights.postponeFollowThroughDesc")}
                </p>
                <PostponeDonut data={digest.postpone_follow_through} />
              </CollapsibleSection>
            </>
          )}

          {digest.suppressions_by_kind.length > 0 && (
            <>
              <CollapsibleSection
                id="settings-insights-suppressions"
                title={t("insights.breaksSuppressedBy")}
              >
                <SuppressionBars rows={digest.suppressions_by_kind} />
              </CollapsibleSection>
            </>
          )}

          <CollapsibleSection
            id="settings-insights-weekday"
            title={t("insights.byWeekday")}
          >
            <WeekdayHistogram days={digest.by_weekday} />
            <p className="stat-card-sub">{t("insights.byWeekdayDesc")}</p>
          </CollapsibleSection>

          <CollapsibleSection
            id="settings-insights-time-of-day"
            title={t("insights.timeOfDay")}
          >
            <HourHistogram values={digest.by_hour} />
          </CollapsibleSection>

          <CollapsibleSection
            id="settings-insights-past-weeks"
            title={t("insights.past12Weeks")}
          >
            <Heatmap days={digest.by_day} />
          </CollapsibleSection>

          <CollapsibleSection
            id="settings-manage-data"
            title={t("insights.manageData")}
          >
            <div className="actions inline">
              <button onClick={onExportCsv}>{t("insights.exportCsv")}</button>
              <button className="secondary" onClick={onExportBackup}>
                {t("insights.exportBackup")}
              </button>
              <button className="secondary" onClick={onImportBackup}>
                {t("insights.importBackup")}
              </button>
              <button className="secondary" onClick={onClearLog}>
                {t("insights.clearHistory")}
              </button>
            </div>
            <p className="stat-card-sub">
              {t("insights.backupSecurityNotice")}
            </p>
            {backupStatus && (
              <p
                className={
                  backupStatus.kind === "err" ? "placeholder" : "stat-card-sub"
                }
                role={backupStatus.kind === "err" ? "alert" : "status"}
              >
                {backupStatus.message}
              </p>
            )}
          </CollapsibleSection>
        </>
      )}
    </>
  );
}
