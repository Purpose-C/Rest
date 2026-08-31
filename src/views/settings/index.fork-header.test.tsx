// Fork-added shell guard (spec-round6 L1): previously lived inline in the
// upstream `index.test.tsx`; new fork cases belong in their own files so
// upstream test bodies stay diff-clean.
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { SchedulerSettings } from "./types";

let mockSettings: SchedulerSettings | null = null;

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(async () => () => {}),
}));
vi.mock("./hooks/use-settings", () => ({
  useSettings: () => ({
    settings: mockSettings,
    update: vi.fn(),
    updateMany: vi.fn(),
    reloadFromActive: vi.fn(),
    setAutostart: vi.fn(),
  }),
}));
vi.mock("./hooks/use-onboarding", () => ({
  useOnboarding: () => ({ needed: false, complete: vi.fn() }),
}));
vi.mock("./hooks/use-pause", () => ({ usePause: () => ({ paused: false }) }));
vi.mock("./hooks/use-stats", () => ({
  useStats: () => ({ digest: null, refresh: vi.fn(), export: vi.fn() }),
}));
vi.mock("./hooks/use-profiles", () => ({
  useProfiles: () => ({
    profiles: [],
    activeId: null,
    refresh: vi.fn(),
    create: vi.fn(),
    rename: vi.fn(),
    activate: vi.fn(),
    remove: vi.fn(),
  }),
}));
vi.mock("./hooks/use-hooks", () => ({
  useHooks: () => ({ hooks: [], save: vi.fn() }),
}));
vi.mock("./hooks/use-supporter", () => ({
  useSupporter: () => ({
    status: { is_supporter: false, licence: null },
  }),
}));
vi.mock("./tabs/schedule-tab", () => ({
  ScheduleTab: () => <div>schedule-content</div>,
}));
vi.mock("./tabs/breaks-tab", () => ({
  BreaksTab: () => <div>breaks-content</div>,
}));
vi.mock("./tabs/hints-tab", () => ({
  HintsTab: () => <div>hints-content</div>,
}));
vi.mock("./tabs/quiet-tab", () => ({
  QuietTab: () => <div>quiet-content</div>,
}));
vi.mock("./tabs/system-tab", () => ({
  SystemTab: () => <div>system-content</div>,
}));
vi.mock("./tabs/insights-tab", () => ({
  InsightsTab: () => <div>insights-content</div>,
}));
vi.mock("./tabs/profiles-tab", () => ({
  ProfilesTab: () => <div>profiles-content</div>,
}));
vi.mock("./tabs/about-tab", () => ({
  AboutTab: () => <div>about-content</div>,
}));

const { default: Settings } = await import("./index");

describe("Settings shell header layout (fork)", () => {
  it("keeps search and tabs in the same header so short panels do not jump the chrome", () => {
    mockSettings = {} as SchedulerSettings;
    const { container } = render(<Settings />);
    const header = container.querySelector(".settings-header");
    expect(header).not.toBeNull();
    expect(header?.querySelector(".settings-search")).not.toBeNull();
    expect(header?.querySelector(".tabs")).not.toBeNull();
  });
});
