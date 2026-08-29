import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "../../../lib/i18n";
import {
  hasToken,
  suggestionsForPlatform,
  tokenFor,
} from "../../../lib/app-suggestions";
import { usePlatform, usePlatformCapabilities } from "../../../lib/platform";
import {
  formatRemaining,
  secondsUntil,
  toDatetimeLocalValue,
} from "../../../lib/time";
import { CheckboxRow } from "../components/rows";
import type { UseSettings } from "../hooks/use-settings";
import type { PauseInfo, SchedulerSettings } from "../types";
import { linesToList, listToLines } from "../utils";

export function QuietTab({
  settings,
  update,
  pauseInfo,
}: {
  settings: SchedulerSettings;
  update: UseSettings["update"];
  pauseInfo: PauseInfo;
}) {
  const platform = usePlatform();
  const caps = usePlatformCapabilities();
  const [appPauseText, setAppPauseText] = useState(
    listToLines(settings.app_pause_list),
  );
  const [pauseUntil, setPauseUntil] = useState("");
  const pauseUntilSecs = secondsUntil(pauseUntil);

  // Re-seed if the active profile switched and replaced the list.
  useEffect(() => {
    setAppPauseText(listToLines(settings.app_pause_list));
  }, [settings.app_pause_list]);

  return (
    <>
      <h2 id="settings-auto-pause">{t("quiet.autoPause")}</h2>
      <section>
        <p className="placeholder">
          {t("quiet.autoPauseDesc")}
        </p>
        <CheckboxRow
          label={t("quiet.dnd")}
          value={settings.pause_during_dnd}
          onChange={(v) => update("pause_during_dnd", v)}
          tip={
            caps.supportsDndRead
              ? t("quiet.dndTipSupported")
              : t("quiet.dndTipFallback")
          }
        />
        <CheckboxRow
          label={t("quiet.camera")}
          value={settings.pause_during_camera}
          onChange={(v) => update("pause_during_camera", v)}
          tip={t("quiet.cameraTip")}
        />
        <CheckboxRow
          label={t("quiet.fullscreenVideo")}
          value={settings.pause_during_video}
          onChange={(v) => update("pause_during_video", v)}
          tipWarn={!caps.videoPauseReliable}
          tip={
            caps.videoPauseReliable
              ? t("quiet.fullscreenVideoTipReliable")
              : t("quiet.fullscreenVideoTipUnreliable")
          }
        />
      </section>

      <h2 id="settings-during-breaks">{t("quiet.duringBreaks")}</h2>
      <section>
        <CheckboxRow
          label={t("quiet.pauseMedia")}
          value={settings.pause_media_during_breaks}
          onChange={(v) => update("pause_media_during_breaks", v)}
          tipWarn={!caps.mediaPauseGranular}
          tip={
            caps.mediaPauseGranular
              ? t("quiet.pauseMediaTipGranular")
              : t("quiet.pauseMediaTipFallback")
          }
        />
      </section>

      <h2 id="settings-app-pause">{t("quiet.appPause")}</h2>
      <section>
        <CheckboxRow
          label={t("quiet.appPauseCheckbox")}
          value={settings.app_pause_enabled}
          onChange={(v) => update("app_pause_enabled", v)}
          tip={t("quiet.appPauseTip")}
        />
        {settings.app_pause_enabled && (
          <>
            <label className="row stacked">
              <span>
                {t("quiet.appPausePlaceholder")}
              </span>
              <textarea
                className="textarea"
                rows={4}
                value={appPauseText}
                onChange={(e) => setAppPauseText(e.target.value)}
                onBlur={() =>
                  update("app_pause_list", linesToList(appPauseText))
                }
              />
            </label>
            <div className="row stacked">
              <span className="hint-label">{t("quiet.quickAdd")}</span>
              <div className="app-suggestion-chips">
                {suggestionsForPlatform(platform).map((s) => {
                  const token = tokenFor(s, platform)!;
                  const present = hasToken(linesToList(appPauseText), token);
                  return (
                    <button
                      type="button"
                      key={s.label}
                      className="app-suggestion-chip"
                      disabled={present}
                      onClick={() => {
                        const list = linesToList(appPauseText);
                        if (hasToken(list, token)) return;
                        const next = [...list, token];
                        setAppPauseText(listToLines(next));
                        update("app_pause_list", next);
                      }}
                    >
                      {present ? "" : "+ "}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>

      <h2 id="settings-manual-pause">{t("quiet.manualPause")}</h2>
      <section>
        {pauseInfo.paused ? (
          <div className="pause-control">
            <button
              className="secondary"
              onClick={async () => {
                await invoke("resume");
              }}
            >
              {t("quiet.resume")}
            </button>
            <span className="pause-status">
              {pauseInfo.remaining_secs != null
                ? t("quiet.pausedRemaining", {
                    remaining: formatRemaining(pauseInfo.remaining_secs),
                  })
                : t("quiet.pausedIndefinitely")}
            </span>
          </div>
        ) : (
          <>
            <p className="placeholder">
              {t("quiet.manualPauseDesc")}
            </p>
            <label className="row">
              <span>{t("quiet.pauseUntil")}</span>
              <input
                type="datetime-local"
                className="pause-until-input"
                min={toDatetimeLocalValue()}
                value={pauseUntil}
                onChange={(e) => setPauseUntil(e.target.value)}
              />
            </label>
            <div className="actions inline">
              <button
                type="button"
                disabled={pauseUntilSecs === null}
                onClick={async () => {
                  if (pauseUntilSecs === null) return;
                  await invoke("pause", { durationSecs: pauseUntilSecs });
                  setPauseUntil("");
                }}
              >
                {t("quiet.pauseUntilThen")}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
