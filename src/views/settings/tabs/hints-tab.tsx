import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import { CheckboxRow, NumberRow } from "../components/rows";
import { InfoTip } from "../components/info-tip";
import { HintListEditor } from "../components/hint-list-editor";
import type { UseSettings } from "../hooks/use-settings";
import type { SchedulerSettings, SupporterStatus } from "../types";

// The reminders tab (round-6 feedback renamed the wellness hints). Two
// top sections: the user's daily reminders (a tray-menu submenu above the
// profile list), and the break reminders — five independently collapsible
// categories, no more per-kind pools or mix dials. Every micro or long
// break draws from the merged list, so no category is tied to a break
// kind any more.
export function HintsTab({
  settings,
  update,
  supporter: _supporter,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  /** Upstream gates reminder editing on a supporter licence. This fork
   * deliberately ignores it; the prop stays so call sites and tests keep
   * type-checking. */
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
        <CollapsibleSection
          id="settings-reminders-physical"
          title={
            <>
              {t("breaks.physicalPool")}
              <InfoTip text={t("hints.physicalPoolTip")} />
            </>
          }
        >
          <HintListEditor
            label={t("breaks.physicalPool")}
            hideHeading
            name={t("hints.poolName.physical")}
            value={settings.micro_physical_hints}
            onChange={(next) => update("micro_physical_hints", next)}
          />
        </CollapsibleSection>
        <CollapsibleSection
          id="settings-reminders-psychological"
          title={
            <>
              {t("breaks.psychologicalPool")}
              <InfoTip text={t("hints.psychologicalPoolTip")} />
            </>
          }
        >
          <HintListEditor
            label={t("breaks.psychologicalPool")}
            hideHeading
            name={t("hints.poolName.psychological")}
            value={settings.micro_psychological_hints}
            onChange={(next) => update("micro_psychological_hints", next)}
          />
        </CollapsibleSection>
        <CollapsibleSection
          id="settings-reminders-solo"
          title={
            <>
              {t("breaks.longSoloPool")}
              <InfoTip text={t("hints.soloPoolTip")} />
            </>
          }
        >
          <HintListEditor
            label={t("breaks.longSoloPool")}
            hideHeading
            name={t("hints.poolName.solo")}
            value={settings.long_hints}
            onChange={(next) => update("long_hints", next)}
          />
        </CollapsibleSection>
        <CollapsibleSection
          id="settings-reminders-social"
          title={
            <>
              {t("breaks.longSocialPool")}
              <InfoTip text={t("hints.socialPoolTip")} />
            </>
          }
        >
          <HintListEditor
            label={t("breaks.longSocialPool")}
            hideHeading
            name={t("hints.poolName.social")}
            value={settings.long_social_hints}
            onChange={(next) => update("long_social_hints", next)}
          />
        </CollapsibleSection>
        <CollapsibleSection
          id="settings-reminders-bedtime"
          title={
            <>
              {t("hints.bedtimePool")}
              <InfoTip text={t("hints.bedtimePoolTip")} />
            </>
          }
        >
          <HintListEditor
            label={t("hints.bedtimePool")}
            hideHeading
            name={t("hints.poolName.bedtime")}
            value={settings.sleep_hints}
            onChange={(next) => update("sleep_hints", next)}
          />
        </CollapsibleSection>
      </CollapsibleSection>
    </>
  );
}
