use std::sync::{Arc, Mutex};
use std::time::Duration;

use chrono::{Local, Timelike};
use tauri::{
    image::Image,
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Emitter, Listener, Manager,
};

use crate::scheduler::{
    format_countdown, BreakKind, LastBreakInfo, Scheduler, TrayCountdownSnapshot, TrayStyle,
};

mod comet;
use comet::{progress_bucket, progress_ring_rgba, PROGRESS_RING_SIZE};

const TRAY_ICON_BYTES: &[u8] = include_bytes!("../icons/trayIconTemplate.png");
#[cfg_attr(target_os = "windows", allow(dead_code))]
const TRAY_ICON_PAUSED_BYTES: &[u8] = include_bytes!("../icons/trayIconPausedTemplate.png");
// Fork: a standalone crescent instead of upstream's arch-with-moon-inside.
// Upstream's own icon set is already inconsistent here — the Paused glyph is a
// bare `‖` with no arch — so nesting the moon inside the brand arch was the odd
// one out. A lone crescent also renders narrower, which the menu bar cares about.
// Kept as a separate asset so upstream's PNG stays untouched: binary conflicts
// can't be resolved with text tooling, and a new file never conflicts at all.
#[cfg_attr(target_os = "windows", allow(dead_code))]
const TRAY_ICON_BEDTIME_BYTES: &[u8] = include_bytes!("../icons/trayIconBedtimeMoonTemplate.png");
// Distinct icon for the auto-suppressed state (DND / camera / video /
// app-pause / idle / out-of-work-window). Previously this state shared
// the Paused icon, which made every webcam call or video tab look like
// the user had hit Pause — confusing diagnostic noise on the tray.
#[cfg_attr(target_os = "windows", allow(dead_code))]
const TRAY_ICON_INACTIVE_BYTES: &[u8] = include_bytes!("../icons/trayIconInactiveTemplate.png");

#[cfg_attr(target_os = "windows", allow(dead_code))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TrayIconKind {
    Normal,
    Paused,
    Bedtime,
    Inactive,
}

#[cfg_attr(target_os = "windows", allow(dead_code))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum RenderedTrayIcon {
    Static(TrayIconKind),
    Progress(u8),
}

#[cfg_attr(target_os = "windows", allow(dead_code))]
impl TrayIconKind {
    fn bytes(self) -> &'static [u8] {
        match self {
            TrayIconKind::Normal => TRAY_ICON_BYTES,
            TrayIconKind::Paused => TRAY_ICON_PAUSED_BYTES,
            TrayIconKind::Bedtime => TRAY_ICON_BEDTIME_BYTES,
            TrayIconKind::Inactive => TRAY_ICON_INACTIVE_BYTES,
        }
    }
}

#[tauri::command]
pub fn seconds_until_tomorrow_morning() -> u64 {
    let now = Local::now();
    let target = (now + chrono::Duration::days(1))
        .with_hour(6)
        .and_then(|t| t.with_minute(0))
        .and_then(|t| t.with_second(0))
        .and_then(|t| t.with_nanosecond(0))
        .unwrap_or(now);
    ((target.timestamp() - now.timestamp()).max(60)) as u64
}

fn resume_break_label(kind: Option<BreakKind>) -> String {
    match kind {
        Some(BreakKind::Micro) => "恢复上次跳过的短休息".to_string(),
        Some(BreakKind::Long) => "恢复上次跳过的长休息".to_string(),
        Some(BreakKind::Sleep) => "恢复上次跳过的就寝提醒".to_string(),
        None => "恢复上次跳过的休息".to_string(),
    }
}

fn tooltip_for(profile: &str) -> String {
    format!("Entracte · {profile}")
}

/// Tooltip that also explains the current visual state. When breaks
/// are silently auto-suppressed (DND, camera, video, app-pause,
/// off-hours) we append a "Why: …" line so a hover answers the
/// "why is the icon dim?" question without opening Settings.
fn tooltip_for_state(profile: &str, snapshot: &TrayCountdownSnapshot) -> String {
    let base = tooltip_for(profile);
    match snapshot {
        TrayCountdownSnapshot::Suppressed(r) => format!("{base}\n拦截：{}", r.human()),
        TrayCountdownSnapshot::Paused => format!("{base}\n已暂停"),
        TrayCountdownSnapshot::Bedtime => format!("{base}\n就寝提醒"),
        TrayCountdownSnapshot::OnBreak => format!("{base}\n正在休息"),
        TrayCountdownSnapshot::Disabled
        | TrayCountdownSnapshot::Idle
        | TrayCountdownSnapshot::Running(_) => base,
    }
}

fn profile_menu_id(name: &str) -> String {
    format!("profile:{name}")
}

