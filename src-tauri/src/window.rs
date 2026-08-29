//! Shared helpers for showing the long-lived `main` window (the
//! Preferences UI), with a Linux/Wayland-specific workaround for #139.
//!
//! The `main` window is created `visible: false` (tauri.conf.json) and
//! shown on demand from the tray. On GNOME/Wayland a window shown after
//! being created hidden never receives an initial `configure` event from
//! the compositor until the user manually resizes it, so its client-side
//! decoration input region stays stale and the close/minimise controls
//! swallow clicks until the first double-click-to-maximise toggle
//! (upstream tauri-apps/tauri#13440, still open).
//!
//! The 0.0.6 fix nudged the size +1px and back synchronously after
//! `show()`. That never cleared it on Steffi's Ubuntu 24.04 / GNOME /
//! Wayland setup: Wayland batches surface state until commit, so two
//! `set_size` calls in the same event-loop turn coalesce to the final
//! (unchanged) size and no `configure` is emitted — the synchronous nudge
//! was a no-op there. Given a hidden window shown later needs a *committed*
//! state change, the strategies here defer their second half onto a later
//! event-loop tick, and `maximize` is the default because Steffi confirmed
//! it clears the controls on her hardware (it mirrors the manual
//! double-click-titlebar that she found worked).
//!
//! `ENTRACTE_WL_FIX` selects the strategy so a different compositor can be
//! handled empirically without a rebuild:
//!
//! - `maximize` (default): `maximize()` then `unmaximize()` on a later
//!   tick — the confirmed fix.
//! - `nudge`: resize +1px, restore on a later tick (the 0.0.6 idea, fixed
//!   to actually commit). Kept as an alternative for compositors maximize
//!   perturbs.
//! - `off`: do nothing (baseline / opt-out).
//!
//! Applied only on a real **Wayland** session: X11 gives a proper
//! `configure` on `show()` and must not get a spurious maximise flash.

use tauri::{Manager, Runtime};

/// Env var selecting the Wayland configure workaround strategy. Honoured
/// only on a Linux Wayland session; ignored elsewhere.
const WL_FIX_ENV: &str = "ENTRACTE_WL_FIX";

/// Delay before the deferred half of a nudge/maximize round-trip, long
/// enough for the compositor to process and commit the intermediate
/// surface state before we restore it.
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
const DEFER_MS: u64 = 60;

/// Which #139 Wayland workaround to apply when showing the `main` window.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WaylandFix {
    Off,
    Nudge,
    Maximize,
}

impl WaylandFix {
    /// Parse the `ENTRACTE_WL_FIX` value. Defaults to
    /// [`WaylandFix::Maximize`] when unset, empty, or unrecognised —
    /// Steffi confirmed `maximize` clears #139 on Ubuntu 24.04 / GNOME /
    /// Wayland, so a stock build applies the known-good fix. Matching is
    /// case-insensitive and whitespace-trimmed. Pure so strategy selection
    /// is unit-testable without touching the environment or a windowing
    /// system.
    pub fn from_env_value(value: Option<&str>) -> Self {
        match value.map(|v| v.trim().to_ascii_lowercase()).as_deref() {
            Some("off") => Self::Off,
            Some("nudge") => Self::Nudge,
            _ => Self::Maximize,
        }
    }

    /// Short stable token for logs and the diagnostics banner, so a bug
    /// report shows which strategy was live without the user recalling the
    /// env var they set.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Off => "off",
            Self::Nudge => "nudge",
            Self::Maximize => "maximize",
        }
    }
}

/// Resolve the active strategy from the process environment.
pub fn wayland_fix_strategy() -> WaylandFix {
    WaylandFix::from_env_value(std::env::var(WL_FIX_ENV).ok().as_deref())
}

/// Pure Wayland-session test over the two relevant env signals, split out
/// so the decision is unit-testable without mutating process env. Mirrors
/// the probes in `scheduler::overlay` and `video`; kept local so the
/// window path stays self-contained.
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
fn wayland_session_from_env(session_type: Option<&str>, wayland_display: bool) -> bool {
    session_type.is_some_and(|s| s.eq_ignore_ascii_case("wayland")) || wayland_display
}

/// Whether this is a Wayland session, from the process environment.
#[cfg(target_os = "linux")]
fn is_wayland_session() -> bool {
    wayland_session_from_env(
        std::env::var("XDG_SESSION_TYPE").ok().as_deref(),
        std::env::var("WAYLAND_DISPLAY").is_ok(),
    )
}

