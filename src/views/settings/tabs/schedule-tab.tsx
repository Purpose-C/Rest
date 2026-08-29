import { invoke } from "@tauri-apps/api/core";
import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import { formatClockList, parseClockList } from "../../../lib/clock-list";
import { useLocalDraft } from "../../../lib/use-local-draft";
import { formatScreenTime, progressPercent } from "../../../lib/screen-time";
import { Advanced } from "../components/advanced";
import { CheckboxRow, NumberRow, TimeRow } from "../components/rows";
import { WeekdayToggle } from "../components/weekday-toggle";
import type { UseSettings } from "../hooks/use-settings";
import { useScreenTime } from "../hooks/use-screen-time";
import type { SchedulerSettings } from "../types";

export function ScheduleTab({
  settings,
  update,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
}) {
  const [microFixedTimesText, setMicroFixedTimesText] = useLocalDraft(
    () => formatClockList(settings.micro_fixed_times, settings.clock_format),
    [settings.micro_fixed_times, settings.clock_format],
  );
  const [longFixedTimesText, setLongFixedTimesText] = useLocalDraft(
    () => formatClockList(settings.long_fixed_times, settings.clock_format),
    [settings.long_fixed_times, settings.clock_format],
  );

  const screenTime = useScreenTime(settings.daily_screen_time_enabled);

  return (
    <>
      <CollapsibleSection
        id="settings-active-hours"
        title={t("schedule.activeHours")}
      >
        <CheckboxRow
          label={t("schedule.onlyWithinHours")}
          value={settings.work_window_enabled}
          onChange={(v) => update("work_window_enabled", v)}
          tip={t("schedule.onlyWithinHoursTip")}
        />
        <TimeRow
          label={t("schedule.start")}
          value={settings.work_start_minutes}
          onChange={(v) => update("work_start_minutes", v)}
          disabled={!settings.work_window_enabled}
          format={settings.clock_format}
        />
        <TimeRow
          label={t("schedule.end")}
          value={settings.work_end_minutes}
          onChange={(v) => update("work_end_minutes", v)}
          disabled={!settings.work_window_enabled}
          format={settings.clock_format}
        />
        <WeekdayToggle
          label={t("schedule.onTheseDays")}
          mask={settings.work_days_mask}
          onChange={(v) => update("work_days_mask", v)}
          disabled={!settings.work_window_enabled}
          tip={t("schedule.onTheseDaysTip")}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-micro-breaks"
        title={t("schedule.microBreaks")}
      >
        <CheckboxRow
          label={t("schedule.enableMicro")}
          value={settings.micro_enabled}
          onChange={(v) => update("micro_enabled", v)}
          tip={t("schedule.enableMicroTip")}
        />
        {settings.micro_enabled && (
          <>
            <label className="row">
              <span>{t("schedule.scheduleMode")}</span>
              <select
                value={settings.micro_schedule_mode}
                onChange={(e) =>
                  update(
                    "micro_schedule_mode",
                    e.target.value as typeof settings.micro_schedule_mode,
                  )
                }
              >
                <option value="interval">{t("schedule.modeInterval")}</option>
                <option value="fixed">{t("schedule.modeFixed")}</option>
                <option value="both">{t("schedule.modeBoth")}</option>
              </select>
            </label>
            {(settings.micro_schedule_mode === "interval" ||
              settings.micro_schedule_mode === "both") && (
              <NumberRow
                label={t("schedule.intervalMinutes")}
                value={settings.micro_interval_secs}
                min={1}
                multiplier={60}
                onChange={(v) => update("micro_interval_secs", v)}
              />
            )}
            {(settings.micro_schedule_mode === "fixed" ||
              settings.micro_schedule_mode === "both") && (
              <label className="row">
                <span>
                  {t("schedule.fixedTimes", {
                    format:
                      settings.clock_format === "12h" ? "h:mm AM/PM" : "hh:mm",
                  })}
                </span>
                <input
                  type="text"
                  value={microFixedTimesText}
                  onChange={(e) => setMicroFixedTimesText(e.target.value)}
                  onBlur={() => {
                    const parsed = parseClockList(microFixedTimesText);
                    setMicroFixedTimesText(
                      formatClockList(parsed, settings.clock_format),
                    );
                    update("micro_fixed_times", parsed);
                  }}
                />
              </label>
            )}
            <NumberRow
              label={t("schedule.durationSeconds")}
              value={settings.micro_duration_secs}
              min={5}
              multiplier={1}
              onChange={(v) => update("micro_duration_secs", v)}
            />
            <Advanced label={t("schedule.advancedMicroTiming")}>
              <NumberRow
                label={t("schedule.idleResetMinutes")}
                value={settings.micro_idle_reset_secs}
                min={1}
                multiplier={60}
                onChange={(v) => update("micro_idle_reset_secs", v)}
                tip={t("schedule.idleResetTip")}
              />
            </Advanced>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-long-breaks"
        title={t("schedule.longBreaks")}
      >
        <CheckboxRow
          label={t("schedule.enableLong")}
          value={settings.long_enabled}
          onChange={(v) => update("long_enabled", v)}
          tip={t("schedule.enableLongTip")}
        />
        {settings.long_enabled && (
          <>
            <label className="row">
              <span>{t("schedule.scheduleMode")}</span>
              <select
                value={settings.long_schedule_mode}
                onChange={(e) =>
                  update(
                    "long_schedule_mode",
                    e.target.value as typeof settings.long_schedule_mode,
                  )
                }
              >
                <option value="interval">{t("schedule.modeInterval")}</option>
                <option value="fixed">{t("schedule.modeFixed")}</option>
                <option value="both">{t("schedule.modeBoth")}</option>
              </select>
            </label>
            {(settings.long_schedule_mode === "interval" ||
              settings.long_schedule_mode === "both") && (
              <NumberRow
                label={t("schedule.intervalMinutes")}
                value={settings.long_interval_secs}
                min={5}
                multiplier={60}
                onChange={(v) => update("long_interval_secs", v)}
              />
            )}
            {(settings.long_schedule_mode === "fixed" ||
              settings.long_schedule_mode === "both") && (
              <label className="row">
                <span>
                  {t("schedule.fixedTimes", {
                    format:
                      settings.clock_format === "12h" ? "h:mm AM/PM" : "hh:mm",
                  })}
                </span>
                <input
                  type="text"
                  value={longFixedTimesText}
                  onChange={(e) => setLongFixedTimesText(e.target.value)}
                  onBlur={() => {
                    const parsed = parseClockList(longFixedTimesText);
                    setLongFixedTimesText(
                      formatClockList(parsed, settings.clock_format),
                    );
                    update("long_fixed_times", parsed);
                  }}
                />
              </label>
            )}
            <NumberRow
              label={t("schedule.durationMinutes")}
              value={settings.long_duration_secs}
              min={1}
              multiplier={60}
              onChange={(v) => update("long_duration_secs", v)}
            />
            <Advanced label={t("schedule.advancedLongTiming")}>
              <NumberRow
                label={t("schedule.idleResetMinutes")}
                value={settings.long_idle_reset_secs}
                min={1}
                multiplier={60}
                onChange={(v) => update("long_idle_reset_secs", v)}
                tip={t("schedule.idleResetTip")}
              />
            </Advanced>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection id="settings-bedtime" title={t("schedule.bedtime")}>
        <CheckboxRow
          label={t("schedule.persistentSleepReminders")}
          value={settings.bedtime_enabled}
          onChange={(v) => update("bedtime_enabled", v)}
          tip={t("schedule.persistentSleepRemindersTip")}
        />
        {settings.bedtime_enabled && (
          <>
            <TimeRow
              label={t("schedule.start")}
              value={settings.bedtime_start_minutes}
              onChange={(v) => update("bedtime_start_minutes", v)}
              format={settings.clock_format}
            />
            <TimeRow
              label={t("schedule.end")}
              value={settings.bedtime_end_minutes}
              onChange={(v) => update("bedtime_end_minutes", v)}
              format={settings.clock_format}
            />
            <NumberRow
              label={t("schedule.reminderIntervalMinutes")}
              value={settings.bedtime_interval_secs}
              min={1}
              multiplier={60}
              onChange={(v) => update("bedtime_interval_secs", v)}
            />
            <NumberRow
              label={t("schedule.reminderDurationSeconds")}
              value={settings.bedtime_duration_secs}
              min={5}
              multiplier={1}
              onChange={(v) => update("bedtime_duration_secs", v)}
            />
            <div className="actions inline">
              <button
                onClick={() =>
                  invoke("trigger_test_break", {
                    kind: "sleep",
                    durationSecs: 15,
                  })
                }
              >
                {t("schedule.testNow15s")}
              </button>
            </div>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-screen-time"
        title={t("schedule.dailyScreenTime")}
      >
        <CheckboxRow
          label={t("schedule.remindWrapUp")}
          value={settings.daily_screen_time_enabled}
          onChange={(v) => update("daily_screen_time_enabled", v)}
          tip={t("schedule.remindWrapUpTip")}
        />
        {settings.daily_screen_time_enabled && (
          <>
            <NumberRow
              label={t("schedule.dailyBudgetHours")}
              value={settings.daily_screen_time_budget_minutes}
              min={1}
              multiplier={60}
              onChange={(v) => update("daily_screen_time_budget_minutes", v)}
            />
            <NumberRow
              label={t("schedule.remindAgainAfter")}
              value={settings.daily_screen_time_remind_again_minutes}
              min={0}
              multiplier={1}
              onChange={(v) =>
                update("daily_screen_time_remind_again_minutes", v)
              }
            />
            <div
              className={`screen-time-progress${
                (screenTime?.seconds ?? 0) >
                settings.daily_screen_time_budget_minutes * 60
                  ? " over-budget"
                  : ""
              }`}
            >
              <span className="screen-time-label">{t("schedule.today")}</span>
              <span className="screen-time-value">
                {formatScreenTime(screenTime?.seconds ?? 0)} /{" "}
                {formatScreenTime(
                  settings.daily_screen_time_budget_minutes * 60,
                )}
              </span>
              <div
                className="screen-time-bar"
                role="progressbar"
                aria-label={t("schedule.screenTimeProgressAria")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent(
                  screenTime?.seconds ?? 0,
                  settings.daily_screen_time_budget_minutes,
                )}
              >
                <span
                  ref={(el) => {
                    el?.style.setProperty(
                      "--screen-time-progress",
                      `${progressPercent(
                        screenTime?.seconds ?? 0,
                        settings.daily_screen_time_budget_minutes,
                      )}%`,
                    );
                  }}
                />
              </div>
            </div>
          </>
        )}
      </CollapsibleSection>

      <Advanced label={t("schedule.showAdvancedScheduling")}>
        <h3>{t("schedule.inputAwareScheduling")}</h3>
        <CheckboxRow
          label={t("schedule.delayBreakIfTyping")}
          value={settings.delay_break_if_typing}
          onChange={(v) => update("delay_break_if_typing", v)}
          tip={t("schedule.delayBreakIfTypingTip")}
        />
        {settings.delay_break_if_typing && (
          <>
            <NumberRow
              label={t("schedule.typingGraceSeconds")}
              value={settings.typing_grace_secs}
              min={1}
              multiplier={1}
              onChange={(v) => update("typing_grace_secs", v)}
            />
            <NumberRow
              label={t("schedule.typingMaxDeferralSeconds")}
              value={settings.typing_max_deferral_secs}
              min={1}
              multiplier={1}
              onChange={(v) => update("typing_max_deferral_secs", v)}
            />
          </>
        )}
        <CheckboxRow
          label={t("schedule.pauseCountdownIfTyping")}
          value={settings.pause_countdown_if_typing}
          onChange={(v) => update("pause_countdown_if_typing", v)}
          tip={t("schedule.pauseCountdownIfTypingTip")}
        />
      </Advanced>
    </>
  );
}