fn build_profile_submenu(
    app: &AppHandle,
    profiles: &[String],
    active: &str,
) -> tauri::Result<Submenu<tauri::Wry>> {
    let mut items: Vec<CheckMenuItem<tauri::Wry>> = Vec::with_capacity(profiles.len());
    for name in profiles {
        let item = CheckMenuItem::with_id(
            app,
            profile_menu_id(name),
            name,
            true,
            name == active,
            None::<&str>,
        )?;
        items.push(item);
    }
    let item_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = items
        .iter()
        .map(|i| i as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
        .collect();
    Submenu::with_items(app, "当前情景", true, &item_refs)
}

// Daily reminders are prose rather than terse to-dos, so their menu rows
// get a little more room before truncating.
const TRAY_REMINDER_MAX_CHARS: usize = 42;

/// Flatten a chore to one menu-safe line and truncate past `max` characters
/// with an ellipsis. Pure.
fn truncate_label(s: &str, max_chars: usize) -> String {
    let flat = s.replace(['\r', '\n'], " ").trim().to_string();
    if flat.chars().count() <= max_chars {
        flat
    } else {
        let cut: String = flat.chars().take(max_chars).collect();
        format!("{cut}…")
    }
}

/// The menu items that never change across rebuilds. Cloned per rebuild —
/// `Menu::with_items` only borrows them for construction, but the same
/// items must stay alive for the tray's lifetime anyway.
#[derive(Clone)]
struct FixedTrayItems {
    countdown: MenuItem<tauri::Wry>,
    prefs: MenuItem<tauri::Wry>,
    resume: MenuItem<tauri::Wry>,
    pause_submenu: Submenu<tauri::Wry>,
    resume_break: MenuItem<tauri::Wry>,
    sep1: PredefinedMenuItem<tauri::Wry>,
    sep2: PredefinedMenuItem<tauri::Wry>,
    sep3: PredefinedMenuItem<tauri::Wry>,
    sep4: PredefinedMenuItem<tauri::Wry>,
    sep5: PredefinedMenuItem<tauri::Wry>,
    quit: MenuItem<tauri::Wry>,
}

/// The user's daily reminders as a submenu, styled like the profile one:
/// the parent row reads "每日提醒 ›" and hovering opens the entries.
/// Rows are disabled — the submenu is a notice board, not actions — and
/// each entry is truncated to keep the menu from over-widening. An empty
/// list builds nothing.
/// Row labels for the daily-reminder submenu: the entries verbatim, each
/// truncated to [`TRAY_REMINDER_MAX_CHARS`]. Pure so the truncation rule
/// is unit-testable without a Tauri app handle.
fn daily_reminder_row_labels(items: &[String]) -> Vec<String> {
    items
        .iter()
        .map(|row| truncate_label(row, TRAY_REMINDER_MAX_CHARS))
        .collect()
}

fn build_daily_reminder_submenu(
    app: &AppHandle,
    items: &[String],
) -> tauri::Result<Option<Submenu<tauri::Wry>>> {
    if items.is_empty() {
        return Ok(None);
    }
    let labels = daily_reminder_row_labels(items);
    let rows: Vec<MenuItem<tauri::Wry>> = labels
        .iter()
        .enumerate()
        .map(|(i, row)| {
            // Enabled so the rows read as live entries rather than greyed-out
            // chrome; clicking any of them jumps to the list that owns them.
            MenuItem::with_id(
                app,
                format!("daily_reminder_{i}"),
                row.clone(),
                true,
                None::<&str>,
            )
        })
        .collect::<tauri::Result<_>>()?;
    let refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> =
        rows.iter().map(|r| r as &dyn tauri::menu::IsMenuItem<_>).collect();
    Ok(Some(Submenu::with_items(app, "每日提醒", true, &refs)?))
}

/// Assemble the full tray menu. The chore group (header + rows) sits
/// between the "恢复上次跳过的休息" block and `quit`; with no chores today
/// the group and its trailing separator are omitted entirely.
fn assemble_menu(
    app: &AppHandle,
    fixed: &FixedTrayItems,
    profile_submenu: &Submenu<tauri::Wry>,
    daily_reminders: &[String],
) -> tauri::Result<Menu<tauri::Wry>> {
    let reminder_submenu = build_daily_reminder_submenu(app, daily_reminders)?;
    let reminder_sep;
    let mut items: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = vec![
        &fixed.countdown,
        &fixed.sep1,
        &fixed.prefs,
        &fixed.sep2,
        &fixed.resume,
        &fixed.pause_submenu,
        &fixed.sep3,
    ];
    // The daily-reminder submenu sits directly above the profile one,
    // styled the same way (hover to expand). A separator keeps it apart
    // from the interactive items below.
    if let Some(submenu) = &reminder_submenu {
        items.push(submenu);
        reminder_sep = PredefinedMenuItem::separator(app)?;
        items.push(&reminder_sep);
    }
    items.push(profile_submenu);
    items.push(&fixed.sep4);
    items.push(&fixed.resume_break);
    items.push(&fixed.sep5);
    items.push(&fixed.quit);
    Menu::with_items(app, &items)
}

/// Rebuild the tray menu from the scheduler's current profiles and today's
/// chores. Shared by the `profile:changed` listener and the chores-change
/// trigger in the 1Hz ticker so the ordering lives in exactly one place.
async fn rebuild_tray_menu(
    app: &AppHandle,
    menu_holder: &Arc<Mutex<Menu<tauri::Wry>>>,
    profile_submenu_holder: &Arc<Mutex<Submenu<tauri::Wry>>>,
    tray: &Arc<TrayIcon<tauri::Wry>>,
    fixed: &FixedTrayItems,
) {
    let scheduler = app.state::<Scheduler>().inner().clone();
    let profiles: Vec<String> = scheduler
        .profiles
        .lock()
        .await
        .iter()
        .map(|p| p.name.clone())
        .collect();
    let active = scheduler.active_profile_name.lock().await.clone();
    let daily_reminders = scheduler.settings.lock().await.daily_reminders.clone();
    let Ok(new_submenu) = build_profile_submenu(app, &profiles, &active) else {
        return;
    };
    let Ok(new_menu) = assemble_menu(app, fixed, &new_submenu, &daily_reminders) else {
        return;
    };
    let _ = tray.set_menu(Some(new_menu.clone()));
    let _ = tray.set_tooltip(Some(tooltip_for(&active)));
    if let Ok(mut slot) = menu_holder.lock() {
        *slot = new_menu;
    }
    if let Ok(mut slot) = profile_submenu_holder.lock() {
        *slot = new_submenu;
    }
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let countdown = MenuItem::with_id(app, "countdown", "休息未启用", false, None::<&str>)?;
    let prefs = MenuItem::with_id(app, "preferences", "打开设置", true, None::<&str>)?;
    let resume = MenuItem::with_id(app, "resume", "恢复", false, None::<&str>)?;
    let resume_break = MenuItem::with_id(
        app,
        "resume_break",
        resume_break_label(None),
        false,
        None::<&str>,
    )?;

    let pause_15m = MenuItem::with_id(app, "pause_15m", "15 分钟", true, None::<&str>)?;
    let pause_30m = MenuItem::with_id(app, "pause_30m", "30 分钟", true, None::<&str>)?;
    let pause_1h = MenuItem::with_id(app, "pause_1h", "1 小时", true, None::<&str>)?;
    let pause_2h = MenuItem::with_id(app, "pause_2h", "2 小时", true, None::<&str>)?;
    let pause_4h = MenuItem::with_id(app, "pause_4h", "4 小时", true, None::<&str>)?;
    let pause_tomorrow =
        MenuItem::with_id(app, "pause_tomorrow", "直到明早 6 点", true, None::<&str>)?;
    let pause_indef = MenuItem::with_id(app, "pause_indef", "无限期", true, None::<&str>)?;
    let pause_sep = PredefinedMenuItem::separator(app)?;
    let pause_until = MenuItem::with_id(app, "pause_until", "暂停直到…", true, None::<&str>)?;
    let pause_submenu = Submenu::with_items(
        app,
        "暂停…",
        true,
        &[
            &pause_15m,
            &pause_30m,
            &pause_1h,
            &pause_2h,
            &pause_4h,
            &pause_tomorrow,
            &pause_indef,
            &pause_sep,
            &pause_until,
        ],
    )?;

    let initial_reminders = read_daily_reminders_blocking(app);
    let (initial_profiles, initial_active) = read_profiles_blocking(app);
    let profile_submenu = build_profile_submenu(app, &initial_profiles, &initial_active)?;

    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let sep4 = PredefinedMenuItem::separator(app)?;
    let sep5 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出 Entracte", true, None::<&str>)?;

    let fixed = FixedTrayItems {
        countdown: countdown.clone(),
        prefs: prefs.clone(),
        resume: resume.clone(),
        pause_submenu: pause_submenu.clone(),
        resume_break: resume_break.clone(),
        sep1: sep1.clone(),
        sep2: sep2.clone(),
        sep3: sep3.clone(),
        sep4: sep4.clone(),
        sep5: sep5.clone(),
        quit: quit.clone(),
    };
    let menu = assemble_menu(app, &fixed, &profile_submenu, &initial_reminders)?;

    let pause_submenu_for_event = pause_submenu.clone();
    let resume_for_event = resume.clone();
    let pause_submenu_for_click = pause_submenu.clone();
    let resume_for_click = resume.clone();
    let resume_break_for_event = resume_break.clone();

    let tray_icon = tray_image(TrayIconKind::Normal, std::env::consts::OS)?;

    let tray = TrayIconBuilder::with_id("main")
        .icon(tray_icon)
        .icon_as_template(icon_is_template(std::env::consts::OS))
        .menu(&menu)
        .tooltip(tooltip_for(&initial_active))
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                crate::window::show_main_window(app);
            }
        })
        .on_menu_event(move |app, event| {
            let id = event.id.as_ref();
            if let Some(profile_name) = id.strip_prefix("profile:") {
                let name = profile_name.to_string();
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    let scheduler = app_handle.state::<Scheduler>().inner().clone();
                    if let Err(e) =
                        crate::scheduler::set_active_profile_impl(&app_handle, &scheduler, name)
                            .await
                    {
                        eprintln!("set_active_profile failed: {e}");
                    }
                });
                return;
            }
            if id.starts_with("chore") {
                crate::window::show_main_window(app);
                let _ = app.emit("chores:open", ());
                return;
            }
            if id.starts_with("daily_reminder") {
                crate::window::show_main_window(app);
                let _ = app.emit("daily-reminders:open", ());
                return;
            }
            match id {
                "quit" => {
                    app.exit(0);
                }
                "preferences" => {
                    crate::window::show_main_window(app);
                }
                "pause_until" => {
                    crate::window::show_pause_window(app);
                }
                "resume" => {
                    let scheduler = app.state::<Scheduler>().inner().clone();
                    let app_handle = app.clone();
                    let pause_submenu = pause_submenu_for_click.clone();
                    let resume = resume_for_click.clone();
                    tauri::async_runtime::spawn(async move {
                        crate::scheduler::resume_impl(&scheduler).await;
                        let _ = pause_submenu.set_enabled(true);
                        let _ = resume.set_enabled(false);
                        let _ = app_handle.emit("pause:changed", false);
                    });
                }
                "resume_break" => {
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        let scheduler = app_handle.state::<Scheduler>().inner().clone();
                        let _ =
                            crate::scheduler::resume_last_break_impl(&app_handle, &scheduler).await;
                    });
                }
                _ => {}
            }

            let duration: Option<Option<u64>> = match id {
                "pause_15m" => Some(Some(15 * 60)),
                "pause_30m" => Some(Some(30 * 60)),
                "pause_1h" => Some(Some(60 * 60)),
                "pause_2h" => Some(Some(2 * 60 * 60)),
                "pause_4h" => Some(Some(4 * 60 * 60)),
                "pause_tomorrow" => Some(Some(seconds_until_tomorrow_morning())),
                "pause_indef" => Some(None),
                _ => None,
            };
            if let Some(duration_secs) = duration {
                let scheduler = app.state::<Scheduler>().inner().clone();
                let app_handle = app.clone();
                let pause_submenu = pause_submenu_for_click.clone();
                let resume = resume_for_click.clone();
                tauri::async_runtime::spawn(async move {
                    crate::scheduler::pause_impl(&scheduler, duration_secs).await;
                    let _ = pause_submenu.set_enabled(false);
                    let _ = resume.set_enabled(true);
                    let _ = app_handle.emit("pause:changed", true);
                });
            }
        })
        .build(app)?;

    let menu_holder: Arc<Mutex<Menu<tauri::Wry>>> = Arc::new(Mutex::new(menu));
    let profile_submenu_holder: Arc<Mutex<Submenu<tauri::Wry>>> =
        Arc::new(Mutex::new(profile_submenu));
    let tray_holder: Arc<TrayIcon<tauri::Wry>> = Arc::new(tray);

    app.listen("pause:changed", move |event| {
        let paused: bool = serde_json::from_str(event.payload()).unwrap_or(false);
        let _ = pause_submenu_for_event.set_enabled(!paused);
        let _ = resume_for_event.set_enabled(paused);
    });

    app.listen("last_break:changed", move |event| {
        let info: LastBreakInfo =
            serde_json::from_str(event.payload()).unwrap_or(LastBreakInfo { kind: None });
        let _ = resume_break_for_event.set_text(resume_break_label(info.kind));
        let _ = resume_break_for_event.set_enabled(info.kind.is_some());
    });

    let app_for_profile = app.clone();
    let menu_for_profile = menu_holder.clone();
    let profile_submenu_for_profile = profile_submenu_holder.clone();
    let tray_for_profile = tray_holder.clone();
    let fixed_for_profile = fixed.clone();
    app.listen("profile:changed", move |_event| {
        let app = app_for_profile.clone();
        let menu_holder = menu_for_profile.clone();
        let profile_submenu_holder = profile_submenu_for_profile.clone();
        let tray = tray_for_profile.clone();
        let fixed = fixed_for_profile.clone();
        tauri::async_runtime::spawn(async move {
            rebuild_tray_menu(&app, &menu_holder, &profile_submenu_holder, &tray, &fixed).await;
        });
    });

    // The ticker calls this when today's chore list moves — the menu rows
    // toggle presence with the list, so a text patch isn't enough.
    let on_chores_changed = {
        let app = app.clone();
        let menu_holder = menu_holder.clone();
        let profile_submenu_holder = profile_submenu_holder.clone();
        let tray = tray_holder.clone();
        let fixed = fixed.clone();
        Arc::new(move || {
            let app = app.clone();
            let menu_holder = menu_holder.clone();
            let profile_submenu_holder = profile_submenu_holder.clone();
            let tray = tray.clone();
            let fixed = fixed.clone();
            tauri::async_runtime::spawn(async move {
                rebuild_tray_menu(&app, &menu_holder, &profile_submenu_holder, &tray, &fixed)
                    .await;
            });
        }) as Arc<dyn Fn() + Send + Sync>
    };

    spawn_countdown_ticker(
        app.clone(),
        tray_holder.clone(),
        countdown.clone(),
        on_chores_changed,
    );

    Ok(())
}

