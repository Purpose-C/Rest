import { describe, expect, it, afterEach } from "vitest";
import { t, setLocale, getLocale } from "./i18n";
import { en } from "./i18n/en";
import { zhCN } from "./i18n/zh-CN";
import {
  formatHoursMinutes,
  weekdayLabel,
  buildHeatmapWeeks,
  heatmapMonthLabels,
} from "./stats-format";
import {
  breathLabel,
  breathAriaLabel,
} from "../views/break-overlay/breath";
import { filterSettingsIndex } from "../views/settings/search-index";

describe("i18n system", () => {
  afterEach(() => {
    setLocale("en");
  });

  it("defaults to en locale and translates keys", () => {
    expect(getLocale()).toBe("en");
    expect(t("breakMode.overlay")).toBe("Full-screen overlay");
  });

  it("switches to zh-CN and translates keys", () => {
    setLocale("zh-CN");
    expect(getLocale()).toBe("zh-CN");
    expect(t("breakMode.overlay")).toBe("全屏遮罩");
  });

  it("handles param interpolation correctly in both locales", () => {
    setLocale("en");
    expect(t("about.version", { version: "1.0.0" })).toBe("Version 1.0.0");
    setLocale("zh-CN");
    expect(t("about.version", { version: "1.0.0" })).toBe("版本 1.0.0");
  });

  it("contains all English keys in Simplified Chinese dictionary", () => {
    const enKeys = Object.keys(en);
    const zhKeys = new Set(Object.keys(zhCN));

    const missingInZh: string[] = [];
    for (const key of enKeys) {
      if (!zhKeys.has(key)) {
        missingInZh.push(key);
      }
    }
    expect(missingInZh).toEqual([]);
  });

  it("contains all Simplified Chinese keys in English dictionary", () => {
    const zhKeys = Object.keys(zhCN);
    const enKeys = new Set(Object.keys(en));

    const missingInEn: string[] = [];
    for (const key of zhKeys) {
      if (!enKeys.has(key)) {
        missingInEn.push(key);
      }
    }
    expect(missingInEn).toEqual([]);
  });

  it("matches required interpolation parameters between en and zh-CN", () => {
    const paramRegex = /\{([a-zA-Z0-9_]+)\}/g;
    const pluralSuffixes = new Set([
      "suffix",
      "mSuffix",
      "sSuffix",
      "hSuffix",
      "rSuffix",
    ]);
    for (const [key, enText] of Object.entries(en)) {
      const zhText = zhCN[key];
      if (!zhText) continue;
      const enParams = Array.from(enText.matchAll(paramRegex))
        .map((m) => m[1])
        .filter((p) => !pluralSuffixes.has(p))
        .sort();
      const zhParams = Array.from(zhText.matchAll(paramRegex))
        .map((m) => m[1])
        .filter((p) => !pluralSuffixes.has(p))
        .sort();
      expect(zhParams, `Param mismatch in key "${key}"`).toEqual(enParams);
    }
  });

  it("has no empty dictionary values", () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value.trim(), `empty en value for "${key}"`).not.toBe("");
    }
    for (const [key, value] of Object.entries(zhCN)) {
      expect(value.trim(), `empty zh-CN value for "${key}"`).not.toBe("");
    }
  });

  it("formats stats units, weekdays, and months in zh-CN", () => {
    setLocale("zh-CN");
    expect(formatHoursMinutes(3660)).toBe("1 小时 1 分钟");
    expect(weekdayLabel(0)).toBe("周一");
    expect(weekdayLabel(6)).toBe("周日");
    const weeks = buildHeatmapWeeks([
      { date: "2026-02-02", taken: 1, dismissed: 0 },
      { date: "2026-03-02", taken: 1, dismissed: 0 },
    ]);
    expect(heatmapMonthLabels(weeks)).toEqual([
      { col: 0, label: "2月" },
      { col: 1, label: "3月" },
    ]);
  });

  it("formats breath labels in zh-CN", () => {
    setLocale("zh-CN");
    const p = { phase: "inhale", phaseRemaining: 4, fullness: 0 } as const;
    expect(breathLabel(p)).toBe("吸气 · 4 秒");
    expect(breathAriaLabel(p)).toBe("吸气，4 秒");
  });

  it("matches settings search by English or Chinese keywords", () => {
    expect(filterSettingsIndex("bedtime").map((e) => e.id)).toContain(
      "bedtime",
    );
    expect(filterSettingsIndex("活动时段").map((e) => e.id)).toContain(
      "active-hours",
    );
    expect(filterSettingsIndex("短休息").map((e) => e.id)).toContain(
      "micro-breaks",
    );
    expect(filterSettingsIndex("拦截").map((e) => e.id)).toContain("auto-pause");
  });

  it("still matches English labels after switching to zh-CN", () => {
    setLocale("zh-CN");
    expect(filterSettingsIndex("bedtime").map((e) => e.id)).toContain(
      "bedtime",
    );
    expect(filterSettingsIndex("active hours").map((e) => e.id)).toContain(
      "active-hours",
    );
    expect(t("overlay.timerSeconds", { seconds: 13 })).toBe("13 秒");
  });
});
