import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "../../lib/i18n";
import { useTauriListen } from "../../lib/use-tauri-listen";
import { OnboardingWizard } from "./components/onboarding/onboarding-wizard";
import { SettingsSearch } from "./components/settings-search";
import { TABS } from "./constants";
import { SETTINGS_INDEX, type SettingsSearchEntry } from "./search-index";
import { useHooks } from "./hooks/use-hooks";
import { useOnboarding } from "./hooks/use-onboarding";
import { usePause } from "./hooks/use-pause";
import { useProfiles } from "./hooks/use-profiles";
import { useRovingTabList } from "./hooks/use-roving-tab-list";
import { useSettings } from "./hooks/use-settings";
import { useStats } from "./hooks/use-stats";
import { useSupporter } from "./hooks/use-supporter";
import { AboutTab } from "./tabs/about-tab";
import { BreaksTab } from "./tabs/breaks-tab";
import { HintsTab } from "./tabs/hints-tab";
import { InsightsTab } from "./tabs/insights-tab";
import { ProfilesTab } from "./tabs/profiles-tab";
import { QuietTab } from "./tabs/quiet-tab";
import { ScheduleTab } from "./tabs/schedule-tab";
import { SystemTab } from "./tabs/system-tab";
import type { Tab } from "./types";
import "./settings.css";

const TAB_IDS = TABS.map((t) => t.id);
const tabButtonId = (id: Tab) => `settings-tab-${id}`;
const tabPanelId = (id: Tab) => `settings-tabpanel-${id}`;

/** Top-level Settings window. Wires per-tab components together with
 * the cross-cutting hooks (`useSettings`, `useProfiles`, `useStats`,
 * `usePause`, `useHooks`). Shows a loading state until `settings` is
 * available, then renders the active tab. */
export default function Settings() {
  const [tab, setTab] = useState<Tab>("schedule");
  const { settings, update, reloadFromActive, setAutostart } = useSettings();
  const pauseInfo = usePause();
  const stats = useStats();
  const profiles = useProfiles();
  const hooks = useHooks(settings, reloadFromActive);
  const supporter = useSupporter();
  const onboarding = useOnboarding();
  const { tablistProps, tabProps } = useRovingTabList<Tab>({
    ids: TAB_IDS,
    active: tab,
    onChange: setTab,
  });

  // Anchor to scroll to after a search navigation. Held in a ref (not state)
  // so consuming it doesn't re-run the effect and clear its own flash timer;
  // a nonce drives the effect once per navigation.
  const pendingAnchorRef = useRef<string | null>(null);
  const [navNonce, setNavNonce] = useState(0);
  const onSearchNavigate = useCallback((entry: SettingsSearchEntry) => {
    pendingAnchorRef.current = entry.anchorId;
    setTab(entry.tabId);
    setNavNonce((n) => n + 1);
  }, []);
  // Tray reminder rows: same navigation path as search — switch to the
  // Hints tab, scroll to the reminder list, flash it. The entry object is
  // the single source of the section's coordinates (see search-index).
  useTauriListen(
    "daily-reminders:open",
    () => {
      const entry = SETTINGS_INDEX.find((e) => e.id === "daily-reminders");
      if (entry) onSearchNavigate(entry);
    },
    [onSearchNavigate],
  );
  // After the target tab renders (its panel is no longer `hidden`), scroll the
  // matched section into view and flash it briefly.
  useEffect(() => {
    const anchor = pendingAnchorRef.current;
    if (!anchor) return;
    pendingAnchorRef.current = null;
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView?.({ block: "start" });
    el.classList.add("settings-flash");
    const timer = window.setTimeout(
      () => el.classList.remove("settings-flash"),
      1200,
    );
    return () => window.clearTimeout(timer);
  }, [navNonce]);

  return (
    <>
      <a className="skip-link" href={`#${tabPanelId(tab)}`}>
        {t("settings.skipToContent")}
      </a>
      <main className="settings">
        {settings && onboarding.needed && (
          <OnboardingWizard
            settings={settings}
            update={update}
            setAutostart={setAutostart}
            onFinish={onboarding.complete}
          />
        )}
        <header className="settings-header">
          <SettingsSearch onNavigate={onSearchNavigate} />
          <div
            className="tabs"
            aria-label={t("settings.sectionsAria")}
            {...tablistProps}
          >
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                id={tabButtonId(tabItem.id)}
                aria-controls={tabPanelId(tabItem.id)}
                className={tab === tabItem.id ? "active" : ""}
                {...tabProps(tabItem.id)}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </header>

        {!settings ? (
          <p className="loading">{t("settings.loading")}</p>
        ) : (
          <>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("schedule")}
              aria-labelledby={tabButtonId("schedule")}
              tabIndex={0}
              hidden={tab !== "schedule"}
            >
              <ScheduleTab settings={settings} update={update} />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("breaks")}
              aria-labelledby={tabButtonId("breaks")}
              tabIndex={0}
              hidden={tab !== "breaks"}
            >
              <BreaksTab
                settings={settings}
                update={update}
                supporter={supporter.status}
                reload={reloadFromActive}
              />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("hints")}
              aria-labelledby={tabButtonId("hints")}
              tabIndex={0}
              hidden={tab !== "hints"}
            >
              <HintsTab
                settings={settings}
                update={update}
                supporter={supporter.status}
              />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("quiet")}
              aria-labelledby={tabButtonId("quiet")}
              tabIndex={0}
              hidden={tab !== "quiet"}
            >
              <QuietTab
                settings={settings}
                update={update}
                pauseInfo={pauseInfo}
              />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("system")}
              aria-labelledby={tabButtonId("system")}
              tabIndex={0}
              hidden={tab !== "system"}
            >
              <SystemTab
                settings={settings}
                update={update}
                setAutostart={setAutostart}
                hooks={hooks}
                reload={reloadFromActive}
              />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("insights")}
              aria-labelledby={tabButtonId("insights")}
              tabIndex={0}
              hidden={tab !== "insights"}
            >
              <InsightsTab stats={stats} />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("profiles")}
              aria-labelledby={tabButtonId("profiles")}
              tabIndex={0}
              hidden={tab !== "profiles"}
            >
              <ProfilesTab profiles={profiles} />
            </div>
            <div
              className="tab-content"
              role="tabpanel"
              id={tabPanelId("about")}
              aria-labelledby={tabButtonId("about")}
              tabIndex={0}
              hidden={tab !== "about"}
            >
              <AboutTab
                supporter={supporter}
                settings={settings}
                updateSetting={update}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}
