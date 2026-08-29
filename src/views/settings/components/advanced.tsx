import type { ReactNode } from "react";
import { t } from "../../../lib/i18n";

export function Advanced({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <details className="advanced-section">
      <summary>{label ?? t("advanced.default")}</summary>
      <div className="advanced-body">{children}</div>
    </details>
  );
}
