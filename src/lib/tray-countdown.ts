import { t } from "./i18n";

/** Frontend mirror of Rust's `format_countdown` — `"M:SS"` (or
 * `"MM:SS"` past ten minutes). Used in tests and previews; the live
 * tray text is rendered by Rust.
 *
 * NOTE (fork): this mirror is deliberately stale. Rust's
 * `format_countdown` now renders whole minutes (`"5m"`), but changing
 * this function would rewrite `tray-countdown.test.ts` — an upstream
 * test file this fork keeps byte-identical (see ADR-0001). Nothing in
 * the app calls this; only its own test does. */
export function formatTrayCountdown(secs: number): string {
  const clamped = Math.max(0, Math.floor(secs));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  const ss = String(s).padStart(2, "0");
  if (m >= 10) {
    return `${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

/** Which break the tray countdown targets — mirrors the value
 * persisted as `tray_countdown_target` in `Settings`. */
export type TrayCountdownTarget = "next" | "short" | "long";

/** Options for the tray-countdown target dropdown on the System tab. */
export const TRAY_COUNTDOWN_TARGETS: {
  id: TrayCountdownTarget;
  readonly label: string;
}[] = [
  {
    id: "next",
    get label() {
      return t("trayCountdown.next");
    },
  },
  {
    id: "short",
    get label() {
      return t("trayCountdown.short");
    },
  },
  {
    id: "long",
    get label() {
      return t("trayCountdown.long");
    },
  },
];
