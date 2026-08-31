import { useState, type ReactNode } from "react";
import { t } from "../../../lib/i18n";
import { useLocalDraft } from "../../../lib/use-local-draft";
import { InfoTip } from "./info-tip";

// Stage 4 (spec-round6): per-item add/remove editor for a hint pool. Each
// hint is one editable row with a delete button; a fresh line is typed into
// the add field at the bottom. Writes fire on add / delete / row blur, the
// established change-then-write rhythm — not on every keystroke. The pool
// field itself is unchanged (D4: only the UI organisation moves).
export type HintListEditorProps = {
  label: ReactNode;
  /** Short name used to build unique per-row aria-labels ("Body · 2"). */
  name: string;
  /** Hide the h3 heading when the surrounding section already carries the
   * title (e.g. the daily-reminder collapsible). */
  hideHeading?: boolean;
  tip?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

// Stable empty array so `value ?? EMPTY` doesn't mint a fresh `[]` every
// render and trip useLocalDraft's dep check into re-seeding mid-edit.
const EMPTY: string[] = [];

export function HintListEditor({
  label,
  name,
  hideHeading = false,
  tip,
  value,
  onChange,
  placeholder,
}: HintListEditorProps) {
  // `?? EMPTY` mirrors the null-tolerance of the old `listToLines(textarea)`
  // path: settings hydrate asynchronously and transiently render without
  // the pool fields populated.
  const [items, setItems] = useLocalDraft(() => value ?? EMPTY, [value]);
  const [draft, setDraft] = useState("");

  const commit = (next: string[]) => {
    const cleaned = next.filter((s) => s.trim().length > 0);
    setItems(cleaned);
    onChange(cleaned);
  };

  const addDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    commit([...items, text]);
  };

  return (
    <div className="hint-list">
      {!hideHeading && (
        <h3 className="hint-list-heading">
          {label}
          {tip && <InfoTip text={tip} />}
        </h3>
      )}
      <ul className="hint-list-items">
        {items.map((hint, i) => (
          <li key={i} className="hint-list-row">
            <input
              type="text"
              className="hint-list-input"
              value={hint}
              placeholder={placeholder}
              aria-label={t("hints.hintRowLabel", { pool: name, i: i + 1 })}
              onChange={(e) => {
                const next = items.slice();
                next[i] = e.target.value;
                setItems(next);
              }}
              onBlur={() => {
                if (items !== value) commit(items);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
            <button
              type="button"
              className="hint-list-delete"
              aria-label={t("hints.deleteHintLabel", {
                pool: name,
                hint,
              })}
              title={t("hints.deleteHint")}
              onClick={() => commit(items.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="hint-list-add">
        <input
          type="text"
          className="hint-list-input"
          value={draft}
          placeholder={t("hints.addHintPlaceholder")}
          aria-label={t("hints.addHintLabel", { pool: name })}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDraft();
          }}
        />
        <button
          type="button"
          className="secondary"
          onClick={addDraft}
          disabled={!draft.trim()}
        >
          {t("hints.addHint")}
        </button>
      </div>
    </div>
  );
}
