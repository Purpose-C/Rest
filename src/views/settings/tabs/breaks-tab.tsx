import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import {
  clampCsvToDark,
  hexToRgbCsv,
  normalizeHexInput,
  rgbCsvToHex,
} from "../../../lib/color";
import { useLocalDraft } from "../../../lib/use-local-draft";
import { BREAK_MODE_OPTIONS, type BreakMode } from "../../../lib/break-mode";
import { Advanced } from "../components/advanced";
import { CheckboxRow, NumberRow } from "../components/rows";
import { InfoTip } from "../components/info-tip";
import { WindowedSizeRow } from "../components/windowed-size-row";
import { RoutinePicker } from "../components/routine-picker";
import { SoundControls } from "../components/sound-controls";
import { ContentPacks } from "../components/content-packs";
import {
  MONITOR_PLACEMENTS,
  OVERLAY_THEMES,
  ROTATION_GRADIENT,
} from "../constants";
import type { UseSettings } from "../hooks/use-settings";
import { useRoutines } from "../hooks/use-routines";
import { useChores } from "../hooks/use-chores";
import type {
  MonitorPlacement,
  SchedulerSettings,
  SupporterStatus,
} from "../types";
import { linesToList, listToLines } from "../utils";

// Persist the chore draft this long after the last keystroke (#225). Short
// enough that a list jotted at the morning prompt is cached well before the
// laptop sleeps or shuts down, long enough not to fire a `set_chores` on every
// keystroke.
const CHORES_AUTOSAVE_DELAY_MS = 800;

