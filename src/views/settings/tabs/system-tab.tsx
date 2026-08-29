import { useCallback, useEffect, useRef } from "react";
import { t } from "../../../lib/i18n";
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
import type { ClockFormat, HookConfig, SchedulerSettings } from "../types";

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
      <h2 id="settings-startup">{t("system.startup")}</h2>
      <section>
        <CheckboxRow
          label={t("system.autostart")}
          value={settings.autostart_enabled}
          onChange={(v) => setAutostart(v)}
        />
      </section>

      <h2 id="settings-display">{t("system.display")}</h2>
      <section>
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
      </section>

      <h2 id="settings-notifications">{t("system.notifications")}</h2>
      <section>
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
      </section>

      <h2 id="settings-hotkeys">{t("system.hotkeys")}</h2>
      <section>
        <HotkeysSection settings={settings} update={update} />
      </section>

      <h2 id="settings-tray">{t("system.tray")}</h2>
      <section>
        <CheckboxRow
          label={t("system.trayCountdown")}
          value={settings.tray_countdown_enabled}
          onChange={(v) => update("tray_countdown_enabled", v)}
          onlyOn={["macos", "linux"]}
          tip={t("system.trayCountdownTip")}
        />
        <CheckboxRow
          label={t("system.trayIcon")}
          value={settings.tray_icon_enabled}
          onChange={(v) => update("tray_icon_enabled", v)}
          onlyOn={["macos", "linux"]}
          disabled={!settings.tray_countdown_enabled}
          tip={t("system.trayIconTip")}
        />
        <label
          className={`row${settings.tray_countdown_enabled ? "" : " disabled"}`}
        >
          <span>{t("system.countdownTo")}</span>
          <select
            value={settings.tray_countdown_target}
            disabled={!settings.tray_countdown_enabled}
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
      </section>

      <h2 id="settings-plugins">{t("system.plugins")}</h2>
      <section>
        <Plugins reload={reload} />
      </section>

      <Advanced label={t("system.showAdvancedHooks")}>
        <h3 id="settings-hooks">{t("system.eventHooks")}</h3>
        <p className="placeholder hook-warning">
          {t("system.hooksWarning")}
        </p>
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
            {hooks.saving ? t("system.waitingConfirmation") : t("system.saveHooks")}
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
    </>
  );
}
