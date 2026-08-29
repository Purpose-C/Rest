import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { t } from "../../../lib/i18n";
import { InfoTip } from "./info-tip";
import type { InstallOutcome, PluginSummary } from "../types";

type Status = { kind: "ok" | "err"; message: string } | null;

function pluginFilter() {
  return [{ name: t("plugins.filter"), extensions: ["json"] }];
}

// Local-only plugin install/uninstall (#156). This slice ships content
// providers: a signed plugin file whose ideas/routines merge into the active
// profile on install (after a native confirmation dialog) and are removed
// exactly on uninstall. Detector/export plugins need the wasm runtime and are
// rejected by the backend for now.
export function Plugins({
  // Reload settings after install/uninstall so merged ideas/routines show
  // (or disappear) immediately elsewhere in Settings.
  reload,
}: {
  reload: () => Promise<unknown>;
}) {
  const [plugins, setPlugins] = useState<PluginSummary[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await invoke<PluginSummary[]>("list_plugins");
      setPlugins(Array.isArray(list) ? list : []);
    } catch (e) {
      setStatus({
        kind: "err",
        message: t("plugins.listError", { error: String(e) }),
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onInstall = async () => {
    setStatus(null);
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: pluginFilter(),
      });
      if (typeof path !== "string" || !path) return;
      setBusy(true);
      const outcome = await invoke<InstallOutcome>("install_plugin", { path });
      await Promise.all([refresh(), reload()]);
      const images = outcome.images_added ?? 0;
      const hints = t("common.countHints", {
        n: outcome.hints_added,
        suffix: outcome.hints_added === 1 ? "" : "s",
      });
      const routines = t("common.countRoutines", {
        n: outcome.routines_added,
        suffix: outcome.routines_added === 1 ? "" : "s",
      });
      const imgText =
        images > 0
          ? t("common.countImages", {
              n: images,
              suffix: images === 1 ? "" : "s",
            })
          : "";
      const message =
        outcome.kind === "content"
          ? t("plugins.installedContent", {
              name: outcome.name,
              hints,
              routines,
              images: imgText,
            })
          : t("plugins.installedGeneric", { name: outcome.name });
      setStatus({ kind: "ok", message });
    } catch (e) {
      setStatus({
        kind: "err",
        message: t("plugins.installFailed", { error: String(e) }),
      });
    } finally {
      setBusy(false);
    }
  };

  const onUninstall = async (plugin: PluginSummary) => {
    setStatus(null);
    try {
      setBusy(true);
      await invoke("uninstall_plugin", { id: plugin.id });
      await Promise.all([refresh(), reload()]);
      setStatus({
        kind: "ok",
        message: t("plugins.removed", { name: plugin.name }),
      });
    } catch (e) {
      setStatus({
        kind: "err",
        message: t("plugins.uninstallFailed", { error: String(e) }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="placeholder">
        {t("plugins.desc")}
        <InfoTip text={t("plugins.tip")} />
      </p>
      <p className="placeholder plugin-warning">
        {t("plugins.warning")}
      </p>
      <div className="actions inline">
        <button
          type="button"
          className="secondary"
          onClick={onInstall}
          disabled={busy}
        >
          {busy ? t("plugins.working") : t("plugins.installBtn")}
        </button>
      </div>
      {plugins.length > 0 ? (
        <ul className="plugin-list">
          {plugins.map((p) => (
            <li key={p.id} className="plugin-row">
              <div className="plugin-meta">
                <span className="plugin-name">{p.name}</span>
                <span className="plugin-sub">
                  {p.author ? `${p.author} · ` : ""}v{p.version} ·{" "}
                  {t("plugins.rowCounts", {
                    hints: p.hints_added,
                    hSuffix: p.hints_added === 1 ? "" : "s",
                    routines: p.routines_added,
                    rSuffix: p.routines_added === 1 ? "" : "s",
                  })}
                </span>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => onUninstall(p)}
                disabled={busy}
                aria-label={t("plugins.uninstallAria", { name: p.name })}
              >
                {t("plugins.uninstall")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="placeholder">{t("plugins.noPlugins")}</p>
      )}
      {status && (
        <p
          className={status.kind === "err" ? "content-pack-err" : "placeholder"}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      )}
    </>
  );
}