fn countdown_menu_label(snapshot: &TrayCountdownSnapshot) -> String {
    match snapshot {
        TrayCountdownSnapshot::Running(secs) => {
            format!("下次休息 {}:{:02}", secs / 60, secs % 60)
        }
        TrayCountdownSnapshot::Paused => "已暂停".to_string(),
        TrayCountdownSnapshot::Bedtime => "就寝提醒进行中".to_string(),
        TrayCountdownSnapshot::OnBreak => "正在休息".to_string(),
        TrayCountdownSnapshot::Suppressed(reason) => {
            format!("已拦截：{}", reason.short_label())
        }
        TrayCountdownSnapshot::Idle | TrayCountdownSnapshot::Disabled => "休息未启用".to_string(),
    }
}

#[cfg_attr(target_os = "windows", allow(dead_code))]
fn tray_title_for(snapshot: &TrayCountdownSnapshot, text_enabled: bool) -> Option<String> {
    // Tray title is always-visible real estate. Users who turned off
    // the countdown text don't want ANY text bleed (paused, reason,
    // etc.) — the icon swap alone carries the signal. The tooltip
    // (hover-only, opt-in) still shows the reason regardless.
    if !text_enabled {
        return Some(String::new());
    }
    let body = match snapshot {
        TrayCountdownSnapshot::Disabled => return Some(String::new()),
        TrayCountdownSnapshot::Paused => "已暂停".to_string(),
        TrayCountdownSnapshot::Bedtime => return Some(String::new()),
        TrayCountdownSnapshot::OnBreak => return Some(String::new()),
        TrayCountdownSnapshot::Suppressed(r) => return Some(r.short_label().to_string()),
        TrayCountdownSnapshot::Idle => return Some(String::new()),
        TrayCountdownSnapshot::Running(secs) => format_countdown(*secs),
    };
    // No leading space: AppKit already sets the icon/title gap, and the
    // padded glyph no longer carries transparent margin on its right edge.
    Some(body)
}

