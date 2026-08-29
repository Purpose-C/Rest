import { useEffect, useRef, useState } from "react";
import { t } from "../../../../lib/i18n";
import type { UseSettings } from "../../hooks/use-settings";
import type { SchedulerSettings } from "../../types";
import { CheckboxRow, TimeRow } from "../rows";
import { InfoTip } from "../info-tip";
import { WeekdayToggle } from "../weekday-toggle";
import "./onboarding.css";

type StepId = "welcome" | "login" | "window" | "hints" | "winddown" | "done";

const STEPS: { id: StepId; title: string }[] = [
  {
    id: "welcome",
    get title() {
      return t("onboarding.stepWelcome");
    },
  },
  {
    id: "login",
    get title() {
      return t("onboarding.stepLogin");
    },
  },
  {
    id: "window",
    get title() {
      return t("onboarding.stepWindow");
    },
  },
  {
    id: "hints",
    get title() {
      return t("onboarding.stepHints");
    },
  },
  {
    id: "winddown",
    get title() {
      return t("onboarding.stepWinddown");
    },
  },
  {
    id: "done",
    get title() {
      return t("onboarding.stepDone");
    },
  },
];

export type OnboardingWizardProps = {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  setAutostart: UseSettings["setAutostart"];
  /** Persist completion and dismiss the wizard (finish or skip). */
  onFinish: () => void;
};

/** First-run guided setup. A modal over the Settings window that walks a
 * new user through the handful of settings most worth choosing up front;
 * every control writes through the same `update`/`setAutostart` helpers
 * the real tabs use, so finishing leaves the app configured. */
export function OnboardingWizard({
  settings,
  update,
  setAutostart,
  onFinish,
}: OnboardingWizardProps) {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onFinish]);

  const back = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => {
    if (isLast) onFinish();
    else setIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  return (
    <div className="onboarding-backdrop">
      <div
        className="onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="onboarding-head">
          <p className="onboarding-step-count">
            {t("onboarding.stepCount", {
              curr: index + 1,
              total: STEPS.length,
            })}
          </p>
          <ol className="onboarding-dots" aria-hidden="true">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={`onboarding-dot${i === index ? " current" : ""}${
                  i < index ? " done" : ""
                }`}
              />
            ))}
          </ol>
        </header>

        <div className="onboarding-body">
          <StepContent
            step={step.id}
            settings={settings}
            update={update}
            setAutostart={setAutostart}
          />
        </div>

        <footer className="onboarding-foot">
          <button type="button" className="link" onClick={onFinish}>
            {isLast ? t("onboarding.close") : t("onboarding.skipSetup")}
          </button>
          <div className="onboarding-nav">
            {!isFirst && (
              <button type="button" className="secondary" onClick={back}>
                {t("onboarding.back")}
              </button>
            )}
            <button type="button" onClick={next}>
              {isLast ? t("onboarding.finish") : t("onboarding.next")}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StepContent({
  step,
  settings,
  update,
  setAutostart,
}: {
  step: StepId;
  settings: SchedulerSettings;
  update: UseSettings["update"];
  setAutostart: UseSettings["setAutostart"];
}) {
  switch (step) {
    case "welcome":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.welcomeTitle")}</h2>
          <p>{t("onboarding.welcomeBody")}</p>
        </>
      );
    case "login":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.loginTitle")}</h2>
          <p>{t("onboarding.loginBody")}</p>
          <CheckboxRow
            label={t("onboarding.loginCheckbox")}
            value={settings.autostart_enabled}
            onChange={(v) => setAutostart(v)}
          />
        </>
      );
    case "window":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.windowTitle")}</h2>
          <p>{t("onboarding.windowBody")}</p>
          <CheckboxRow
            label={t("onboarding.windowCheckbox")}
            value={settings.work_window_enabled}
            onChange={(v) => update("work_window_enabled", v)}
          />
          {settings.work_window_enabled && (
            <>
              <TimeRow
                label={t("onboarding.startOfDay")}
                value={settings.work_start_minutes}
                format={settings.clock_format}
                onChange={(v) => update("work_start_minutes", v)}
              />
              <TimeRow
                label={t("onboarding.endOfDay")}
                value={settings.work_end_minutes}
                format={settings.clock_format}
                onChange={(v) => update("work_end_minutes", v)}
              />
              <WeekdayToggle
                label={t("onboarding.onTheseDays")}
                mask={settings.work_days_mask}
                onChange={(v) => update("work_days_mask", v)}
                tip={t("onboarding.onTheseDaysTip")}
              />
            </>
          )}
        </>
      );
    case "hints":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.hintsTitle")}</h2>
          <p>{t("onboarding.hintsBody")}</p>
          <CheckboxRow
            label={t("onboarding.hintsCheckbox")}
            value={settings.show_hint}
            onChange={(v) => update("show_hint", v)}
          />
          {settings.show_hint && (
            <label className="row">
              <span>
                {t("onboarding.longSuggestions")}
                <InfoTip text={t("onboarding.longSuggestionsTip")} />
              </span>
              <select
                value={settings.long_hint_mix}
                onChange={(e) =>
                  update(
                    "long_hint_mix",
                    e.target.value as SchedulerSettings["long_hint_mix"],
                  )
                }
              >
                <option value="both">{t("onboarding.longOptionBoth")}</option>
                <option value="solo">{t("onboarding.longOptionSolo")}</option>
                <option value="social">{t("onboarding.longOptionSocial")}</option>
              </select>
            </label>
          )}
        </>
      );
    case "winddown":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.winddownTitle")}</h2>
          <p>{t("onboarding.winddownBody")}</p>
          <CheckboxRow
            label={t("onboarding.winddownCheckbox")}
            value={settings.bedtime_enabled}
            onChange={(v) => update("bedtime_enabled", v)}
          />
          {settings.bedtime_enabled && (
            <>
              <TimeRow
                label={t("onboarding.winddownStarts")}
                value={settings.bedtime_start_minutes}
                format={settings.clock_format}
                onChange={(v) => update("bedtime_start_minutes", v)}
              />
              <TimeRow
                label={t("onboarding.winddownEnds")}
                value={settings.bedtime_end_minutes}
                format={settings.clock_format}
                onChange={(v) => update("bedtime_end_minutes", v)}
              />
            </>
          )}
          <CheckboxRow
            label={t("onboarding.strictCheckbox")}
            value={settings.strict_mode}
            onChange={(v) => update("strict_mode", v)}
            tip={t("onboarding.strictTip")}
          />
        </>
      );
    case "done":
      return (
        <>
          <h2 id="onboarding-title">{t("onboarding.doneTitle")}</h2>
          <p>{t("onboarding.doneBody")}</p>
        </>
      );
  }
}
