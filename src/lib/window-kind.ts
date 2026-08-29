import { t } from "./i18n";

export type WindowKind = "main" | "overlay" | "pause";

export function readWindowKind(search: string): WindowKind {
  const kind = new URLSearchParams(search).get("window");
  if (kind === "overlay") return "overlay";
  if (kind === "pause") return "pause";
  return "main";
}

export function titleForWindow(kind: WindowKind): string {
  switch (kind) {
    case "overlay":
      return t("windowTitle.overlay");
    case "pause":
      return t("windowTitle.pause");
    default:
      return t("windowTitle.settings");
  }
}

export const windowKind: WindowKind = readWindowKind(window.location.search);
