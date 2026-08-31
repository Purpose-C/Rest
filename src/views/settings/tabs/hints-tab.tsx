import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import { CheckboxRow, NumberRow } from "../components/rows";
import { HintListEditor } from "../components/hint-list-editor";
import { InfoTip } from "../components/info-tip";
import type { UseSettings } from "../hooks/use-settings";
import type { SchedulerSettings, SupporterStatus } from "../types";

// The reminders tab: the user's daily reminders (pinned as a tray-menu
// submenu above the profile list) plus five collapsible reminder
// categories shared by every micro and long break.
type ReminderPool = {
  id: string;
  labelKey: string;
  tipKey: string;
  nameKey: string;
  field: "micro_physical_hints" | "micro_psychological_hints" | "long_hints" | "long_social_hints" | "sleep_hints";
};

const POOLS: ReminderPool[] = [
  {
    id: "physical",
    labelKey: "hints.physicalPool",
    tipKey: "hints.physicalPoolTip",
    nameKey: "hints.poolName.physical",
    field: "micro_physical_hints",
  },
  {
    id: "psychological",
    labelKey: "hints.psychologicalPool",
    tipKey: "hints.psychologicalPoolTip",
    nameKey: "hints.poolName.psychological",
    field: "micro_psychological_hints",
  },
  {
    id: "solo",
    labelKey: "hints.soloPool",
    tipKey: "hints.soloPoolTip",
    nameKey: "hints.poolName.solo",
    field: "long_hints",
  },
  {
    id: "social",
    labelKey: "hints.socialPool",
    tipKey: "hints.socialPoolTip",
    nameKey: "hints.poolName.social",
    field: "long_social_hints",
  },
  {
    id: "bedtime",
    labelKey: "hints.bedtimePool",
    tipKey: "hints.bedtimePoolTip",
    nameKey: "hints.poolName.bedtime",
    field: "sleep_hints",
  },
];

export function HintsTab({
  settings,
  update,
  supporter: _supporter,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  /** Upstream gates reminder editing on a supporter licence. This fork
   * deliberately ignores it; the prop stays so call sites and tests keep
   * type-checking, mirroring BreaksTab. */
  supporter: SupporterStatus;
}) {
  void _supporter;
  return (
    <>
      <CollapsibleSection
        id="settings-daily-reminders"
        title={t("hints.dailyTitle")}
      >
        <p className="placeholder">{t("hints.dailyDesc")}</p>
        <HintListEditor
          label={t("hints.dailyTitle")}
          hideHeading
          name={t("hints.dailyName")}
          value={settings.daily_reminders}
          onChange={(next) => update("daily_reminders", next)}
        />
      </CollapsibleSection>
      <CollapsibleSection
        id="settings-break-reminders"
        title={t("hints.breakReminders")}
      >
        <p className="placeholder">{t("hints.breakRemindersDesc")}</p>
        <CheckboxRow
          label={t("breaks.showHints")}
          value={settings.show_hint}
          onChange={(v) => update("show_hint", v)}
        />
        {settings.show_hint && (
          <>
            <CheckboxRow
              label={t("breaks.rotateHints")}
              value={settings.hint_rotate_seconds > 0}
              onChange={(v) => update("hint_rotate_seconds", v ? 12 : 0)}
              tip={t("breaks.rotateHintsTip")}
            />
            {settings.hint_rotate_seconds > 0 && (
              <NumberRow
                label={t("breaks.rotateEverySeconds")}
                value={settings.hint_rotate_seconds}
                min={3}
                multiplier={1}
                onChange={(v) => update("hint_rotate_seconds", v)}
              />
            )}
          </>
        )}
        {POOLS.map((pool) => (
          <CollapsibleSection
            key={pool.id}
            id={`settings-reminders-${pool.id}`}
            title={t(pool.labelKey)}
            // The tip lives beside the toggle button, not inside it: an
            // interactive element nested in the section button is both an
            // axe violation and collapses the section when clicked.
            action={<InfoTip text={t(pool.tipKey)} />}
          >
            <HintListEditor
              label={t(pool.labelKey)}
              hideHeading
              name={t(pool.nameKey)}
              value={settings[pool.field] as string[]}
              onChange={(next) => update(pool.field, next)}
            />
          </CollapsibleSection>
        ))}
      </CollapsibleSection>
    </>
  );
}
