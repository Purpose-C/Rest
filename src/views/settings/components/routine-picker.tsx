import { t } from "../../../lib/i18n";
import type { Routine } from "../hooks/use-routines";
import type { UseSettings } from "../hooks/use-settings";
import type {
  RoutineCategory,
  RoutineDifficulty,
  SchedulerSettings,
} from "../types";
import { InfoTip } from "./info-tip";

// Exported for the routine enum-parity test (kept in lockstep with the zod
// routine enums and the Rust `RoutineCategory` / `RoutineDifficulty`).
export const CATEGORIES: { id: RoutineCategory; readonly label: string }[] = [
  {
    id: "eyes",
    get label() {
      return t("routine.category.eyes");
    },
  },
  {
    id: "mobility",
    get label() {
      return t("routine.category.mobility");
    },
  },
  {
    id: "breathing",
    get label() {
      return t("routine.category.breathing");
    },
  },
  {
    id: "desk_yoga",
    get label() {
      return t("routine.category.desk_yoga");
    },
  },
];

export const DIFFICULTIES: { id: RoutineDifficulty; readonly label: string }[] = [
  {
    id: "gentle",
    get label() {
      return t("routine.difficulty.gentle");
    },
  },
  {
    id: "moderate",
    get label() {
      return t("routine.difficulty.moderate");
    },
  },
  {
    id: "active",
    get label() {
      return t("routine.difficulty.active");
    },
  },
];

type RoutineKey = "micro_routine" | "long_routine";
type CategoriesKey = "micro_routine_categories" | "long_routine_categories";
type DifficultyKey =
  | "micro_routine_max_difficulty"
  | "long_routine_max_difficulty";

// Per-kind guided-routine picker. Three modes: None (rotate ideas), a
// specific routine, or Random — which reveals the engine filters (categories
// + max difficulty) that the backend draws the per-break routine from.
export function RoutinePicker({
  kind,
  routineKey,
  categoriesKey,
  difficultyKey,
  settings,
  update,
  routines,
}: {
  kind: "micro" | "long";
  routineKey: RoutineKey;
  categoriesKey: CategoriesKey;
  difficultyKey: DifficultyKey;
  settings: SchedulerSettings;
  update: UseSettings["update"];
  routines: Routine[];
}) {
  const mode = settings[routineKey];
  const selectedCategories = settings[categoriesKey];

  const toggleCategory = (cat: RoutineCategory) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    update(categoriesKey, next);
  };

  return (
    <>
      <label className="row">
        <span>
          {t("routine.guidedRoutine")}
          <InfoTip text={t("routine.guidedRoutineTip")} />
        </span>
        <select
          value={mode}
          onChange={(e) => update(routineKey, e.target.value)}
        >
          <option value="">{t("routine.modeNone")}</option>
          <option value="random">{t("routine.modeRandom")}</option>
          {routines
            .filter((r) => r.kind === kind)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
        </select>
      </label>
      {mode === "random" && (
        <>
          <div className="row">
            <span>
              {t("routine.categories")}
              <InfoTip text={t("routine.categoriesTip")} />
            </span>
            <span className="routine-categories">
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className="routine-category">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </span>
          </div>
          <label className="row">
            <span>
              {t("routine.maxDifficulty")}
              <InfoTip text={t("routine.maxDifficultyTip")} />
            </span>
            <select
              value={settings[difficultyKey]}
              onChange={(e) =>
                update(difficultyKey, e.target.value as RoutineDifficulty)
              }
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </>
  );
}
