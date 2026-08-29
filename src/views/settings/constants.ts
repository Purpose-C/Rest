import { t } from "../../lib/i18n";
import type { BreakSoundMode, HookEvent, MonitorPlacement, Tab } from "./types";

export const MONITOR_PLACEMENTS: { id: MonitorPlacement; label: string }[] = [
  {
    id: "primary",
    get label() {
      return t("constants.placement.primary");
    },
  },
  {
    id: "active",
    get label() {
      return t("constants.placement.active");
    },
  },
  {
    id: "all",
    get label() {
      return t("constants.placement.all");
    },
  },
];

export const HOOK_EVENTS: { id: HookEvent; label: string }[] = [
  {
    id: "break_start",
    get label() {
      return t("constants.hookEvent.break_start");
    },
  },
  {
    id: "break_end",
    get label() {
      return t("constants.hookEvent.break_end");
    },
  },
  {
    id: "break_postponed",
    get label() {
      return t("constants.hookEvent.break_postponed");
    },
  },
  {
    id: "break_skipped",
    get label() {
      return t("constants.hookEvent.break_skipped");
    },
  },
  {
    id: "pause_start",
    get label() {
      return t("constants.hookEvent.pause_start");
    },
  },
  {
    id: "pause_end",
    get label() {
      return t("constants.hookEvent.pause_end");
    },
  },
];

export const OVERLAY_THEMES = [
  {
    id: "dark",
    get label() {
      return t("constants.theme.dark");
    },
    rgb: "20, 24, 32",
  },
  {
    id: "midnight",
    get label() {
      return t("constants.theme.midnight");
    },
    rgb: "10, 14, 26",
  },
  {
    id: "forest",
    get label() {
      return t("constants.theme.forest");
    },
    rgb: "15, 31, 23",
  },
  {
    id: "rose",
    get label() {
      return t("constants.theme.rose");
    },
    rgb: "31, 15, 20",
  },
  {
    id: "sunset",
    get label() {
      return t("constants.theme.sunset");
    },
    rgb: "31, 24, 16",
  },
  {
    id: "rotate",
    get label() {
      return t("constants.theme.rotate");
    },
    rgb: "",
  },
  {
    id: "custom",
    get label() {
      return t("constants.theme.custom");
    },
    rgb: "",
  },
];

export const ROTATION_GRADIENT =
  "linear-gradient(135deg, rgb(20, 24, 32) 0%, rgb(10, 14, 26) 25%, rgb(15, 31, 23) 50%, rgb(31, 15, 20) 75%, rgb(31, 24, 16) 100%)";

export const SOUND_MODES: { id: BreakSoundMode; label: string }[] = [
  {
    id: "off",
    get label() {
      return t("constants.soundMode.off");
    },
  },
  {
    id: "end_chime",
    get label() {
      return t("constants.soundMode.end_chime");
    },
  },
  {
    id: "ambient",
    get label() {
      return t("constants.soundMode.ambient");
    },
  },
];

export const TABS: { id: Tab; label: string }[] = [
  {
    id: "schedule",
    get label() {
      return t("constants.tab.schedule");
    },
  },
  {
    id: "breaks",
    get label() {
      return t("constants.tab.breaks");
    },
  },
  {
    id: "quiet",
    get label() {
      return t("constants.tab.quiet");
    },
  },
  {
    id: "system",
    get label() {
      return t("constants.tab.system");
    },
  },
  {
    id: "insights",
    get label() {
      return t("constants.tab.insights");
    },
  },
  {
    id: "profiles",
    get label() {
      return t("constants.tab.profiles");
    },
  },
  {
    id: "about",
    get label() {
      return t("constants.tab.about");
    },
  },
];
