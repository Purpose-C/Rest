import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsSearch } from "./settings-search";

describe("SettingsSearch shortcut", () => {
  it("focuses and selects search input on Cmd+F / Ctrl+F", () => {
    const onNavigate = vi.fn();
    const selectSpy = vi.spyOn(HTMLInputElement.prototype, "select");
    render(<SettingsSearch onNavigate={onNavigate} />);

    const input = screen.getByPlaceholderText(
      "Search settings…",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "posture" } });
    input.blur();
    expect(document.activeElement).not.toBe(input);

    fireEvent.keyDown(window, { key: "f", metaKey: true });
    expect(document.activeElement).toBe(input);
    expect(selectSpy).toHaveBeenCalled();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("posture".length);

    selectSpy.mockClear();
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(window, { key: "f", ctrlKey: true });
    expect(document.activeElement).toBe(input);
    expect(selectSpy).toHaveBeenCalled();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("posture".length);

    selectSpy.mockRestore();
  });
});