/// Whether the tray icon should be registered as a template image.
///
/// Template mode is a macOS-only concept: AppKit recolours a monochrome
/// template glyph to suit the light/dark menu bar. On Linux
/// (StatusNotifierItem / AppIndicator) and Windows there is no template
/// recolouring, so a dark monochrome glyph stays dark and vanishes against
/// a dark panel (#86). Only macOS gets template mode.
fn icon_is_template(os: &str) -> bool {
    os == "macos"
}

// Panel-agnostic recolouring of the monochrome template glyph for
// platforms without template support (Linux/Windows). The glyph body is
// painted near-white so it reads on the dark GNOME top bar — which is
// black regardless of the GTK light/dark theme — and ringed with a
// near-black outline so it still reads on light KDE/XFCE/Windows panels.
// #86: turning template mode off alone left the glyph pure black, so it
// stayed invisible on the dark panel that prompted the report.
const TRAY_FILL_RGB: [u8; 3] = [0xF2, 0xF2, 0xF2];
const TRAY_OUTLINE_RGB: [u8; 3] = [0x14, 0x14, 0x14];
// Radius in source pixels. The PNGs are 200×200 and the panel renders
// them ~22px tall, so this ~8px ring survives the downscale as a ~1px halo.
const TRAY_OUTLINE_RADIUS: i32 = 8;
// Pixels at/above this alpha count as glyph body; below is background.
const TRAY_ALPHA_THRESHOLD: u8 = 16;

/// Repaint a monochrome glyph's body to `fill` and ring it with `outline`,
/// so it contrasts against both light and dark panels. Glyph-body alpha is
/// preserved (anti-aliased edges stay smooth); the outline ring is fully
/// opaque; everything else stays transparent.
fn outline_glyph(
    rgba: &[u8],
    width: u32,
    height: u32,
    radius: i32,
    fill: [u8; 3],
    outline: [u8; 3],
) -> Vec<u8> {
    let w = width as i32;
    let h = height as i32;
    let is_body = |x: i32, y: i32| -> bool {
        x >= 0
            && y >= 0
            && x < w
            && y < h
            && rgba[((y * w + x) as usize) * 4 + 3] >= TRAY_ALPHA_THRESHOLD
    };
    let r2 = radius * radius;
    let mut out = vec![0u8; rgba.len()];
    for y in 0..h {
        for x in 0..w {
            let i = ((y * w + x) as usize) * 4;
            let a = rgba[i + 3];
            if a >= TRAY_ALPHA_THRESHOLD {
                out[i] = fill[0];
                out[i + 1] = fill[1];
                out[i + 2] = fill[2];
                out[i + 3] = a;
                continue;
            }
            let mut near = false;
            'scan: for dy in -radius..=radius {
                for dx in -radius..=radius {
                    if dx * dx + dy * dy > r2 {
                        continue;
                    }
                    if is_body(x + dx, y + dy) {
                        near = true;
                        break 'scan;
                    }
                }
            }
            if near {
                out[i] = outline[0];
                out[i + 1] = outline[1];
                out[i + 2] = outline[2];
                out[i + 3] = 255;
            }
        }
    }
    out
}

fn outline_glyph_for_panels(rgba: &[u8], width: u32, height: u32) -> Vec<u8> {
    outline_glyph(
        rgba,
        width,
        height,
        TRAY_OUTLINE_RADIUS,
        TRAY_FILL_RGB,
        TRAY_OUTLINE_RGB,
    )
}

// Match the static glyphs so the ring doesn't sit taller than ChatGPT.
// Same fraction as TRAY_GLYPH_SCALE on purpose — one visual size for every
// glyph the tray can show.
const PROGRESS_GLYPH_SCALE: f32 = TRAY_GLYPH_SCALE;


fn progress_ring_image(bucket: u8, os: &str) -> tauri::Result<Image<'static>> {
    let rgba = progress_ring_rgba(bucket.min(60) as f64 / 60.0);
    let (padded, w, h) = pad_glyph_scaled(
        &rgba,
        PROGRESS_RING_SIZE,
        PROGRESS_RING_SIZE,
        PROGRESS_GLYPH_SCALE,
    );
    if icon_is_template(os) {
        return Ok(Image::new_owned(padded, w, h));
    }
    Ok(Image::new_owned(
        outline_glyph_for_panels(&padded, w, h),
        w,
        h,
    ))
}

/// Fraction of the padded canvas *height* the glyph occupies. The shipped
/// assets bleed to all four edges, so the OS scales them to the full
/// menu-bar height and the glyph reads noticeably chunkier than system
/// icons, which conventionally leave a couple of points of breathing room.
#[cfg_attr(target_os = "windows", allow(dead_code))]
const TRAY_GLYPH_SCALE: f32 = 0.78;

/// Centre `rgba` vertically in a taller transparent canvas so the glyph
/// occupies `TRAY_GLYPH_SCALE` of the height. Pure translation — no
/// resampling, so the glyph stays pixel-exact and only gains margin.
///
/// Height only, deliberately. The OS scales the canvas to the menu-bar
/// height, so vertical margin is what shrinks the glyph; horizontal margin
/// would ride along as dead transparent pixels and waste menu-bar width —
/// the one resource the menu bar is actually short of. Keeping the width
/// tight also narrows the whole status item as the glyph shrinks.
#[cfg_attr(target_os = "windows", allow(dead_code))]
fn pad_glyph(rgba: &[u8], width: u32, height: u32) -> (Vec<u8>, u32, u32) {
    pad_glyph_scaled(rgba, width, height, TRAY_GLYPH_SCALE)
}

#[cfg_attr(target_os = "windows", allow(dead_code))]
fn pad_glyph_scaled(
    rgba: &[u8],
    width: u32,
    height: u32,
    scale: f32,
) -> (Vec<u8>, u32, u32) {
    let out_h = ((height as f32) / scale).round() as u32;
    let off_y = (out_h - height) / 2;
    let row_len = (width * 4) as usize;
    let mut out = vec![0u8; (width * out_h * 4) as usize];
    for row in 0..height {
        let src = (row * width * 4) as usize;
        let dst = ((row + off_y) * width * 4) as usize;
        out[dst..dst + row_len].copy_from_slice(&rgba[src..src + row_len]);
    }
    (out, width, out_h)
}

/// Decode a tray-icon asset and adapt it to the platform: macOS keeps the
/// raw black template (AppKit tints it), every other OS gets the
/// light-fill/dark-outline recolour so the glyph survives a dark panel (#86).
/// Both paths get the glyph padded first so the tray icon isn't oversized.
fn tray_image(kind: TrayIconKind, os: &str) -> tauri::Result<Image<'static>> {
    let base = Image::from_bytes(kind.bytes())?;
    let (padded, w, h) = pad_glyph(base.rgba(), base.width(), base.height());
    if icon_is_template(os) {
        return Ok(Image::new_owned(padded, w, h));
    }
    let rgba = outline_glyph_for_panels(&padded, w, h);
    Ok(Image::new_owned(rgba, w, h))
}

#[cfg_attr(target_os = "windows", allow(dead_code))]
fn tray_icon_kind_for(snapshot: &TrayCountdownSnapshot) -> TrayIconKind {
    match snapshot {
        TrayCountdownSnapshot::Bedtime => TrayIconKind::Bedtime,
        TrayCountdownSnapshot::Paused => TrayIconKind::Paused,
        TrayCountdownSnapshot::Suppressed(_) => TrayIconKind::Inactive,
        _ => TrayIconKind::Normal,
    }
}