/// The one transient intermediate size the `nudge` strategy resizes to
/// before restoring the real size, to provoke a fresh compositor configure
/// event. Grow by 1px so the size genuinely changes (a no-op resize is
/// coalesced away); if the window is already at the `u32` ceiling, shrink
/// instead so the value still differs.
///
/// Pure so the "which size forces a configure" decision is unit-testable
/// without a windowing system; the actual `set_size` FFI stays in
/// `apply_wayland_fix` (Linux-only, so not linked here).
#[cfg_attr(not(target_os = "linux"), allow(dead_code))]
fn nudged_dimension(value: u32) -> u32 {
    value.checked_add(1).unwrap_or_else(|| value - 1)
}

/// Apply the selected #139 workaround to a freshly-shown `main` window.
/// Reached only on a Linux Wayland session (see [`show_main_window`]); the
/// nudge/maximize strategies defer their second half onto a later
/// event-loop tick because Wayland coalesces state set within a single
/// turn — the flaw that made the 0.0.6 synchronous nudge a no-op.
#[cfg(target_os = "linux")]
fn apply_wayland_fix<R: Runtime>(window: &tauri::WebviewWindow<R>, fix: WaylandFix) {
    match fix {
        WaylandFix::Off => {}
        WaylandFix::Nudge => {
            if let Ok(size) = window.inner_size() {
                let nudged = tauri::PhysicalSize::new(nudged_dimension(size.width), size.height);
                let _ = window.set_size(nudged);
                let window = window.clone();
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_millis(DEFER_MS)).await;
                    let _ = window.set_size(size);
                });
            }
        }
        WaylandFix::Maximize => {
            let _ = window.maximize();
            let window = window.clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(DEFER_MS)).await;
                let _ = window.unmaximize();
            });
        }
    }
}

/// Show and focus the `main` window, applying the Wayland configure
/// workaround on a Linux Wayland session. Single entry point so every
/// "open Preferences" call site (tray menu, CLI re-invocation) gets
/// identical behaviour.
pub fn show_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        #[cfg(target_os = "linux")]
        if is_wayland_session() {
            apply_wayland_fix(&window, wayland_fix_strategy());
        }
    }
}

#[tauri::command]
pub fn show_pause_window<R: Runtime>(app: tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("pause") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }
    match tauri::WebviewWindowBuilder::new(
        &app,
        "pause",
        tauri::WebviewUrl::App("index.html?window=pause".into()),
    )
    .title("暂停 Entracte")
    .inner_size(360.0, 280.0)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .always_on_top(true)
    .center()
    .focused(true)
    .build()
    {
        Ok(_) => log::debug!("pause: created picker window"),
        Err(e) => log::error!("pause: failed to create picker window: {e}"),
    }
}

