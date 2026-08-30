// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Platform } from "../../../lib/platform";
import type { SchedulerSettings } from "../types";
import type { UseHooks } from "../hooks/use-hooks";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue("linux"),
}));

// Re-covers the platform gate that upstream's `system-tab.test.tsx` used to
// assert on the tray-countdown *checkbox*. That checkbox became a three-way
// `<select>` (`tray_style`), so the original assertion could not survive the
// change. This lives in a new file so the upstream test file stays
// byte-identical (ADR-0001).
//
// Windows trays render no title at all, so "countdown only" would silently do
// nothing there. The backend already forces the glyph back on Windows so the
// tray can never vanish; the gate is what tells the *user* the choice is
// unavailable.
let currentPlatform: Platform = "linux";
vi.mock("../../../lib/platform", async () => {
  const actual =
    await vi.importActual<typeof import("../../../lib/platform")>(
      "../../../lib/platform",
    );
  return { ...actual, usePlatform: () => currentPlatform };
});

const { SystemTab } = await import("./system-tab");

const baseSettings = {
  prebreak_notification_enabled: false,
  prebreak_notification_seconds: 30,
  autostart_enabled: false,
  tray_style: "icon_and_countdown",
  tray_countdown_target: "next",
  hooks_enabled: true,
  hooks: [],
  hotkeys_enabled: false,
  hotkeys: [],
} as unknown as SchedulerSettings;

function buildHooks(): UseHooks {
  return {
    draft: [],
    draftEnabled: false,
    saving: false,
    error: "",
    setDraft: vi.fn(),
    setDraftEnabled: vi.fn(),
    syncFromSettings: vi.fn(),
    isDirty: vi.fn(() => false),
    save: vi.fn(async () => undefined),
    reset: vi.fn(),
  } as unknown as UseHooks;
}

function renderTab() {
  return render(
    <SystemTab
      settings={baseSettings}
      update={vi.fn() as unknown as Parameters<typeof SystemTab>[0]["update"]}
      setAutostart={vi.fn(async () => undefined)}
      hooks={buildHooks()}
      reload={async () => {}}
    />,
  );
}

// Tests run in the default `en` locale (ADR-0001), so match the English label.
// On unsupported platforms the label gains a " (macOS/Linux only)" suffix, hence
// the prefix match rather than an exact string.
function trayStyleSelect(): HTMLSelectElement {
  return screen.getByRole("combobox", {
    name: /^Tray countdown/,
  }) as HTMLSelectElement;
}

afterEach(() => {
  cleanup();
  currentPlatform = "linux";
});

describe("SystemTab — tray style platform gate", () => {
  it("leaves the tray-style select usable on macOS", () => {
    currentPlatform = "macos";
    renderTab();
    expect(trayStyleSelect().disabled).toBe(false);
  });

  it("disables the tray-style select on Windows, where trays render no text", () => {
    currentPlatform = "windows";
    renderTab();
    expect(trayStyleSelect().disabled).toBe(true);
  });
});