export function BreaksTab({
  settings,
  update,
  reload,
  focusChoresNonce = 0,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  /** Upstream gates appearance features on a supporter licence. This fork
   * deliberately ignores it (see `isSupporter` below); the prop stays so
   * upstream call sites and tests keep type-checking. */
  supporter: SupporterStatus;
  reload: () => Promise<unknown>;
  /// Bumped by the shell when the morning chore prompt fires, to pull focus
  /// to the chores input. `0` is the initial value and never focuses.
  focusChoresNonce?: number;
}) {
  // Personal fork: unlock the supporter-only appearance features (hint
  // pools, rotate/custom overlay themes, custom CSS) for local use.
  // Apache-2.0 permits this; upstream gates them to fund development.
  const isSupporter: boolean = true;
  const { routines, reload: reloadRoutines } = useRoutines();
  const { chores, save: saveChores } = useChores();
  const [choreLines, setChoreLines] = useLocalDraft(
    () => listToLines(chores?.items ?? []),
    [chores?.items],
  );
  const choresRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (focusChoresNonce > 0) {
      choresRef.current?.scrollIntoView?.({ block: "center" });
      choresRef.current?.focus();
    }
  }, [focusChoresNonce]);
  // Cache chores as they're typed, not only on blur (#225). The morning prompt
  // focuses this textarea; a user who jots chores then closes the window or
  // sleeps the laptop without clicking away would otherwise lose them — and
  // since the morning prompt already persisted today's `prompted_date`, they'd
  // get no re-prompt the next day either. Persist a short beat after typing
  // stops, gated on a real change so the initial load and a re-seed from the
  // saved (sanitized) list never trigger a redundant save.
  useEffect(() => {
    if (!chores) return;
    const current = linesToList(choreLines);
    const saved = chores.items;
    const unchanged =
      current.length === saved.length &&
      current.every((item, i) => item === saved[i]);
    if (unchanged) return;
    const timer = setTimeout(() => {
      void saveChores(current);
    }, CHORES_AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [choreLines, chores, saveChores]);
  // Local drafts re-seed when the active profile swaps the setting out.
  const [microPhysical, setMicroPhysical] = useLocalDraft(
    () => listToLines(settings.micro_physical_hints),
    [settings.micro_physical_hints],
  );
  const [microPsychological, setMicroPsychological] = useLocalDraft(
    () => listToLines(settings.micro_psychological_hints),
    [settings.micro_psychological_hints],
  );
  const [longSolo, setLongSolo] = useLocalDraft(
    () => listToLines(settings.long_hints),
    [settings.long_hints],
  );
  const [longSocial, setLongSocial] = useLocalDraft(
    () => listToLines(settings.long_social_hints),
    [settings.long_social_hints],
  );
  const [sleep, setSleep] = useLocalDraft(
    () => listToLines(settings.sleep_hints),
    [settings.sleep_hints],
  );
  const [customCss, setCustomCss] = useLocalDraft(
    () => settings.custom_css,
    [settings.custom_css],
  );

  const transparencyPct = Math.round((1 - settings.overlay_opacity) * 100);
  const fontScalePct = Math.round(settings.overlay_font_scale * 100);
  const soundVolumePct = Math.round(settings.sound_volume * 100);

  const routinePicker = (kind: "micro" | "long") => (
    <RoutinePicker
      kind={kind}
      routineKey={`${kind}_routine`}
      categoriesKey={`${kind}_routine_categories`}
      difficultyKey={`${kind}_routine_max_difficulty`}
      settings={settings}
      update={update}
      routines={routines}
    />
  );

  return (
    <>
      <CollapsibleSection id="settings-delivery" title={t("breaks.delivery")}>
        <p className="placeholder">
          {t("breaks.deliveryDesc")}
          <InfoTip text={t("breaks.deliveryTip")} />
        </p>
        <label className={`row${settings.micro_enabled ? "" : " disabled"}`}>
          <span>{t("breaks.microBreaks")}</span>
          <select
            value={settings.micro_break_mode}
            disabled={!settings.micro_enabled}
            onChange={(e) =>
              update("micro_break_mode", e.target.value as BreakMode)
            }
          >
            {BREAK_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={`row${settings.long_enabled ? "" : " disabled"}`}>
          <span>{t("breaks.longBreaks")}</span>
          <select
            value={settings.long_break_mode}
            disabled={!settings.long_enabled}
            onChange={(e) =>
              update("long_break_mode", e.target.value as BreakMode)
            }
          >
            {BREAK_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="actions inline">
          <button
            className="secondary"
            disabled={!settings.micro_enabled}
            onClick={() =>
              invoke("trigger_test_break", { kind: "micro", durationSecs: 10 })
            }
          >
            {t("breaks.testMicro")}
          </button>
          <button
            className="secondary"
            disabled={!settings.long_enabled}
            onClick={() =>
              invoke("trigger_test_break", { kind: "long", durationSecs: 15 })
            }
          >
            {t("breaks.testLong")}
          </button>
          <button onClick={() => invoke("start_long_break_now")}>
            {t("breaks.takeLongNow")}
          </button>
        </div>
        <h3 id="settings-overlay">{t("breaks.overlay")}</h3>
        <label className="row">
          <span>
            {t("breaks.transparency")}
            <InfoTip text={t("breaks.transparencyTip")} />
          </span>
          <span className="range-wrap">
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={transparencyPct}
              onChange={(e) =>
                update("overlay_opacity", 1 - Number(e.target.value) / 100)
              }
            />
            <span className="range-value">{transparencyPct}%</span>
          </span>
        </label>
        <label className="row">
          <span>{t("breaks.textSize")}</span>
          <span className="range-wrap">
            <input
              type="range"
              min={80}
              max={160}
              step={5}
              value={fontScalePct}
              onChange={(e) =>
                update("overlay_font_scale", Number(e.target.value) / 100)
              }
            />
            <span className="range-value">{fontScalePct}%</span>
          </span>
        </label>
        <label className="row">
          <span>
            {t("breaks.theme")}
            <InfoTip text={t("breaks.themeTip")} />
          </span>
          <span className="theme-wrap">
            <span
              className="theme-swatch"
              style={
                settings.overlay_color === "rotate"
                  ? { background: ROTATION_GRADIENT }
                  : {
                      background: `rgb(${
                        settings.overlay_color === "custom"
                          ? settings.overlay_custom_rgb
                          : (OVERLAY_THEMES.find(
                              (t) => t.id === settings.overlay_color,
                            )?.rgb ?? OVERLAY_THEMES[0].rgb)
                      })`,
                    }
              }
            />
            <select
              value={settings.overlay_color}
              onChange={(e) => update("overlay_color", e.target.value)}
            >
              {OVERLAY_THEMES.map((t) => {
                const supporterOnly = t.id === "rotate" || t.id === "custom";
                if (
                  supporterOnly &&
                  !isSupporter &&
                  settings.overlay_color !== t.id
                ) {
                  return null;
                }
                return (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                );
              })}
            </select>
          </span>
        </label>
        {settings.overlay_color === "custom" && (
          <label className="row">
            <span>{t("breaks.customColor")}</span>
            <span className="color-wrap">
              <input
                type="color"
                value={rgbCsvToHex(settings.overlay_custom_rgb)}
                onChange={(e) => {
                  const csv = hexToRgbCsv(e.target.value);
                  if (!csv) return;
                  update("overlay_custom_rgb", clampCsvToDark(csv) ?? csv);
                }}
              />
              <input
                type="text"
                className="color-hex"
                spellCheck={false}
                defaultValue={rgbCsvToHex(settings.overlay_custom_rgb)}
                key={settings.overlay_custom_rgb}
                placeholder="#1f293a"
                onBlur={(e) => {
                  const normalized = normalizeHexInput(e.target.value);
                  if (!normalized) {
                    e.target.value = rgbCsvToHex(settings.overlay_custom_rgb);
                    return;
                  }
                  const csv = hexToRgbCsv(normalized);
                  if (!csv) return;
                  update("overlay_custom_rgb", clampCsvToDark(csv) ?? csv);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
              />
            </span>
          </label>
        )}
        <CheckboxRow
          label={t("breaks.showHints")}
          value={settings.show_hint}
          onChange={(v) => update("show_hint", v)}
        />
        {settings.show_hint && (
          <>
            <label className="row checkbox-row">
              <span>
                {t("breaks.rotateHints")}
                <InfoTip text={t("breaks.rotateHintsTip")} />
              </span>
              <input
                type="checkbox"
                checked={settings.hint_rotate_seconds > 0}
                onChange={(e) =>
                  update("hint_rotate_seconds", e.target.checked ? 12 : 0)
                }
              />
            </label>
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
        <CheckboxRow
          label={t("breaks.showCurrentTime")}
          value={settings.show_current_time}
          onChange={(v) => update("show_current_time", v)}
        />
        <label className="row">
          <span>
            {t("breaks.showBreakOn")}
            <InfoTip text={t("breaks.showBreakOnTip")} />
          </span>
          <select
            value={settings.monitor_placement}
            onChange={(e) =>
              update("monitor_placement", e.target.value as MonitorPlacement)
            }
          >
            {MONITOR_PLACEMENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <Advanced label={t("breaks.showAdvancedOverlay")}>
          <WindowedSizeRow
            label={t("breaks.windowedSize")}
            tip={t("breaks.windowedSizeTip")}
            value={settings.windowed_fraction}
            allowInherit={false}
            fallback={settings.windowed_fraction}
            onChange={(v) => update("windowed_fraction", v ?? 0.8)}
          />
          <WindowedSizeRow
            label={t("breaks.microWindowedSize")}
            tip={t("breaks.microWindowedSizeTip")}
            value={settings.micro_windowed_fraction}
            allowInherit
            fallback={settings.windowed_fraction}
            onChange={(v) => update("micro_windowed_fraction", v)}
          />
          <WindowedSizeRow
            label={t("breaks.longWindowedSize")}
            tip={t("breaks.longWindowedSizeTip")}
            value={settings.long_windowed_fraction}
            allowInherit
            fallback={settings.windowed_fraction}
            onChange={(v) => update("long_windowed_fraction", v)}
          />
          <CheckboxRow
            label={t("breaks.highContrast")}
            value={settings.overlay_high_contrast}
            onChange={(v) => update("overlay_high_contrast", v)}
            tip={t("breaks.highContrastTip")}
          />
          <CheckboxRow
            label={t("breaks.showVignette")}
            value={settings.break_health_enabled}
            onChange={(v) => update("break_health_enabled", v)}
            tip={t("breaks.showVignetteTip")}
          />
        </Advanced>
      </CollapsibleSection>

      <CollapsibleSection id="settings-sound" title={t("breaks.sound")}>
        <label className="row">
          <span>{t("breaks.volume")}</span>
          <span className="range-wrap">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={soundVolumePct}
              onChange={(e) =>
                update("sound_volume", Number(e.target.value) / 100)
              }
            />
            <span className="range-value">{soundVolumePct}%</span>
          </span>
        </label>
        <p className="placeholder">{t("breaks.soundDesc")}</p>
        <h3>{t("breaks.microBreaks")}</h3>
        <SoundControls
          sound={settings.micro_sound}
          volume={settings.sound_volume}
          onChange={(next) => update("micro_sound", next)}
          isSupporter={isSupporter}
        />
        <h3>{t("breaks.longBreaks")}</h3>
        <SoundControls
          sound={settings.long_sound}
          volume={settings.sound_volume}
          onChange={(next) => update("long_sound", next)}
          isSupporter={isSupporter}
        />
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-skip-postpone"
        title={t("breaks.skipPostpone")}
      >
        <CheckboxRow
          label={t("breaks.strictMode")}
          value={settings.strict_mode}
          onChange={(v) => update("strict_mode", v)}
          tip={t("breaks.strictModeTip")}
        />
        <CheckboxRow
          label={t("breaks.allowPostpone")}
          value={settings.postpone_enabled}
          onChange={(v) => update("postpone_enabled", v)}
          disabled={settings.strict_mode}
          tip={t("breaks.allowPostponeTip")}
        />
        <NumberRow
          label={t("breaks.postponeByMinutes")}
          value={settings.postpone_minutes}
          min={1}
          multiplier={1}
          disabled={!settings.postpone_enabled || settings.strict_mode}
          onChange={(v) => update("postpone_minutes", v)}
        />
        <CheckboxRow
          label={t("breaks.escalatePostpone")}
          value={settings.postpone_escalation_enabled}
          onChange={(v) => update("postpone_escalation_enabled", v)}
          disabled={!settings.postpone_enabled || settings.strict_mode}
          tip={t("breaks.escalatePostponeTip")}
        />
        <NumberRow
          label={t("breaks.extraDelayPerPostpone")}
          value={settings.postpone_escalation_step_secs}
          min={0}
          multiplier={1}
          disabled={
            !settings.postpone_enabled ||
            settings.strict_mode ||
            !settings.postpone_escalation_enabled
          }
          onChange={(v) => update("postpone_escalation_step_secs", v)}
        />
        <NumberRow
          label={t("breaks.maxPostpones")}
          value={settings.postpone_max_count}
          min={1}
          multiplier={1}
          disabled={
            !settings.postpone_enabled ||
            settings.strict_mode ||
            !settings.postpone_escalation_enabled
          }
          onChange={(v) => update("postpone_max_count", v)}
        />

        <h3>{t("breaks.perBreakType")}</h3>
        <CheckboxRow
          label={t("breaks.postponeMicro")}
          value={settings.micro_postpone_enabled}
          onChange={(v) => update("micro_postpone_enabled", v)}
          disabled={!settings.postpone_enabled || settings.strict_mode}
          tip={t("breaks.postponeMicroTip")}
        />
        <CheckboxRow
          label={t("breaks.postponeLong")}
          value={settings.long_postpone_enabled}
          onChange={(v) => update("long_postpone_enabled", v)}
          disabled={!settings.postpone_enabled || settings.strict_mode}
          tip={t("breaks.postponeLongTip")}
        />
        <CheckboxRow
          label={t("breaks.skipMicro")}
          value={settings.micro_skip_enabled}
          onChange={(v) => update("micro_skip_enabled", v)}
          disabled={settings.strict_mode}
          tip={t("breaks.skipMicroTip")}
        />
        <CheckboxRow
          label={t("breaks.skipLong")}
          value={settings.long_skip_enabled}
          onChange={(v) => update("long_skip_enabled", v)}
          disabled={settings.strict_mode}
          tip={t("breaks.skipLongTip")}
        />

        <div className="actions inline">
          <button
            className="secondary"
            onClick={() => invoke("skip_next_break", { kind: "micro" })}
            disabled={settings.strict_mode || !settings.micro_skip_enabled}
          >
            {t("breaks.skipNextMicro")}
          </button>
          <button
            className="secondary"
            onClick={() => invoke("skip_next_break", { kind: "long" })}
            disabled={settings.strict_mode || !settings.long_skip_enabled}
          >
            {t("breaks.skipNextLong")}
          </button>
        </div>

        <Advanced label={t("breaks.enforcement")}>
          <CheckboxRow
            label={t("breaks.microManualFinish")}
            value={settings.micro_manual_finish}
            onChange={(v) => update("micro_manual_finish", v)}
            tip={t("breaks.microManualFinishTip")}
          />
          <CheckboxRow
            label={t("breaks.longManualFinish")}
            value={settings.long_manual_finish}
            onChange={(v) => update("long_manual_finish", v)}
            tip={t("breaks.longManualFinishTip")}
          />
          <CheckboxRow
            label={t("breaks.microEnforceable")}
            value={settings.micro_enforceable}
            onChange={(v) => update("micro_enforceable", v)}
            tip={t("breaks.microEnforceableTip")}
          />
          <CheckboxRow
            label={t("breaks.longEnforceable")}
            value={settings.long_enforceable}
            onChange={(v) => update("long_enforceable", v)}
            tip={t("breaks.longEnforceableTip")}
          />
        </Advanced>
      </CollapsibleSection>

      <CollapsibleSection
        id="settings-break-ideas"
        title={t("breaks.breakIdeas")}
      >
        <p className="placeholder">
          {t("breaks.breakIdeasDesc")}
          {isSupporter ? t("breaks.breakIdeasSupporterDesc") : ""}
        </p>
        <h3>{t("breaks.microBreaks")}</h3>
        <label className="row">
          <span>
            {t("breaks.mix")}
            <InfoTip text={t("breaks.microMixTip")} />
          </span>
          <select
            value={settings.micro_hint_mix}
            onChange={(e) =>
              update(
                "micro_hint_mix",
                e.target.value as typeof settings.micro_hint_mix,
              )
            }
          >
            <option value="both">{t("breaks.mixBoth")}</option>
            <option value="physical">{t("breaks.mixPhysicalOnly")}</option>
            <option value="psychological">
              {t("breaks.mixPsychologicalOnly")}
            </option>
          </select>
        </label>
        {routinePicker("micro")}
        {isSupporter && (
          <>
            <label className="row stacked">
              <span>{t("breaks.physicalPool")}</span>
              <textarea
                className="textarea"
                rows={6}
                value={microPhysical}
                onChange={(e) => setMicroPhysical(e.target.value)}
                onBlur={() =>
                  update("micro_physical_hints", linesToList(microPhysical))
                }
              />
            </label>
            <label className="row stacked">
              <span>{t("breaks.psychologicalPool")}</span>
              <textarea
                className="textarea"
                rows={6}
                value={microPsychological}
                onChange={(e) => setMicroPsychological(e.target.value)}
                onBlur={() =>
                  update(
                    "micro_psychological_hints",
                    linesToList(microPsychological),
                  )
                }
              />
            </label>
          </>
        )}
        <h3>{t("breaks.longBreaks")}</h3>
        <label className="row">
          <span>
            {t("breaks.mix")}
            <InfoTip text={t("breaks.longMixTip")} />
          </span>
          <select
            value={settings.long_hint_mix}
            onChange={(e) =>
              update(
                "long_hint_mix",
                e.target.value as typeof settings.long_hint_mix,
              )
            }
          >
            <option value="both">{t("breaks.mixBoth")}</option>
            <option value="solo">{t("breaks.mixSoloOnly")}</option>
            <option value="social">{t("breaks.mixSocialOnly")}</option>
          </select>
        </label>
        {routinePicker("long")}
        <CheckboxRow
          label={t("breaks.spreadRoutineSteps")}
          value={settings.routine_fill}
          onChange={(v) => update("routine_fill", v)}
          tip={t("breaks.spreadRoutineStepsTip")}
        />
        <CheckboxRow
          label={t("breaks.playPluginSoundCues")}
          value={settings.allow_plugin_sounds}
          onChange={(v) => update("allow_plugin_sounds", v)}
          tip={t("breaks.playPluginSoundCuesTip")}
        />
        <h3 id="settings-chores">{t("breaks.todaysChores")}</h3>
        <p className="placeholder">{t("breaks.choresDesc")}</p>
        <label className="row stacked">
          <span>{t("breaks.oneChorePerLine")}</span>
          <textarea
            ref={choresRef}
            className="textarea"
            rows={6}
            value={choreLines}
            placeholder={t("breaks.choresPlaceholder")}
            onChange={(e) => setChoreLines(e.target.value)}
            onBlur={() => saveChores(linesToList(choreLines))}
          />
        </label>
        <CheckboxRow
          label={t("breaks.promptChoresMorning")}
          value={settings.morning_chore_prompt_enabled}
          onChange={(v) => update("morning_chore_prompt_enabled", v)}
          tip={t("breaks.promptChoresMorningTip")}
        />
        {isSupporter && (
          <>
            <label className="row stacked">
              <span>{t("breaks.longSoloPool")}</span>
              <textarea
                className="textarea"
                rows={8}
                value={longSolo}
                onChange={(e) => setLongSolo(e.target.value)}
                onBlur={() => update("long_hints", linesToList(longSolo))}
              />
            </label>
            <label className="row stacked">
              <span>{t("breaks.longSocialPool")}</span>
              <textarea
                className="textarea"
                rows={6}
                value={longSocial}
                onChange={(e) => setLongSocial(e.target.value)}
                onBlur={() =>
                  update("long_social_hints", linesToList(longSocial))
                }
              />
            </label>
            <h3>{t("breaks.bedtime")}</h3>
            <label className="row stacked">
              <span>{t("breaks.oneIdeaPerLine")}</span>
              <textarea
                className="textarea"
                rows={6}
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                onBlur={() => update("sleep_hints", linesToList(sleep))}
              />
            </label>
          </>
        )}
        <h3 id="settings-content-packs">{t("breaks.contentPacks")}</h3>
        <ContentPacks
          reload={async () => {
            await reload();
            reloadRoutines();
          }}
        />
      </CollapsibleSection>

      {isSupporter && (
        <>
          <CollapsibleSection
            id="settings-custom-css"
            title={t("breaks.customCss")}
          >
            <p className="placeholder">{t("breaks.customCssDesc")}</p>
            <label className="row stacked">
              <span>{t("breaks.stylesheet")}</span>
              <textarea
                className="textarea"
                rows={12}
                spellCheck={false}
                placeholder=".overlay-card { background: #111; }"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                onBlur={() => update("custom_css", customCss)}
              />
            </label>
          </CollapsibleSection>
        </>
      )}
    </>
  );
}
