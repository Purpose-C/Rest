import { useId, useMemo, useState } from "react";
import { t } from "../../../lib/i18n";
import { TABS } from "../constants";
import { filterSettingsIndex, type SettingsSearchEntry } from "../search-index";

/** Header search box that jumps to any setting across all tabs. Filters the
 * static {@link SETTINGS_INDEX} and reports the chosen destination via
 * `onNavigate`; the shell switches tab and scrolls the section into view. */
export function SettingsSearch({
  onNavigate,
}: {
  onNavigate: (entry: SettingsSearchEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const listId = useId();
  const results = useMemo(() => filterSettingsIndex(query), [query]);
  const hasQuery = query.trim().length > 0;

  const select = (entry: SettingsSearchEntry) => {
    onNavigate(entry);
    setQuery("");
  };

  return (
    <div className="settings-search">
      <input
        type="search"
        className="settings-search-input"
        placeholder={t("search.inputPlaceholder")}
        aria-label={t("search.inputAria")}
        aria-controls={hasQuery ? listId : undefined}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            e.preventDefault();
            select(results[0]);
          } else if (e.key === "Escape") {
            setQuery("");
          }
        }}
      />
      {hasQuery && (
        <ul id={listId} className="settings-search-results">
          {results.length === 0 ? (
            <li className="settings-search-empty">{t("search.empty")}</li>
          ) : (
            results.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="settings-search-result"
                  onClick={() => select(entry)}
                >
                  <span className="settings-search-result-label">
                    {entry.label}
                  </span>
                  <span className="settings-search-result-tab">
                    {TABS.find((tab) => tab.id === entry.tabId)?.label ?? entry.tabId}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
