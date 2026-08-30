import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function getAllSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllSourceFiles(fullPath));
    } else if (
      (entry.endsWith(".tsx") || entry.endsWith(".ts")) &&
      !entry.includes(".test.") &&
      !entry.includes(".spec.")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractClassSelectors(css: string): Set<string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = new Set<string>();
  let currentSelector = "";

  for (let i = 0; i < stripped.length; i++) {
    const char = stripped[i];
    if (char === "{") {
      const trimmed = currentSelector.trim();
      if (trimmed.length > 0 && !trimmed.startsWith("@")) {
        const classRegex = /\.([a-zA-Z_][\w-]*)/g;
        let match: RegExpExecArray | null;
        while ((match = classRegex.exec(trimmed)) !== null) {
          const name = match[1];
          if (name !== "root") {
            classes.add(name);
          }
        }
      }
      currentSelector = "";
    } else if (char === "}") {
      currentSelector = "";
    } else {
      currentSelector += char;
    }
  }
  return classes;
}

function extractTsxClassNames(tsxContent: string): Set<string> {
  const classes = new Set<string>();
  // Match className="..." or className={'...'} or className={`...`}
  const classNameAttrRegex =
    /\bclassName\s*=\s*(?:\{`([^`]+)`\}|\{['"]([^'"]+)['"]\}|["']([^"']+)["'])/g;
  let match: RegExpExecArray | null;
  while ((match = classNameAttrRegex.exec(tsxContent)) !== null) {
    const raw = match[1] || match[2] || match[3] || "";
    const words = raw.split(/[\s${}?:,]+/);
    for (const w of words) {
      const clean = w.replace(/['"`()]/g, "").trim();
      if (/^[a-zA-Z_][\w-]*$/.test(clean)) {
        classes.add(clean);
      }
    }
  }
  return classes;
}

describe("theme-zh.css parity with upstream selectors", () => {
  const rootDir = resolve(__dirname, "../../..");
  const themeCssPath = join(rootDir, "src/theme-zh.css");
  const settingsCssPath = join(rootDir, "src/views/settings/settings.css");
  const viewsDir = join(rootDir, "src/views/settings");

  it("ensures all class selectors in theme-zh.css exist in upstream settings.css or tsx files", () => {
    const themeCss = readFileSync(themeCssPath, "utf-8");
    const settingsCss = readFileSync(settingsCssPath, "utf-8");

    const tsxFiles = getAllSourceFiles(viewsDir);
    const tsxContent = tsxFiles
      .map((file) => readFileSync(file, "utf-8"))
      .join("\n");

    const themeClasses = extractClassSelectors(themeCss);
    const settingsClasses = extractClassSelectors(settingsCss);
    const tsxClasses = extractTsxClassNames(tsxContent);

    expect(themeClasses.size).toBeGreaterThan(10);
    expect(settingsClasses.size).toBeGreaterThan(50);

    const missingClasses: string[] = [];
    for (const className of themeClasses) {
      // Exact set matching: must be in settings.css class selectors OR in TSX className attributes
      const inCss = settingsClasses.has(className);
      const inTsx = tsxClasses.has(className);

      if (!inCss && !inTsx) {
        missingClasses.push(className);
      }
    }

    expect(
      missingClasses,
      `The following classes in theme-zh.css were not found in settings.css or views/settings TSX files:\n${missingClasses.join(
        ", ",
      )}`,
    ).toEqual([]);
  });
});
