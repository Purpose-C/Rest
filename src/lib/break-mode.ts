import { t } from "./i18n";

/**
 * Delivery mode for a break — mirrors Rust's `BreakMode` serde enum in
 * `src-tauri/src/scheduler/settings.rs` (which projects onto the runtime
 * `BreakDelivery`). Values are the lowercase on-disk strings.
 */
export type BreakMode = "overlay" | "windowed" | "notification";

/** Options for the Schedule tab's per-kind Mode dropdown. */
export const BREAK_MODE_OPTIONS: { value: BreakMode; label: string }[] = [
  {
    value: "overlay",
    get label() {
      return t("breakMode.overlay");
    },
  },
  {
    value: "windowed",
    get label() {
      return t("breakMode.windowed");
    },
  },
  {
    value: "notification",
    get label() {
      return t("breakMode.notification");
    },
  },
];

/** Coerce an unknown string to a `BreakMode`, falling back to `"overlay"`. */
export function normalizeBreakMode(value: string): BreakMode {
  if (value === "notification") return "notification";
  if (value === "windowed") return "windowed";
  return "overlay";
}
