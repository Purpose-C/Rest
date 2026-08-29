import { t } from "./i18n";

export type WindowKind = "main" | "overlay" | "pause" | "quick";

export function readWindowKind(search: string): WindowKind {
  const kind = new URLSearchParams(search).get("window");
  if (kind === "overlay") return "overlay";
  if (kind === "pause") return "pause";
  if (kind === "quick") return "quick";
  return "main";
}

export function titleForWindow(kind: WindowKind): string {
  switch (kind) {
    case "overlay":
      return t("windowTitle.overlay");
    case "pause":
      return t("windowTitle.pause");
    case "quick":
      return t("windowTitle.quick");
    default:
      return t("windowTitle.settings");
  }
}

export const windowKind: WindowKind = readWindowKind(window.location.search);
