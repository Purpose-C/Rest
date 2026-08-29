import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "../lib/i18n";
import {
  formatMinutesOfDay,
  parseMinutesOfDay,
  secondsUntil,
} from "../lib/time";
import {
  dateFieldOrder,
  monthNames,
  type DateField,
} from "../lib/locale-format";
import type { ClockFormat } from "./settings/types";
import "./pause-picker.css";

/** Clamp a day to the last valid day of the given month (e.g. 31 → 28/29
 * for February) so a stale day selection can't produce an invalid date. */
function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, new Date(year, month + 1, 0).getDate());
}

/** Standalone popup launched from the tray's "Pause until…" item. Renders
 * its own date (locale-ordered) and time (honouring the app's 12h/24h
 * setting) fields rather than a native `datetime-local`, whose format the
 * WebView locks to its own locale (en-US in a non-localised app) regardless
 * of the OS region. Pauses all breaks until the chosen moment, then closes. */
export function PausePicker() {
  const now = useMemo(() => new Date(), []);
  const [locale, setLocale] = useState("zh-CN");
  const [clockFormat, setClockFormat] = useState<ClockFormat>("24h");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());
  const [timeDraft, setTimeDraft] = useState(() =>
    formatMinutesOfDay(now.getHours() * 60 + now.getMinutes(), "24h"),
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loc = await invoke<string>("get_locale");
        if (!cancelled && loc) setLocale(loc.replace(/_/g, "-"));
      } catch (e) {
        console.error("get_locale failed", e);
      }
      try {
        const s = await invoke<{ clock_format?: string }>("get_settings");
        if (!cancelled) {
          const fmt: ClockFormat = s?.clock_format === "12h" ? "12h" : "24h";
          setClockFormat(fmt);
          setTimeDraft(
            formatMinutesOfDay(now.getHours() * 60 + now.getMinutes(), fmt),
          );
        }
      } catch (e) {
        console.error("get_settings failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [now]);

  const order = useMemo(() => dateFieldOrder(locale), [locale]);
  const months = useMemo(() => monthNames(locale), [locale]);
  const years = useMemo(
    () => Array.from({ length: 3 }, (_, i) => now.getFullYear() + i),
    [now],
  );

  const minutes = parseMinutesOfDay(timeDraft);
  const target =
    minutes === null
      ? null
      : new Date(
          year,
          month,
          clampDay(year, month, day),
          Math.floor(minutes / 60),
          minutes % 60,
        );
  const secs = target ? secondsUntil(target) : null;

  const close = () => void invoke("close_pause_window");
  const pauseFor = async (durationSecs: number) => {
    await invoke("pause", { durationSecs });
    close();
  };
  const pauseUntilTomorrowMorning = async () => {
    const durationSecs = await invoke<number>("seconds_until_tomorrow_morning");
    await pauseFor(durationSecs);
  };
  const submit = async () => {
    if (secs === null) return;
    await pauseFor(secs);
  };

  const fieldFor = (field: DateField) => {
    if (field === "day") {
      return (
        <select
          key="day"
          aria-label={t("pausePicker.dayAria")}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      );
    }
    if (field === "month") {
      return (
        <select
          key="month"
          aria-label={t("pausePicker.monthAria")}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
      );
    }
    return (
      <select
        key="year"
        aria-label={t("pausePicker.yearAria")}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    );
  };

  return (
    <main className="pause-picker">
      <h1 className="pause-picker-title">{t("pausePicker.title")}</h1>
      <p className="pause-picker-hint">{t("pausePicker.hint")}</p>
      <div
        className="pause-picker-presets"
        role="group"
        aria-label={t("pausePicker.presets")}
      >
        <button
          type="button"
          className="secondary"
          onClick={() => void pauseFor(2 * 60 * 60)}
        >
          {t("pausePicker.pause2h")}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => void pauseFor(4 * 60 * 60)}
        >
          {t("pausePicker.pause4h")}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => void pauseUntilTomorrowMorning()}
        >
          {t("pausePicker.tomorrowMorning")}
        </button>
      </div>
      <div className="pause-picker-date">{order.map(fieldFor)}</div>
      <label className="pause-picker-time">
        <span>{t("pausePicker.time")}</span>
        <input
          type="text"
          className="pause-picker-input"
          aria-label={t("pausePicker.time")}
          inputMode="numeric"
          spellCheck={false}
          placeholder={clockFormat === "12h" ? "h:mm AM/PM" : "HH:MM"}
          value={timeDraft}
          // The window opens for this picker, so focusing the time field is
          // expected rather than disorienting (mirrors the profile rename).
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onChange={(e) => setTimeDraft(e.target.value)}
          onBlur={() => {
            const m = parseMinutesOfDay(timeDraft);
            if (m !== null) setTimeDraft(formatMinutesOfDay(m, clockFormat));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && secs !== null) void submit();
            if (e.key === "Escape") close();
          }}
        />
      </label>
      <div className="pause-picker-actions">
        <button type="button" className="secondary" onClick={close}>
          {t("pausePicker.cancel")}
        </button>
        <button
          type="button"
          disabled={secs === null}
          onClick={() => void submit()}
        >
          {t("pausePicker.pause")}
        </button>
      </div>
    </main>
  );
}
