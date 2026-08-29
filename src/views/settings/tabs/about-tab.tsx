import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";
import { t } from "../../../lib/i18n";
import { useUpdateCheck } from "../hooks/use-update-check";
import type { UseSupporter } from "../hooks/use-supporter";
import type { UseSettings } from "../hooks/use-settings";
import type { SchedulerSettings } from "../types";
import {
  useArch,
  usePlatform,
  usePlatformCapabilities,
} from "../../../lib/platform";
import { primaryInstaller } from "../../../lib/download";
import { writeToClipboard } from "../utils";

const TOAST_MS = 3000;
const SUPPORTER_CHECKOUT_URL =
  "https://shop.drmowinckels.io/checkout/buy/40af6bbf-154c-4321-948e-3329b1176319";

export function AboutTab({
  supporter,
  settings,
  updateSetting,
}: {
  supporter: UseSupporter;
  settings: SchedulerSettings | null;
  updateSetting: UseSettings["update"];
}) {
  const [version, setVersion] = useState("");
  const [diagnosticsStatus, setDiagnosticsStatus] = useState("");
  const [licenseInput, setLicenseInput] = useState("");
  const update = useUpdateCheck();
  const caps = usePlatformCapabilities();
  const platform = usePlatform();
  const arch = useArch();

  const downloadInstaller =
    update.info && update.info.has_update
      ? primaryInstaller(platform, arch, update.info.latest)
      : null;

  const onVerify = async () => {
    const trimmed = licenseInput.trim();
    if (!trimmed) return;
    const ok = await supporter.verify(trimmed);
    if (ok) setLicenseInput("");
  };

  useEffect(() => {
    let cancelled = false;
    getVersion()
      .then((v) => {
        if (!cancelled) setVersion(v);
      })
      .catch((e) => console.error("getVersion failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  const flashDiagnostics = (msg: string) => {
    setDiagnosticsStatus(msg);
    window.setTimeout(() => setDiagnosticsStatus(""), TOAST_MS);
  };

  const onCopyDiagnosticsReport = async () => {
    try {
      const report = await invoke<string>("build_diagnostics_report");
      const ok = await writeToClipboard(report);
      flashDiagnostics(
        ok ? t("about.reportCopied") : t("about.copyFailed"),
      );
    } catch (e) {
      console.error("copy diagnostics report failed", e);
      flashDiagnostics(t("about.couldNotBuildReport"));
    }
  };

  return (
    <>
      <h2 id="settings-about">{t("about.title")}</h2>
      <section>
        <div className="about-title-row">
          <p className="about-title">Entracte</p>
          <button onClick={update.check} disabled={update.checking}>
            {update.checking ? t("about.checking") : t("about.checkUpdates")}
          </button>
        </div>
        <p className="about-meta">
          {t("about.version", { version: version || "—" })}
        </p>
        <p className="about-meta">{t("about.tagline")}</p>
        <p className="about-meta">{t("about.license")}</p>
        {settings && (
          <label className="about-meta about-auto-check">
            <input
              type="checkbox"
              checked={settings.auto_check_updates}
              onChange={(e) =>
                updateSetting("auto_check_updates", e.target.checked)
              }
            />{" "}
            {t("about.autoCheckUpdates")}
          </label>
        )}
        {update.info && update.info.has_update && update.info.release_url && (
          <>
            <p className="about-meta">
              {t("about.updateAvailable", {
                latest: update.info.latest,
                current: update.info.current,
              })}
            </p>
            <div className="actions inline">
              {downloadInstaller && (
                <button onClick={() => openUrl(downloadInstaller.url)}>
                  {t("about.downloadFor", { label: downloadInstaller.label })}
                </button>
              )}
              <button
                className={downloadInstaller ? "secondary" : undefined}
                onClick={() => openUrl(update.info!.release_url!)}
              >
                {downloadInstaller ? t("about.allDownloads") : t("about.openReleasePage")}
              </button>
            </div>
            {caps.installerUnsignedWarning && (
              <p className="about-meta">
                {t("about.windowsUnsignedWarning")}
              </p>
            )}
          </>
        )}
        {update.info && !update.info.has_update && (
          <p className="about-meta">
            {t("about.latestVersion", { current: update.info.current })}
          </p>
        )}
        {update.error && (
          <p className="about-meta">
            {t("about.checkFailed", { error: update.error })}
          </p>
        )}
      </section>

      <h2 id="settings-supporter">
        {t("about.supporter")}{supporter.status.is_supporter ? " ✓" : ""}
      </h2>
      <section>
        {supporter.status.is_supporter ? (
          <>
            <p className="about-meta">
              {t("about.supporterUnlocked")}
            </p>
            <p className="about-meta">
              {t("about.licenseKey", {
                key: supporter.status.masked_key ?? "",
              })}
            </p>
            <div className="actions inline">
              <button
                className="secondary"
                onClick={() => supporter.remove()}
                disabled={supporter.pending}
              >
                {t("about.removeLicense")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="about-meta">
              {t("about.supporterPitch")}
            </p>
            <div className="actions inline">
              <button onClick={() => openUrl(SUPPORTER_CHECKOUT_URL)}>
                {t("about.becomeSupporter")}
              </button>
            </div>
            <p className="about-meta">
              {t("about.alreadyHaveLicense")}
            </p>
            <div className="supporter-entry">
              <input
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                placeholder={t("about.licensePlaceholder")}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                disabled={supporter.pending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onVerify();
                }}
              />
              <button
                onClick={onVerify}
                disabled={supporter.pending || licenseInput.trim() === ""}
              >
                {supporter.pending ? t("about.verifying") : t("about.verify")}
              </button>
            </div>
          </>
        )}
        {supporter.message && (
          <p className="diagnostics-status">{supporter.message}</p>
        )}
      </section>

      <div className="section-heading">
        <h2>{t("about.author")}</h2>
        <button
          onClick={() => openUrl("https://buymeacoffee.com/drmowinckels")}
        >
          {t("about.buyMeACoffee")}
        </button>
      </div>
      <section>
        <p className="about-meta">
          {t("about.authorName")}
        </p>
        <p className="about-meta">
          {t("about.authorBio")}
        </p>
      </section>

      <h2>{t("about.companionApp")}</h2>
      <section>
        <p className="about-meta">
          {t("about.cairnPitch")}
        </p>
        <div className="actions inline">
          <button onClick={() => openUrl("https://cairn.drmowinckels.io/")}>
            {t("about.tryCairn")}
          </button>
        </div>
      </section>

      <div className="section-heading">
        <h2 id="settings-diagnostics">{t("about.diagnostics")}</h2>
        <button onClick={onCopyDiagnosticsReport}>
          {t("about.copyDiagnosticsReport")}
        </button>
      </div>
      <section>
        {diagnosticsStatus && (
          <p className="diagnostics-status">{diagnosticsStatus}</p>
        )}
        <p className="diagnostics-hint">
          {t("about.diagnosticsHint", {
            link: "github.com/drmowinckels/entracte/issues",
          })}
        </p>
      </section>
    </>
  );
}
