import { useCallback, useEffect, useRef } from "react";
import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import { PLATFORM_LABELS, usePlatform } from "../../../lib/platform";
import {
  TRAY_COUNTDOWN_TARGETS,
  type TrayCountdownTarget,
} from "../../../lib/tray-countdown";
import { Advanced } from "../components/advanced";
import { CheckboxRow, NumberRow } from "../components/rows";
import { HotkeysSection } from "../components/hotkeys-section";
import { HookRow } from "../components/hook-row";
import { Plugins } from "../components/plugins";
import type { UseHooks } from "../hooks/use-hooks";
import type { UseSettings } from "../hooks/use-settings";
import type {
  ClockFormat,
  HookConfig,
  SchedulerSettings,
  TrayStyle,
} from "../types";

function newUiId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `hook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SystemTab({
  settings,
  update,
  setAutostart,
  hooks,
  reload,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  setAutostart: UseSettings["setAutostart"];
  hooks: UseHooks;
  reload: () => Promise<unknown>;
}) {
  // Tray text is macOS/Linux only — Windows trays render no title, so
  // "countdown only" would silently do nothing there. The backend already
  // forces the glyph back on Windows so the tray can never vanish; this
  // gate is what tells the *user* the choice is unavailable, which is the
  // half `CheckboxRow`'s `onlyOn` used to cover before the checkboxes
  // became a select.
  const platform = usePlatform();
  const trayStyleOnlyOn = ["macos", "linux"] as const;
  const trayStyleSupported = trayStyleOnlyOn.includes(
    platform as (typeof trayStyleOnlyOn)[number],
  );

  // Stable IDs for hook rows so React keys survive reordering / mid-list edits.
  // The IDs are local UI state only; they never leave the component.
  const idsRef = useRef<string[]>([]);
  if (idsRef.current.length !== hooks.draft.length) {
    if (idsRef.current.length < hooks.draft.length) {
      const need = hooks.draft.length - idsRef.current.length;
      for (let i = 0; i < need; i += 1) idsRef.current.push(newUiId());
    } else {
      idsRef.current = idsRef.current.slice(0, hooks.draft.length);
    }
  }

  useEffect(() => {
    if (idsRef.current.length !== hooks.draft.length) {
      idsRef.current = hooks.draft.map(() => newUiId());
    }
  }, [hooks.draft]);

  const updateHookAt = useCallback(
    (idx: number, patch: Partial<HookConfig>) => {
      const next = [...hooks.draft];
      next[idx] = { ...next[idx], ...patch };
      hooks.setDraft(next);
    },
    [hooks],
  );

  const removeHookAt = useCallback(
    (idx: number) => {
      idsRef.current = idsRef.current.filter((_, i) => i !== idx);
      hooks.setDraft(hooks.draft.filter((_, i) => i !== idx));
    },
    [hooks],
  );

  const addHook = useCallback(() => {
    idsRef.current = [...idsRef.current, newUiId()];
    hooks.setDraft([
      ...hooks.draft,
      { event: "break_start", command: "", enabled: true },
    ]);
  }, [hooks]);

  return (
    <>
      <CollapsibleSection id="settings-startup" title={t("system.general")}>
        <CheckboxRow
          label={t("system.autostart")}
          value={settings.autostart_enabled}
          onChange={(v) => setAutostart(v)}
        />
        <h3 id="settings-display">{t("system.display")}</h3>
        <label className="row">
          <span>{t("system.timeFormat")}</span>
          <select
            value={settings.clock_format}
            onChange={(e) =>
              update("clock_format", e.target.value as ClockFormat)
            }
          >
            <option value="24h">{t("system.format24h")}</option>
            <option value="12h">{t("system.format12h")}</option>
          </select>
        </label>
        <h3 id="settings-notifications">{t("system.notifications")}</h3>
        <CheckboxRow
          label={t("system.prebreakNotify")}
          value={settings.prebreak_notification_enabled}
          onChange={(v) => update("prebreak_notification_enabled", v)}
          tip={t("system.prebreakNotifyTip")}
        />
        <NumberRow
          label={t("system.leadTimeSeconds")}
          value={settings.prebreak_notification_seconds}
          min={5}
          multiplier={1}
          onChange={(v) => update("prebreak_notification_seconds", v)}
        />
      </CollapsibleSection>

      <CollapsibleSection id="settings-hotkeys" title={t("system.hotkeys")}>
        <HotkeysSection settings={settings} update={update} />
      </CollapsibleSection>

      <CollapsibleSection id="settings-tray" title={t("system.tray")}>
        <label className={`row${trayStyleSupported ? "" : " disabled"}`}>
          <span>
            {trayStyleSupported
              ? t("system.tray")
              : `${t("system.tray")}${t("rows.platformOnly", {
                  platforms: trayStyleOnlyOn
                    .map((p) => PLATFORM_LABELS[p])
                    .join("/"),
                })}`}
          </span>
          <select
            value={settings.tray_style}
            disabled={!trayStyleSupported}
            onChange={(e) => update("tray_style", e.target.value as TrayStyle)}
          >
            <option value="icon_and_countdown">
              {t("system.trayStyle.iconAndCountdown")}
            </option>
            <option value="countdown_only">
              {t("system.trayStyle.countdownOnly")}
            </option>
            <option value="progress_ring">
              {t("system.trayStyle.progressRing")}
            </option>
          </select>
        </label>
        <label className="row">
          <span>{t("system.countdownTo")}</span>
          <select
            value={settings.tray_countdown_target}
            onChange={(e) =>
              update(
                "tray_countdown_target",
                e.target.value as TrayCountdownTarget,
              )
            }
          >
            {TRAY_COUNTDOWN_TARGETS.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label}
              </option>
            ))}
          </select>
        </label>
      </CollapsibleSection>

      <CollapsibleSection id="settings-plugins" title={t("system.plugins")}>
        <Plugins reload={reload} />
        <Advanced label={t("system.showAdvancedHooks")}>
          <h3 id="settings-hooks">{t("system.eventHooks")}</h3>
        <p className="placeholder hook-warning">{t("system.hooksWarning")}</p>
        <label className="row">
          <span>{t("system.runShellCommands")}</span>
          <input
            type="checkbox"
            checked={hooks.draftEnabled}
            onChange={(e) => hooks.setDraftEnabled(e.target.checked)}
          />
        </label>
        {hooks.draftEnabled && (
          <div className="hooks-list">
            {hooks.draft.map((hook, idx) => (
              <HookRow
                key={idsRef.current[idx]}
                hook={hook}
                onChange={(patch) => updateHookAt(idx, patch)}
                onRemove={() => removeHookAt(idx)}
              />
            ))}
            <div className="actions inline">
              <button className="secondary" onClick={addHook}>
                {t("system.addHook")}
              </button>
            </div>
          </div>
        )}
        <div className="actions inline">
          <button
            className="primary"
            disabled={hooks.saving || !hooks.isDirty(settings)}
            onClick={hooks.save}
          >
            {hooks.saving
              ? t("system.waitingConfirmation")
              : t("system.saveHooks")}
          </button>
          <button
            className="secondary"
            disabled={hooks.saving}
            onClick={() => hooks.reset(settings)}
          >
            {t("system.reset")}
          </button>
        </div>
        {hooks.error && <p className="placeholder">{hooks.error}</p>}
        </Advanced>
      </CollapsibleSection>
    </>
  );
}
