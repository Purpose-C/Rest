import { t } from "./i18n";

/** Break kinds the screen-reader announcement supports. */
export type AnnouncedKind = "micro" | "long" | "sleep";

/**
 * Screen-reader name for the overlay dialog. Prefixed with the app
 * name and category so VoiceOver / NVDA say something like
 * "Entracte, micro break, dialog" on focus, instead of just "Micro
 * break". Deliberately omits the word "reminder" — a break is meant
 * to feel like room to breathe, not a nag.
 */
export function dialogLabel(kind: AnnouncedKind): string {
  if (kind === "sleep") return t("a11y.dialogLabel.sleep");
  if (kind === "long") return t("a11y.dialogLabel.long");
  return t("a11y.dialogLabel.micro");
}

/** Human-readable duration, e.g. "10 minutes", "30 seconds",
 * "2 minutes 5 seconds". Shared by the start announcement and the
 * dialog description. */
export function durationPhrase(durationSecs: number): string {
  const total = Math.max(0, durationSecs);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes > 0 && seconds > 0) {
    return t("a11y.durationMinutesSeconds", {
      minutes,
      mSuffix: minutes === 1 ? "" : "s",
      seconds,
      sSuffix: seconds === 1 ? "" : "s",
    });
  }
  if (minutes > 0) {
    return t("a11y.durationMinutes", {
      minutes,
      mSuffix: minutes === 1 ? "" : "s",
    });
  }
  return t("a11y.durationSeconds", {
    seconds,
    sSuffix: seconds === 1 ? "" : "s",
  });
}

/**
 * Build the live-region message announced when a break starts in
 * strict mode, where there is no dialog to carry context. Mirrors
 * `dialogLabel` plus a gentle, non-deadline phrasing of the duration.
 * Non-strict breaks fold the same information into the dialog
 * description (`breakDescription`) so it is spoken once, on focus.
 */
export function announceBreak(
  kind: AnnouncedKind,
  durationSecs: number,
): string {
  return t("a11y.announceBreak", {
    label: dialogLabel(kind),
    duration: durationPhrase(durationSecs),
  });
}

/**
 * Dialog `aria-describedby` text: the duration, then the wellness tip
 * if one is showing. Read once when the dialog gains focus, so the
 * non-strict break start is a single calm utterance rather than a
 * repeated announcement.
 */
export function breakDescription(durationSecs: number, hint: string): string {
  const lead = t("a11y.youHave", {
    duration: durationPhrase(durationSecs),
  });
  return hint ? `${lead} ${hint}` : lead;
}

/**
 * `aria-label` for the overlay countdown — "5 minutes 12 seconds
 * remaining", "Time's up", etc. Used so screen readers don't read
 * the ticking digits, which would be too chatty.
 */
export function remainingAriaLabel(seconds: number): string {
  if (seconds <= 0) return t("a11y.timesUp");
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) {
    return t("a11y.remainingMinutesSeconds", {
      minutes: m,
      mSuffix: m === 1 ? "" : "s",
      seconds: s,
      sSuffix: s === 1 ? "" : "s",
    });
  }
  if (m > 0) {
    return t("a11y.remainingMinutes", {
      minutes: m,
      mSuffix: m === 1 ? "" : "s",
    });
  }
  return t("a11y.remainingSeconds", {
    seconds: s,
    sSuffix: s === 1 ? "" : "s",
  });
}

/**
 * Discrete milestones the break-timer announces, picked so a screen
 * reader hears about progress without the per-second chatter that a
 * live region on the countdown itself would produce.
 *
 * Order of dominance (highest wins) — exactly one fires per render:
 * 1. `end` — break is finished or remaining hits 0
 * 2. `ten-seconds` — final stretch
 * 3. `one-minute` — only if the break is longer than 60 seconds
 *    (otherwise we'd announce it immediately on start, which is noise)
 * 4. `halfway` — only if the break is longer than 60 seconds; for
 *    a 70-second break the one-minute milestone fires first and
 *    swallows the halfway window, which is desired behaviour
 * 5. `null` — no milestone reached yet
 */
export type BreakMilestone =
  | "halfway"
  | "one-minute"
  | "ten-seconds"
  | "end"
  | null;

/** Pick the current milestone from the live break state. Pure
 * function — call from a render to keep the live region in sync. */
export function milestoneFor(
  durationSecs: number,
  remaining: number,
  finished: boolean,
): BreakMilestone {
  if (finished || remaining <= 0) return "end";
  if (remaining <= 10) return "ten-seconds";
  if (durationSecs > 60 && remaining <= 60) return "one-minute";
  if (durationSecs > 60 && remaining <= durationSecs / 2) return "halfway";
  return null;
}

/** Phrasing for a milestone, kind-aware so "bedtime" reads naturally
 * instead of "break". Returns `""` for `null` so callers can pipe the
 * value straight into a live region. */
export function milestoneMessage(
  kind: AnnouncedKind,
  milestone: BreakMilestone,
): string {
  if (milestone === null) return "";
  const noun = kind === "sleep" ? t("a11y.nounBedtime") : t("a11y.nounBreak");
  if (milestone === "halfway") {
    return t("a11y.milestoneHalfway", { noun });
  }
  if (milestone === "one-minute") {
    return t("a11y.milestoneOneMinute");
  }
  if (milestone === "ten-seconds") {
    return t("a11y.milestoneTenSeconds");
  }
  return kind === "sleep"
    ? t("a11y.milestoneBedtimeComplete")
    : t("a11y.milestoneBreakComplete");
}
