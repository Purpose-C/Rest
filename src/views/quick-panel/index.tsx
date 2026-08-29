import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTauriListen } from "../../lib/use-tauri-listen";
import { CountdownDisplay } from "./countdown-display";
import { PauseButtons } from "./pause-buttons";
import { applyLocalTick, deadlinesFromStatus } from "./tick";
import type { QuickStatus } from "./types";
import "./quick-panel.css";

export function QuickPanel() {
  const [status, setStatus] = useState<QuickStatus>({
    state: "running",
    remaining_secs: null,
    pause_remaining_secs: null,
  });
  const deadlinesRef = useRef<{ running: number | null; pause: number | null }>(
    {
      running: null,
      pause: null,
    },
  );

  const applyStatus = useCallback((s: QuickStatus, nowMs = Date.now()) => {
    deadlinesRef.current = deadlinesFromStatus(s, nowMs);
    setStatus(s);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const s = await invoke<QuickStatus>("get_quick_status");
      applyStatus(s);
    } catch (e) {
      console.error("get_quick_status failed", e);
    }
  }, [applyStatus]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useTauriListen(
    "pause:changed",
    () => {
      void refresh();
    },
    [refresh],
  );

  useTauriListen(
    "break:start",
    () => {
      void refresh();
    },
    [refresh],
  );

  useTauriListen(
    "break:end",
    () => {
      void refresh();
    },
    [refresh],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setStatus((prev) => {
        const { status: next, hitZero } = applyLocalTick(
          prev,
          deadlinesRef.current,
          now,
        );
        if (hitZero) {
          void refresh();
        }
        if (
          next.remaining_secs === prev.remaining_secs &&
          next.pause_remaining_secs === prev.pause_remaining_secs
        ) {
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refresh]);

  const handlePause = async (secs: number | null) => {
    try {
      await invoke("pause", { durationSecs: secs });
      await refresh();
    } catch (e) {
      console.error("pause failed", e);
    }
  };

  const handleResume = async () => {
    try {
      await invoke("resume");
      await refresh();
    } catch (e) {
      console.error("resume failed", e);
    }
  };

  const handleMore = async () => {
    try {
      await invoke("show_pause_window");
    } catch (e) {
      console.error("show_pause_window failed", e);
    }
  };

  return (
    <main className="quick-panel">
      <CountdownDisplay status={status} />
      <PauseButtons
        status={status}
        onPause={handlePause}
        onResume={handleResume}
        onMore={handleMore}
      />
    </main>
  );
}

export default QuickPanel;
