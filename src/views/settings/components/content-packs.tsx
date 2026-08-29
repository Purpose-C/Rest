import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  open as openDialog,
  save as saveDialog,
} from "@tauri-apps/plugin-dialog";
import { t } from "../../../lib/i18n";
import { InfoTip } from "./info-tip";
import { localDateString } from "../../../lib/time";
import type { ContentPackSummary } from "../types";

type Status = { kind: "ok" | "err"; message: string } | null;

function packFilter() {
  return [{ name: t("contentPacks.filter"), extensions: ["json"] }];
}

// Import/export of local content packs (#155): a plain JSON bundle of break
// ideas + guided routines the user picks from disk. Import is additive
// (duplicates skipped); export captures the current pools + custom routines.
export function ContentPacks({
  // Reload settings after an import so the new ideas/routines show immediately.
  reload,
}: {
  reload: () => Promise<unknown>;
}) {
  const [status, setStatus] = useState<Status>(null);

  const onExport = async () => {
    setStatus(null);
    try {
      const today = localDateString();
      const path = await saveDialog({
        defaultPath: `entracte-content-pack-${today}.json`,
        filters: packFilter(),
      });
      if (typeof path !== "string" || !path) return;
      await invoke("export_content_pack", {
        path,
        name: t("contentPacks.defaultName", { today }),
      });
      setStatus({
        kind: "ok",
        message: t("contentPacks.exportedTo", { path }),
      });
    } catch (e) {
      setStatus({
        kind: "err",
        message: t("contentPacks.exportFailed", { error: String(e) }),
      });
    }
  };

  const onImport = async () => {
    setStatus(null);
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: packFilter(),
      });
      if (typeof path !== "string" || !path) return;
      const summary = await invoke<ContentPackSummary>("import_content_pack", {
        path,
      });
      await reload();
      const ideas = t("common.countHints", {
        n: summary.hints_added,
        suffix: summary.hints_added === 1 ? "" : "s",
      });
      const routines = t("common.countRoutines", {
        n: summary.routines_added,
        suffix: summary.routines_added === 1 ? "" : "s",
      });
      setStatus({
        kind: "ok",
        message: t("contentPacks.importedSuccess", { ideas, routines }),
      });
    } catch (e) {
      setStatus({
        kind: "err",
        message: t("contentPacks.importFailed", { error: String(e) }),
      });
    }
  };

  return (
    <>
      <p className="placeholder">
        {t("contentPacks.desc")}
        <InfoTip text={t("contentPacks.tip")} />
      </p>
      <div className="actions inline">
        <button type="button" className="secondary" onClick={onImport}>
          {t("contentPacks.importBtn")}
        </button>
        <button type="button" className="secondary" onClick={onExport}>
          {t("contentPacks.exportBtn")}
        </button>
      </div>
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