fn spawn_countdown_ticker(
    app: AppHandle,
    tray: Arc<TrayIcon<tauri::Wry>>,
    countdown: MenuItem<tauri::Wry>,
    on_chores_changed: Arc<dyn Fn() + Send + Sync>,
) {
    tauri::async_runtime::spawn(async move {
        // `Some(None)` means "currently hidden"; the outer `None` only
        // means "nothing pushed yet", so the first tick always writes.
        let mut last_icon: Option<Option<RenderedTrayIcon>> = None;
        let mut last_tooltip: Option<String> = None;
        let mut last_chores_sig: Option<String> = None;
        #[cfg(not(target_os = "windows"))]
        let mut last_title: Option<String> = None;
        #[cfg(not(target_os = "windows"))]
        let mut last_standalone: Option<bool> = None;
        loop {
            let scheduler = app.state::<Scheduler>().inner().clone();
            let (snapshot, text_enabled) = scheduler.tray_countdown_snapshot().await;
            let tray_style = scheduler.tray_style().await;
            let _ = countdown.set_text(countdown_menu_label(&snapshot));
            let _ = countdown.set_enabled(false);

            // The tray's chore rows and the daily-reminder block toggle
            // presence with their content, so the menu needs a rebuild
            // when — and only when — either moved (same value-changed rule
            // as icon / title).
            let chores_sig = {
                let c = scheduler.chores.lock().await;
                let reminders = scheduler.settings.lock().await.daily_reminders.join("\u{1f}");
                format!("{}|{}|{}", c.date, c.items.join("\u{1f}"), reminders)
            };
            if Some(&chores_sig) != last_chores_sig.as_ref() {
                on_chores_changed();
                last_chores_sig = Some(chores_sig);
            }

            #[cfg(not(target_os = "windows"))]
            let title = tray_title_for(&snapshot, text_enabled);

            // The glyph hides only while a number is actually on screen.
            // Paused / bedtime / on-break / idle all blank the title, and a
            // status item with neither glyph nor title collapses to zero
            // width — the menu would become unreachable. Windows renders no
            // title at all, so the glyph is unconditional there.
            #[cfg(not(target_os = "windows"))]
            let show_icon = !matches!(tray_style, TrayStyle::CountdownOnly)
                || title.as_deref().unwrap_or("").is_empty();
            #[cfg(target_os = "windows")]
            let show_icon = true;

            let rendered_icon = if show_icon {
                match (tray_style, snapshot) {
                    (TrayStyle::ProgressRing, TrayCountdownSnapshot::Running(remaining)) => {
                        scheduler
                            .tray_countdown_interval_secs()
                            .await
                            .map(|interval| {
                                RenderedTrayIcon::Progress(progress_bucket(remaining, interval))
                            })
                            .or(Some(RenderedTrayIcon::Static(TrayIconKind::Normal)))
                    }
                    _ => Some(RenderedTrayIcon::Static(tray_icon_kind_for(&snapshot))),
                }
            } else {
                None
            };
            // polish_macos_tray resizes the glyph after an icon swap and
            // re-applies the countdown's blue attributed title after a
            // text change — both flagged above/below; skip it when neither
            // moved.
            if Some(rendered_icon) != last_icon {
                match rendered_icon {
                    Some(rendered) => {
                        let icon = match rendered {
                            RenderedTrayIcon::Static(kind) => {
                                tray_image(kind, std::env::consts::OS)
                            }
                            RenderedTrayIcon::Progress(bucket) => {
                                progress_ring_image(bucket, std::env::consts::OS)
                            }
                        };
                        if let Ok(icon) = icon {
                            let _ = tray.set_icon(Some(icon));
                            let _ =
                                tray.set_icon_as_template(icon_is_template(std::env::consts::OS));
                        }
                    }
                    None => {
                        let _ = tray.set_icon(None);
                    }
                }
                last_icon = Some(rendered_icon);
            }
            // Tooltip refresh also runs on Windows — that platform's
            // tray doesn't render a title, but the tooltip is the only
            // place a hover can say "Inactive: camera in use".
            let profile = scheduler.active_profile_name.lock().await.clone();
            let tooltip = tooltip_for_state(&profile, &snapshot);
            if Some(&tooltip) != last_tooltip.as_ref() {
                let _ = tray.set_tooltip(Some(tooltip.clone()));
                last_tooltip = Some(tooltip);
            }
            #[cfg(not(target_os = "windows"))]
            {
                // Standalone (no glyph beside it) changes how the number
                // should be styled, so re-apply when either input moves.
                let standalone = !show_icon;
                if title != last_title || Some(standalone) != last_standalone {
                    let _ = tray.set_title(title.clone());
                    #[cfg(target_os = "macos")]
                    {
                        let _ = app
                            .run_on_main_thread(move || apply_monospaced_status_titles(standalone));
                    }
                    last_title = title;
                    last_standalone = Some(standalone);
                }
            }
            // `text_enabled` is consumed by the title-gating block above;
            // Windows skips that block so we silence the unused warning.
            #[cfg(target_os = "windows")]
            let _ = text_enabled;
            // After set_text / set_icon / set_title so we overwrite tray-icon's
            // 18pt image size and Tauri's plain (gray, disabled) menu title.
            #[cfg(target_os = "macos")]
            {
                let _ = app.run_on_main_thread(polish_macos_tray);
            }
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    });
}

/// Tray title size as a fraction of the system menu-bar font, when the
/// number sits *beside the glyph*. Full menu-bar size reads large next to
/// the padded glyph, so it is scaled down to match. Lower to shrink.
#[cfg(target_os = "macos")]
const TRAY_TITLE_FONT_SCALE: f64 = 0.82;

/// Vertical nudge for the tray title beside the glyph, in points. AppKit
/// aligns the title on the button's baseline, which sits high against the
/// glyph's optical centre. Negative moves the number down.
#[cfg(target_os = "macos")]
const TRAY_TITLE_BASELINE_OFFSET: f64 = -1.0;

/// Size and nudge when the number stands alone (glyph hidden). Both revert
/// to the system defaults: with no glyph to match, the number should read
/// as ordinary menu-bar text, the same size and baseline as every other
/// item in the bar. Shrinking or nudging it here would make it the one
/// misaligned thing in the row.
#[cfg(target_os = "macos")]
const TRAY_TITLE_FONT_SCALE_STANDALONE: f64 = 1.0;
#[cfg(target_os = "macos")]
const TRAY_TITLE_BASELINE_OFFSET_STANDALONE: f64 = 0.0;

#[cfg(target_os = "macos")]
fn apply_monospaced_status_titles(standalone: bool) {
    use objc2::msg_send;
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::AnyThread;
    use objc2_app_kit::{
        NSBaselineOffsetAttributeName, NSFont, NSFontAttributeName,
        NSFontFeatureSelectorIdentifierKey, NSFontFeatureSettingsAttribute,
        NSFontFeatureTypeIdentifierKey, NSStatusBar,
    };
    use objc2_foundation::{
        MainThreadMarker, NSArray, NSAttributedString, NSDictionary, NSNumber, NSString,
    };

    let Some(mtm) = MainThreadMarker::new() else {
        return;
    };

    unsafe {
        let bar = NSStatusBar::systemStatusBar();
        let responds: bool = msg_send![&*bar, respondsToSelector: objc2::sel!(_statusItems)];
        if !responds {
            return;
        }
        let items: Retained<AnyObject> = msg_send![&*bar, _statusItems];
        let n: usize = msg_send![&*items, count];
        if n == 0 {
            return;
        }

        let number_spacing_type = NSNumber::new_i32(6);
        let monospaced_numbers_selector = NSNumber::new_i32(0);
        let feature_dict = NSDictionary::from_slices::<NSString>(
            &[
                NSFontFeatureTypeIdentifierKey,
                NSFontFeatureSelectorIdentifierKey,
            ],
            &[
                &*number_spacing_type as &AnyObject,
                &*monospaced_numbers_selector as &AnyObject,
            ],
        );
        let features_array = NSArray::from_retained_slice(&[feature_dict]);
        let desc_attrs = NSDictionary::from_slices::<NSString>(
            &[NSFontFeatureSettingsAttribute],
            &[&*features_array as &AnyObject],
        );

        let base_font = NSFont::menuBarFontOfSize(0.0);
        let base_size = base_font.pointSize();
        let base_desc = base_font.fontDescriptor();
        let mono_desc = base_desc.fontDescriptorByAddingAttributes(&desc_attrs);
        let (scale, offset) = if standalone {
            (
                TRAY_TITLE_FONT_SCALE_STANDALONE,
                TRAY_TITLE_BASELINE_OFFSET_STANDALONE,
            )
        } else {
            (TRAY_TITLE_FONT_SCALE, TRAY_TITLE_BASELINE_OFFSET)
        };
        let title_size = base_size * scale;
        let Some(mono_font) = NSFont::fontWithDescriptor_size(&mono_desc, title_size) else {
            return;
        };

        let baseline = NSNumber::new_f64(offset);
        let attrs = NSDictionary::from_slices::<NSString>(
            &[NSFontAttributeName, NSBaselineOffsetAttributeName],
            &[&*mono_font as &AnyObject, &*baseline as &AnyObject],
        );

        for i in 0..n {
            let item: *mut objc2_app_kit::NSStatusItem = msg_send![&*items, pointerAtIndex: i];
            if item.is_null() {
                continue;
            }
            let item_ref: &objc2_app_kit::NSStatusItem = &*item;
            let Some(button) = item_ref.button(mtm) else {
                continue;
            };
            let title = button.title();
            if title.length() == 0 {
                continue;
            }
            let attr_str = NSAttributedString::initWithString_attributes(
                NSAttributedString::alloc(),
                &title,
                Some(&attrs),
            );
            button.setAttributedTitle(&attr_str);
        }
    }
}

/// Colour the countdown row blue and stretch the glyph to the menu-bar
/// height. Must run on the main thread, after `set_text` / `set_icon`.
///
/// Disabled `NSMenuItem`s draw gray unless they carry an attributed title;
/// the dropdown font is the system menu font (not the 0.82 tray-title scale,
/// which only applies to the number beside the glyph).
///
/// tray-icon hardcodes the image at 18pt inside a ~22pt bar. Setting the
/// `NSImage` size to the bar thickness, and zeroing the private left/right
/// paddings when they exist, is as close to "no inset" as AppKit allows —
/// the four empty corners of a circle in a square are geometry, not padding.
#[cfg(target_os = "macos")]
fn polish_macos_tray() {
    use objc2::msg_send;
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::AnyThread;
    use objc2_app_kit::{
        NSApplication, NSColor, NSFont, NSFontAttributeName, NSForegroundColorAttributeName,
        NSImageScaling, NSStatusBar,
    };
    use objc2_foundation::{MainThreadMarker, NSAttributedString, NSDictionary, NSSize, NSString};

    let Some(mtm) = MainThreadMarker::new() else {
        return;
    };

    unsafe {
        let bar = NSStatusBar::systemStatusBar();
        let thickness = bar.thickness();
        let responds: bool = msg_send![&*bar, respondsToSelector: objc2::sel!(_statusItems)];
        if !responds {
            return;
        }
        let items: Retained<AnyObject> = msg_send![&*bar, _statusItems];
        let n: usize = msg_send![&*items, count];
        if n == 0 {
            return;
        }

        let font = NSFont::menuFontOfSize(0.0);
        // Dark menus keep the original blue; light menus go green. The
        // light variant is hand-picked: brighter and more saturated than
        // systemGreen so it still reads after the ~35% disabled dimming.
        // Re-checked every tick, so an appearance switch recolours within
        // a second.
        let dark_appearance = {
            let appearance = NSApplication::sharedApplication(mtm).effectiveAppearance();
            appearance.name().to_string().contains("Dark")
        };
        // Light mode needs a much deeper green than the menu's own text: the
        // row sits on translucent vibrancy, which lifts whatever is behind it
        // and washes mid-tones out. This clears 6.38:1 on the popup's #f2f2f2
        // body and 7.12:1 on white — comfortably past the 4.5 floor, which
        // earlier values (2.87:1, then 4.86:1) still read as faint through
        // the blur.
        let color = if dark_appearance {
            NSColor::systemBlueColor()
        } else {
            NSColor::colorWithSRGBRed_green_blue_alpha(0.0, 0.40, 0.20, 1.0)
        };
        let attrs = NSDictionary::from_slices::<NSString>(
            &[NSForegroundColorAttributeName, NSFontAttributeName],
            &[&*color as &AnyObject, &*font as &AnyObject],
        );

        for i in 0..n {
            let item: *mut objc2_app_kit::NSStatusItem = msg_send![&*items, pointerAtIndex: i];
            if item.is_null() {
                continue;
            }
            let item_ref: &objc2_app_kit::NSStatusItem = &*item;

            if let Some(menu) = item_ref.menu(mtm) {
                if let Some(countdown) = menu.itemAtIndex(0) {
                    countdown.setEnabled(false);
                    let title = countdown.title();
                    if title.length() > 0 {
                        let attr_str = NSAttributedString::initWithString_attributes(
                            NSAttributedString::alloc(),
                            &title,
                            Some(&attrs),
                        );
                        countdown.setAttributedTitle(Some(&attr_str));
                    }
                }
            }

            let Some(button) = item_ref.button(mtm) else {
                continue;
            };
            if let Some(image) = button.image() {
                let current = image.size();
                if current.height > 0.1 {
                    let width = current.width / current.height * thickness;
                    image.setSize(NSSize::new(width, thickness));
                }
                button.setImageScaling(NSImageScaling::ScaleProportionallyUpOrDown);
            }
            let has_left_pad: bool =
                msg_send![&*button, respondsToSelector: objc2::sel!(setStatusBarLeftPadding:)];
            if has_left_pad {
                let _: () = msg_send![&*button, setStatusBarLeftPadding: 0.0f64];
                let _: () = msg_send![&*button, setStatusBarRightPadding: 0.0f64];
            }
        }
    }
}

/// Today's daily reminders, read synchronously for the initial menu build
/// (same pattern as `read_chores_blocking`).
fn read_daily_reminders_blocking(app: &AppHandle) -> Vec<String> {
    let scheduler = app.state::<Scheduler>().inner().clone();
    tauri::async_runtime::block_on(async move {
        scheduler.settings.lock().await.daily_reminders.clone()
    })
}

fn read_profiles_blocking(app: &AppHandle) -> (Vec<String>, String) {
    let scheduler = app.state::<Scheduler>().inner().clone();
    tauri::async_runtime::block_on(async move {
        let profiles = scheduler
            .profiles
            .lock()
            .await
            .iter()
            .map(|p| p.name.clone())
            .collect();
        let active = scheduler.active_profile_name.lock().await.clone();
        (profiles, active)
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scheduler::SuppressReason;

    #[test]
    fn tomorrow_morning_within_36_hours() {
        let secs = seconds_until_tomorrow_morning();
        assert!(secs >= 60);
        assert!(secs <= 36 * 60 * 60);
    }

    #[test]
    fn countdown_menu_label_covers_each_scheduler_state() {
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Running(277)),
            "下次休息 4:37"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Paused),
            "已暂停"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Bedtime),
            "就寝提醒进行中"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::OnBreak),
            "正在休息"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Suppressed(SuppressReason::Dnd)),
            "已拦截：勿扰"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Idle),
            "休息未启用"
        );
        assert_eq!(
            countdown_menu_label(&TrayCountdownSnapshot::Disabled),
            "休息未启用"
        );
    }

    #[test]
    fn progress_ring_image_is_padded_like_static_glyphs() {
        let icon = progress_ring_image(30, "macos").unwrap();
        assert_eq!(icon.width(), PROGRESS_RING_SIZE, "width stays tight");
        assert!(
            icon.height() > PROGRESS_RING_SIZE,
            "vertical pad shrinks the glyph in the menu bar, h={}",
            icon.height()
        );
    }
    #[test]
    fn icon_is_template_only_on_macos() {
        assert!(icon_is_template("macos"));
        assert!(!icon_is_template("linux"));
        assert!(!icon_is_template("windows"));
    }

    #[test]
    fn tooltip_format_includes_profile_name() {
        assert_eq!(tooltip_for("Default"), "Entracte · Default");
        assert_eq!(tooltip_for("Work"), "Entracte · Work");
    }

    #[test]
    fn profile_menu_id_namespaces_name() {
        assert_eq!(profile_menu_id("Default"), "profile:Default");
        assert_eq!(profile_menu_id("Work mode"), "profile:Work mode");
    }

    fn png_dimensions(bytes: &[u8]) -> (u32, u32) {
        assert_eq!(&bytes[..8], b"\x89PNG\r\n\x1a\n", "not a PNG");
        assert_eq!(&bytes[12..16], b"IHDR", "missing IHDR chunk");
        let w = u32::from_be_bytes(bytes[16..20].try_into().unwrap());
        let h = u32::from_be_bytes(bytes[20..24].try_into().unwrap());
        (w, h)
    }

    #[test]
    fn tray_icons_are_pngs_with_matching_heights() {
        // Height is the invariant that matters: the OS scales a tray asset to
        // the menu-bar height, and `pad_glyph` only ever pads vertically. Equal
        // heights therefore keep every glyph the same rendered size across a
        // swap. Width is deliberately *not* constrained — a narrow glyph (the
        // fork's lone crescent) should occupy less menu-bar width, not be
        // padded out to a square with dead transparent pixels on both sides.
        let (_, running) = png_dimensions(TRAY_ICON_BYTES);
        let (_, paused) = png_dimensions(TRAY_ICON_PAUSED_BYTES);
        let (_, bedtime) = png_dimensions(TRAY_ICON_BEDTIME_BYTES);
        let (_, inactive) = png_dimensions(TRAY_ICON_INACTIVE_BYTES);
        assert_eq!(
            running, paused,
            "running and paused tray icons must share a height so the swap is seamless"
        );
        assert_eq!(
            running, bedtime,
            "bedtime tray icon must share a height with the running icon"
        );
        assert_eq!(
            running, inactive,
            "inactive (auto-suppressed) tray icon must share a height with the running icon"
        );
    }

    #[test]
    fn tray_title_for_states_when_text_enabled() {
        let on = true;
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Disabled, on),
            Some(String::new())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Paused, on),
            Some("已暂停".to_string())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Bedtime, on),
            Some(String::new())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::OnBreak, on),
            Some(String::new())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Suppressed(SuppressReason::Dnd), on),
            Some("勿扰".to_string())
        );
        assert_eq!(
            tray_title_for(
                &TrayCountdownSnapshot::Suppressed(SuppressReason::Camera),
                on
            ),
            Some("摄像头".to_string())
        );
        assert_eq!(
            tray_title_for(
                &TrayCountdownSnapshot::Suppressed(SuppressReason::Video),
                on
            ),
            Some("视频".to_string())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Idle, on),
            Some(String::new())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Running(754), on),
            Some("13".to_string())
        );
        assert_eq!(
            tray_title_for(&TrayCountdownSnapshot::Running(65), on),
            Some("2".to_string())
        );
    }

    #[test]
    fn tray_title_for_returns_empty_for_every_state_when_text_disabled() {
        // `tray_countdown_enabled = false` means the user opted out of
        // any always-visible text — paused / reason / countdown — and
        // wants the icon swap to be the only signal. The tooltip
        // (hover-only) still carries detail; see tooltip_for_state.
        let off = false;
        for snap in [
            TrayCountdownSnapshot::Disabled,
            TrayCountdownSnapshot::Paused,
            TrayCountdownSnapshot::Bedtime,
            TrayCountdownSnapshot::OnBreak,
            TrayCountdownSnapshot::Suppressed(SuppressReason::Dnd),
            TrayCountdownSnapshot::Suppressed(SuppressReason::Camera),
            TrayCountdownSnapshot::Suppressed(SuppressReason::WorkWindow),
            TrayCountdownSnapshot::Idle,
            TrayCountdownSnapshot::Running(60),
            TrayCountdownSnapshot::Running(0),
        ] {
            assert_eq!(
                tray_title_for(&snap, off),
                Some(String::new()),
                "{snap:?} must show no title when text is disabled",
            );
        }
    }

    #[test]
    fn tooltip_for_state_appends_reason_only_when_inactive() {
        // Sanity: the base profile tooltip is the prefix in every case;
        // we only ever ADD a second line, never rewrite the first.
        let base = tooltip_for("Default");
        assert!(
            tooltip_for_state("Default", &TrayCountdownSnapshot::Running(60)).starts_with(&base),
            "tooltip should always lead with the profile line"
        );
        assert_eq!(
            tooltip_for_state(
                "Default",
                &TrayCountdownSnapshot::Suppressed(SuppressReason::Dnd)
            ),
            format!("{base}\n拦截：{}", SuppressReason::Dnd.human()),
        );
        assert_eq!(
            tooltip_for_state("Default", &TrayCountdownSnapshot::Paused),
            format!("{base}\n已暂停"),
        );
        assert_eq!(
            tooltip_for_state("Default", &TrayCountdownSnapshot::Bedtime),
            format!("{base}\n就寝提醒"),
        );
        // No second line for transient/normal states.
        assert_eq!(
            tooltip_for_state("Default", &TrayCountdownSnapshot::Idle),
            base
        );
        assert_eq!(
            tooltip_for_state("Default", &TrayCountdownSnapshot::Running(60)),
            base
        );
    }

    #[test]
    fn tray_icon_kind_routes_each_snapshot_to_the_right_asset() {
        assert_eq!(
            tray_icon_kind_for(&TrayCountdownSnapshot::Bedtime),
            TrayIconKind::Bedtime
        );
        assert_eq!(
            tray_icon_kind_for(&TrayCountdownSnapshot::Paused),
            TrayIconKind::Paused
        );
        assert_eq!(
            tray_icon_kind_for(&TrayCountdownSnapshot::Suppressed(SuppressReason::Camera)),
            TrayIconKind::Inactive,
            "auto-suppressed must use the distinct inactive icon, not the explicit-pause one"
        );
        for snap in [
            TrayCountdownSnapshot::Disabled,
            TrayCountdownSnapshot::OnBreak,
            TrayCountdownSnapshot::Idle,
            TrayCountdownSnapshot::Running(60),
        ] {
            assert_eq!(
                tray_icon_kind_for(&snap),
                TrayIconKind::Normal,
                "{snap:?} should use the normal icon"
            );
        }
    }

    #[test]
    fn outline_glyph_recolours_body_and_rings_it() {
        // 5×5 with a single opaque body pixel at the centre, radius 1.
        let (w, h) = (5u32, 5u32);
        let mut rgba = vec![0u8; (w * h * 4) as usize];
        let idx = |x: u32, y: u32| ((y * w + x) * 4) as usize;
        rgba[idx(2, 2) + 3] = 255;

        let out = outline_glyph(&rgba, w, h, 1, [200, 200, 200], [10, 10, 10]);

        // Body becomes fill, alpha preserved.
        assert_eq!(&out[idx(2, 2)..idx(2, 2) + 4], &[200, 200, 200, 255]);
        // Orthogonal neighbours (dx²+dy² ≤ 1) become opaque outline.
        for (x, y) in [(1, 2), (3, 2), (2, 1), (2, 3)] {
            assert_eq!(
                &out[idx(x, y)..idx(x, y) + 4],
                &[10, 10, 10, 255],
                "({x},{y}) should be outline"
            );
        }
        // Diagonals (dx²+dy² = 2 > 1) and far corners stay transparent.
        for (x, y) in [(1, 1), (3, 3), (0, 0), (4, 4)] {
            assert_eq!(out[idx(x, y) + 3], 0, "({x},{y}) should stay transparent");
        }
    }

    #[test]
    fn outline_glyph_preserves_anti_aliased_body_alpha() {
        let (w, h) = (3u32, 3u32);
        let mut rgba = vec![0u8; (w * h * 4) as usize];
        let centre = ((w + 1) * 4) as usize;
        rgba[centre + 3] = 128;
        let out = outline_glyph(&rgba, w, h, 1, [242, 242, 242], [20, 20, 20]);
        assert_eq!(&out[centre..centre + 4], &[242, 242, 242, 128]);
    }

    #[test]
    fn outline_for_panels_gives_real_glyph_both_fill_and_outline() {
        let img = Image::from_bytes(TRAY_ICON_BYTES).unwrap();
        let out = outline_glyph_for_panels(img.rgba(), img.width(), img.height());
        assert_eq!(out.len(), img.rgba().len(), "dimensions must be preserved");
        let has_fill = out
            .chunks_exact(4)
            .any(|p| p[3] > 0 && p[0] > 0xE0 && p[1] > 0xE0 && p[2] > 0xE0);
        let has_outline = out
            .chunks_exact(4)
            .any(|p| p[3] == 255 && p[0] < 0x30 && p[1] < 0x30 && p[2] < 0x30);
        assert!(
            has_fill,
            "recoloured glyph must contain near-white body pixels"
        );
        assert!(
            has_outline,
            "recoloured glyph must contain a near-black outline ring"
        );
    }

    #[test]
    fn tray_image_recolours_off_macos_but_not_on_macos() {
        let raw = Image::from_bytes(TRAY_ICON_BYTES).unwrap();
        let (padded, pw, ph) = pad_glyph(raw.rgba(), raw.width(), raw.height());
        let mac = tray_image(TrayIconKind::Normal, "macos").unwrap();
        assert_eq!(
            mac.rgba(),
            padded.as_slice(),
            "macOS keeps the raw template (padded) for AppKit to tint"
        );
        let linux = tray_image(TrayIconKind::Normal, "linux").unwrap();
        assert_ne!(
            linux.rgba(),
            padded.as_slice(),
            "Linux must recolour so the glyph survives a dark panel"
        );
        assert_eq!(linux.width(), pw);
        assert_eq!(linux.height(), ph);
    }

    #[test]
    fn pad_glyph_grows_height_only_and_centres_the_source() {
        let raw = Image::from_bytes(TRAY_ICON_BYTES).unwrap();
        let (w, h) = (raw.width(), raw.height());
        let (out, ow, oh) = pad_glyph(raw.rgba(), w, h);
        // Width stays tight: horizontal margin would only waste menu-bar
        // width, which is the whole reason padding is vertical-only.
        assert_eq!(ow, w, "width must not grow");
        assert!(oh > h, "height must grow to shrink the rendered glyph");
        assert_eq!(out.len(), (ow * oh * 4) as usize);
        // The added margin is fully transparent: the first row is untouched.
        assert!(out[..(ow * 4) as usize].iter().all(|&b| b == 0));
        // The glyph lands intact at the centred vertical offset.
        let off_y = (oh - h) / 2;
        let dst = (off_y * ow * 4) as usize;
        assert_eq!(
            &out[dst..dst + (w * 4) as usize],
            &raw.rgba()[..(w * 4) as usize]
        );
    }

    #[test]
    fn tray_icon_kind_bytes_map_to_distinct_assets() {
        assert_eq!(TrayIconKind::Normal.bytes(), TRAY_ICON_BYTES);
        assert_eq!(TrayIconKind::Paused.bytes(), TRAY_ICON_PAUSED_BYTES);
        assert_eq!(TrayIconKind::Bedtime.bytes(), TRAY_ICON_BEDTIME_BYTES);
        assert_eq!(TrayIconKind::Inactive.bytes(), TRAY_ICON_INACTIVE_BYTES);
        // Sanity-check the constants are not the same blob — if two of these
        // ever drift to identical content the visual signal collapses.
        assert_ne!(TRAY_ICON_BYTES, TRAY_ICON_BEDTIME_BYTES);
        assert_ne!(TRAY_ICON_PAUSED_BYTES, TRAY_ICON_BEDTIME_BYTES);
        assert_ne!(TRAY_ICON_PAUSED_BYTES, TRAY_ICON_INACTIVE_BYTES);
        assert_ne!(TRAY_ICON_BYTES, TRAY_ICON_INACTIVE_BYTES);
        assert_ne!(TRAY_ICON_INACTIVE_BYTES, TRAY_ICON_BEDTIME_BYTES);
    }
    #[test]
    fn daily_reminder_labels_empty_list_yields_no_rows() {
        assert!(daily_reminder_row_labels(&[]).is_empty());
    }

    #[test]
    fn daily_reminder_labels_truncate_long_entries() {
        let long = "这是一条特别长的每日提醒内容它远远超过了四十二个字符的截断上限因此必须被截断并加上省略号".to_string();
        assert!(long.chars().count() > TRAY_REMINDER_MAX_CHARS);
        let rows = daily_reminder_row_labels(&["短的".to_string(), long.clone()]);
        assert_eq!(rows[0], "短的");
        let expected = truncate_label(&long, TRAY_REMINDER_MAX_CHARS);
        assert_eq!(rows[1], expected);
        // truncate_label appends the ellipsis on top of the cap.
        assert!(expected.chars().count() <= TRAY_REMINDER_MAX_CHARS + 1);
    }

}
