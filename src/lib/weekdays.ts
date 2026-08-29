import { t } from "./i18n";

/** Weekday metadata for the work-window day picker. `bit` matches the
 * layout of the Rust `Settings::work_days_mask`: Monday is bit 0, Sunday
 * is bit 6 (days-since-Monday). */
export type Weekday = {
  bit: number;
  readonly abbr: string;
  readonly name: string;
};

export const WEEKDAYS: Weekday[] = [
  {
    bit: 0,
    get abbr() {
      return t("weekdays.mon.abbr");
    },
    get name() {
      return t("weekdays.mon.name");
    },
  },
  {
    bit: 1,
    get abbr() {
      return t("weekdays.tue.abbr");
    },
    get name() {
      return t("weekdays.tue.name");
    },
  },
  {
    bit: 2,
    get abbr() {
      return t("weekdays.wed.abbr");
    },
    get name() {
      return t("weekdays.wed.name");
    },
  },
  {
    bit: 3,
    get abbr() {
      return t("weekdays.thu.abbr");
    },
    get name() {
      return t("weekdays.thu.name");
    },
  },
  {
    bit: 4,
    get abbr() {
      return t("weekdays.fri.abbr");
    },
    get name() {
      return t("weekdays.fri.name");
    },
  },
  {
    bit: 5,
    get abbr() {
      return t("weekdays.sat.abbr");
    },
    get name() {
      return t("weekdays.sat.name");
    },
  },
  {
    bit: 6,
    get abbr() {
      return t("weekdays.sun.abbr");
    },
    get name() {
      return t("weekdays.sun.name");
    },
  },
];

/** True iff the weekday `bit` is enabled in `mask`. */
export function dayActive(mask: number, bit: number): boolean {
  return (mask & (1 << bit)) !== 0;
}

/** Return `mask` with the weekday `bit` flipped. */
export function toggleDay(mask: number, bit: number): number {
  return mask ^ (1 << bit);
}