/// Close the "Pause until…" picker. Invoked by the picker itself after it
/// pauses or the user cancels. A backend command (rather than the JS window
/// API) keeps `@tauri-apps/api/window` out of the renderer bundle.
#[tauri::command]
pub fn close_pause_window<R: Runtime>(app: tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("pause") {
        let _ = window.close();
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct QuickPanelGeometry {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

pub fn compute_quick_panel_geometry(
    icon_rect: (f64, f64, f64, f64),
    monitor_rect: (f64, f64, f64, f64),
    scale_factor: f64,
    logical_width: f64,
    logical_height: f64,
) -> QuickPanelGeometry {
    let scale = if scale_factor > 0.0 {
        scale_factor
    } else {
        1.0
    };
    let panel_w = (logical_width * scale).round();
    let panel_h = (logical_height * scale).round();
    let gap = (4.0 * scale).round();
    let margin = (8.0 * scale).round();

    let (icon_x, icon_y, icon_w, icon_h) = icon_rect;
    let (mon_x, mon_y, mon_w, mon_h) = monitor_rect;

    let icon_center_x = icon_x + (icon_w / 2.0);
    let mut target_x = icon_center_x - (panel_w / 2.0);

    let min_x = mon_x + margin;
    let max_x = (mon_x + mon_w - panel_w - margin).max(min_x);
    target_x = target_x.clamp(min_x, max_x);

    let mut target_y = if icon_y + (icon_h / 2.0) < mon_y + (mon_h / 2.0) {
        icon_y + icon_h + gap
    } else {
        icon_y - panel_h - gap
    };
    let min_y = mon_y + margin;
    let max_y = (mon_y + mon_h - panel_h - margin).max(min_y);
    target_y = target_y.clamp(min_y, max_y);

    QuickPanelGeometry {
        x: target_x.round() as i32,
        y: target_y.round() as i32,
        width: panel_w.max(1.0) as u32,
        height: panel_h.max(1.0) as u32,
    }
}

const QUICK_PANEL_LOGICAL_WIDTH: f64 = 280.0;
const QUICK_PANEL_LOGICAL_HEIGHT: f64 = 320.0;

/// Same GNOME/Wayland HiDPI correction as overlay.rs `scale_corrected_rect`:
/// tao reports `monitor.size()` already multiplied by the scale factor, and
/// `set_position`/`set_size` divide by scale again.
pub fn scale_corrected_monitor_rect(
    rect: (f64, f64, f64, f64),
    scale: f64,
    wayland: bool,
) -> (f64, f64, f64, f64) {
    if !wayland || scale <= 1.0 {
        return rect;
    }
    let (x, y, w, h) = rect;
    (
        (x / scale).round(),
        (y / scale).round(),
        (w / scale).round().max(1.0),
        (h / scale).round().max(1.0),
    )
}

/// Show the quick panel window positioned under the tray icon.
pub fn show_quick_window<R: Runtime>(app: &tauri::AppHandle<R>, rect: tauri::Rect) {
    let (icon_x, icon_y, icon_w, icon_h) = match (rect.position, rect.size) {
        (tauri::Position::Physical(p), tauri::Size::Physical(s)) => {
            (p.x as f64, p.y as f64, s.width as f64, s.height as f64)
        }
        (tauri::Position::Logical(p), tauri::Size::Logical(s)) => (p.x, p.y, s.width, s.height),
        (tauri::Position::Physical(p), tauri::Size::Logical(s)) => {
            (p.x as f64, p.y as f64, s.width, s.height)
        }
        (tauri::Position::Logical(p), tauri::Size::Physical(s)) => {
            (p.x, p.y, s.width as f64, s.height as f64)
        }
    };

    let monitors = app.available_monitors().unwrap_or_default();
    let icon_center_x = icon_x + (icon_w / 2.0);
    let icon_center_y = icon_y + (icon_h / 2.0);

    let matching_monitor = monitors
        .iter()
        .find(|m| {
            let pos = m.position();
            let size = m.size();
            icon_center_x >= pos.x as f64
                && icon_center_x < (pos.x + size.width as i32) as f64
                && icon_center_y >= pos.y as f64
                && icon_center_y < (pos.y + size.height as i32) as f64
        })
        .or_else(|| monitors.first());

    let (mon_rect, scale) = if let Some(m) = matching_monitor {
        let p = m.position();
        let s = m.size();
        (
            (p.x as f64, p.y as f64, s.width as f64, s.height as f64),
            m.scale_factor(),
        )
    } else {
        ((0.0, 0.0, 1920.0, 1080.0), 1.0)
    };

    #[cfg(target_os = "linux")]
    let wayland = is_wayland_session();
    #[cfg(not(target_os = "linux"))]
    let wayland = false;

    let mon_rect = scale_corrected_monitor_rect(mon_rect, scale, wayland);
    let (icon_x, icon_y, icon_w, icon_h) =
        scale_corrected_monitor_rect((icon_x, icon_y, icon_w, icon_h), scale, wayland);

    let geom = compute_quick_panel_geometry(
        (icon_x, icon_y, icon_w, icon_h),
        mon_rect,
        scale,
        QUICK_PANEL_LOGICAL_WIDTH,
        QUICK_PANEL_LOGICAL_HEIGHT,
    );

    if let Some(window) = app.get_webview_window("quick") {
        let _ = window.set_position(tauri::PhysicalPosition::new(geom.x, geom.y));
        let _ = window.set_size(tauri::PhysicalSize::new(geom.width, geom.height));
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    match tauri::WebviewWindowBuilder::new(
        app,
        "quick",
        tauri::WebviewUrl::App("index.html?window=quick".into()),
    )
    .title("Entracte — 快速面板")
    .inner_size(QUICK_PANEL_LOGICAL_WIDTH, QUICK_PANEL_LOGICAL_HEIGHT)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .decorations(false)
    .always_on_top(true)
    .build()
    {
        Ok(window) => {
            let w_clone = window.clone();
            let seen_focus = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
            let seen_clone = seen_focus.clone();
            window.on_window_event(move |event| {
                let focused = match event {
                    tauri::WindowEvent::Focused(focused) => *focused,
                    _ => return,
                };
                match quick_panel_focus_action(
                    seen_clone.load(std::sync::atomic::Ordering::SeqCst),
                    focused,
                ) {
                    QuickPanelFocusAction::RememberFocus => {
                        seen_clone.store(true, std::sync::atomic::Ordering::SeqCst);
                    }
                    QuickPanelFocusAction::Close => {
                        let _ = w_clone.close();
                    }
                    QuickPanelFocusAction::Ignore => {}
                }
            });
            let _ = window.set_position(tauri::PhysicalPosition::new(geom.x, geom.y));
            let _ = window.set_size(tauri::PhysicalSize::new(geom.width, geom.height));
            let _ = window.set_focus();
            if window.is_focused().unwrap_or(false) {
                seen_focus.store(true, std::sync::atomic::Ordering::SeqCst);
            }
            log::debug!("quick: created quick panel window at {:?}", geom);
        }
        Err(e) => log::error!("quick: failed to create quick panel window: {e}"),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum QuickPanelFocusAction {
    Ignore,
    RememberFocus,
    Close,
}

pub(crate) fn quick_panel_focus_action(seen_focus: bool, focused: bool) -> QuickPanelFocusAction {
    if focused {
        QuickPanelFocusAction::RememberFocus
    } else if seen_focus {
        QuickPanelFocusAction::Close
    } else {
        QuickPanelFocusAction::Ignore
    }
}

#[cfg(test)]
mod tests {
    use super::{nudged_dimension, wayland_fix_strategy, wayland_session_from_env, WaylandFix};

    #[test]
    fn grows_normal_dimension_by_one() {
        assert_eq!(nudged_dimension(800), 801);
        assert_eq!(nudged_dimension(0), 1);
    }

    #[test]
    fn shrinks_when_at_ceiling_so_value_still_changes() {
        assert_eq!(nudged_dimension(u32::MAX), u32::MAX - 1);
    }

    #[test]
    fn nudged_value_always_differs_from_input() {
        for v in [0u32, 1, 600, 800, u32::MAX - 1, u32::MAX] {
            assert_ne!(nudged_dimension(v), v);
        }
    }

    #[test]
    fn unset_blank_or_unknown_defaults_to_maximize() {
        assert_eq!(WaylandFix::from_env_value(None), WaylandFix::Maximize);
        assert_eq!(WaylandFix::from_env_value(Some("")), WaylandFix::Maximize);
        assert_eq!(
            WaylandFix::from_env_value(Some("   ")),
            WaylandFix::Maximize
        );
        assert_eq!(
            WaylandFix::from_env_value(Some("wobble")),
            WaylandFix::Maximize
        );
    }

    #[test]
    fn parses_each_strategy_case_insensitively_and_trimmed() {
        assert_eq!(WaylandFix::from_env_value(Some("off")), WaylandFix::Off);
        assert_eq!(WaylandFix::from_env_value(Some(" OFF ")), WaylandFix::Off);
        assert_eq!(WaylandFix::from_env_value(Some("nudge")), WaylandFix::Nudge);
        assert_eq!(WaylandFix::from_env_value(Some("Nudge")), WaylandFix::Nudge);
        assert_eq!(
            WaylandFix::from_env_value(Some("maximize")),
            WaylandFix::Maximize
        );
        assert_eq!(
            WaylandFix::from_env_value(Some("MAXIMIZE")),
            WaylandFix::Maximize
        );
    }

    #[test]
    fn as_str_round_trips_through_from_env_value() {
        for fix in [WaylandFix::Off, WaylandFix::Nudge, WaylandFix::Maximize] {
            assert_eq!(WaylandFix::from_env_value(Some(fix.as_str())), fix);
        }
    }

    #[test]
    fn strategy_from_process_env_is_a_valid_variant() {
        // Exercises the env-reading wrapper without mutating process-global
        // state: whatever the ambient env, the result must round-trip.
        let s = wayland_fix_strategy();
        assert_eq!(WaylandFix::from_env_value(Some(s.as_str())), s);
    }

    #[test]
    fn wayland_session_detected_from_either_signal() {
        assert!(wayland_session_from_env(Some("wayland"), false));
        assert!(wayland_session_from_env(Some("WAYLAND"), false));
        assert!(wayland_session_from_env(None, true));
        assert!(wayland_session_from_env(Some("x11"), true));
    }

    #[test]
    fn x11_or_absent_session_is_not_wayland() {
        assert!(!wayland_session_from_env(Some("x11"), false));
        assert!(!wayland_session_from_env(Some("tty"), false));
        assert!(!wayland_session_from_env(None, false));
    }

    #[test]
    fn quick_panel_geometry_centers_on_icon_with_retina_scale() {
        // macOS Retina 2x: monitor 3024x1964, icon at top (x=2700, y=0, w=48, h=48)
        let geom = super::compute_quick_panel_geometry(
            (2700.0, 0.0, 48.0, 48.0),
            (0.0, 0.0, 3024.0, 1964.0),
            2.0,
            super::QUICK_PANEL_LOGICAL_WIDTH,
            super::QUICK_PANEL_LOGICAL_HEIGHT,
        );
        assert_eq!(geom.width, 560);
        assert_eq!(geom.height, 640);
        // Icon center is 2700 + 24 = 2724. Target x = 2724 - 280 = 2444
        assert_eq!(geom.x, 2444);
        // Icon y=0, h=48, gap = 4*2 = 8. Target y = 0 + 48 + 8 = 56
        assert_eq!(geom.y, 56);
    }

    #[test]
    fn quick_panel_geometry_clamps_to_monitor_bounds() {
        let geom = super::compute_quick_panel_geometry(
            (1900.0, 0.0, 20.0, 20.0),
            (0.0, 0.0, 1920.0, 1080.0),
            1.0,
            super::QUICK_PANEL_LOGICAL_WIDTH,
            super::QUICK_PANEL_LOGICAL_HEIGHT,
        );
        // Right margin is 8px: max_x = 1920 - 280 - 8 = 1632
        assert_eq!(geom.x, 1632);
        assert_eq!(geom.y, 24);
    }

    #[test]
    fn quick_panel_geometry_places_above_for_bottom_taskbar() {
        let geom = super::compute_quick_panel_geometry(
            (1800.0, 1040.0, 40.0, 40.0),
            (0.0, 0.0, 1920.0, 1080.0),
            1.0,
            super::QUICK_PANEL_LOGICAL_WIDTH,
            super::QUICK_PANEL_LOGICAL_HEIGHT,
        );
        // target_y = 1040 - 320 - 4 = 716
        assert_eq!(geom.y, 716);
    }

    #[test]
    fn scale_corrected_monitor_rect_divides_out_doubled_wayland_geometry() {
        let reported = (7680.0, 0.0, 7680.0, 4320.0);
        let r = super::scale_corrected_monitor_rect(reported, 2.0, true);
        assert_eq!(r, (3840.0, 0.0, 3840.0, 2160.0));
    }

    #[test]
    fn scale_corrected_monitor_rect_noop_off_wayland() {
        let reported = (0.0, 0.0, 3840.0, 2160.0);
        assert_eq!(
            super::scale_corrected_monitor_rect(reported, 2.0, false),
            reported
        );
    }

    #[test]
    fn scale_corrected_monitor_rect_noop_at_unity_scale() {
        let reported = (1920.0, 0.0, 1920.0, 1080.0);
        assert_eq!(
            super::scale_corrected_monitor_rect(reported, 1.0, true),
            reported
        );
    }

    #[test]
    fn quick_panel_focus_action_ignores_blur_before_first_focus() {
        assert_eq!(
            super::quick_panel_focus_action(false, false),
            super::QuickPanelFocusAction::Ignore
        );
    }

    #[test]
    fn quick_panel_focus_action_remembers_focus_then_closes_on_blur() {
        assert_eq!(
            super::quick_panel_focus_action(false, true),
            super::QuickPanelFocusAction::RememberFocus
        );
        assert_eq!(
            super::quick_panel_focus_action(true, true),
            super::QuickPanelFocusAction::RememberFocus
        );
        assert_eq!(
            super::quick_panel_focus_action(true, false),
            super::QuickPanelFocusAction::Close
        );
    }
}
