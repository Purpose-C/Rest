import { useEffect } from "react";
import { t } from "./lib/i18n";
import Settings from "./views/settings";
import BreakOverlay from "./views/break-overlay";
import { PausePicker } from "./views/pause-picker";
import { QuickPanel } from "./views/quick-panel";
import { ErrorBoundary } from "./error-boundary";
import { titleForWindow, windowKind } from "./lib/window-kind";

if (windowKind === "overlay") {
  document.documentElement.classList.add("overlay-window");
  document.body.classList.add("overlay-window");
  const root = document.getElementById("root");
  if (root) root.classList.add("overlay-window");
}

function App() {
  useEffect(() => {
    document.title = titleForWindow(windowKind);
  }, []);

  if (windowKind === "overlay") {
    return (
      <ErrorBoundary area={t("app.areaOverlay")}>
        <BreakOverlay />
      </ErrorBoundary>
    );
  }
  if (windowKind === "pause") {
    return (
      <ErrorBoundary area={t("app.areaPause")}>
        <PausePicker />
      </ErrorBoundary>
    );
  }
  if (windowKind === "quick") {
    return (
      <ErrorBoundary area={t("app.areaQuick")}>
        <QuickPanel />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary area={t("app.areaSettings")}>
      <Settings />
    </ErrorBoundary>
  );
}

export default App;
