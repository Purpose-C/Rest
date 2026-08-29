use std::sync::atomic::AtomicBool;
use std::sync::Arc;

use tauri::{AppHandle, Runtime};

use crate::hooks::{Hook, HookTestOutcome};

use super::super::Scheduler;

/// Run a single hook command once and return its captured stdout/stderr and
/// exit status, so the Settings "Test" button can show the user what a
/// command does before they rely on it. Runs with a representative
/// `$ENTRACTE_*` env and a short timeout, off the async runtime since the
/// capture blocks. No confirmation dialog: the user typed and triggered this
/// command themselves — the dialog guards *persisting* hooks, not a transient
/// user-initiated test.
#[tauri::command]
pub async fn test_hook(command: String) -> Result<HookTestOutcome, String> {
    tauri::async_runtime::spawn_blocking(move || {
        crate::hooks::run_command_capture(
            &command,
            &crate::hooks::sample_test_env(),
            crate::hooks::HOOK_TEST_TIMEOUT,
        )
    })
    .await
    .map_err(|e| format!("test-run task failed: {e}"))
}

const HOOK_DIALOG_ALLOW: &str = "允许";
const HOOK_DIALOG_CANCEL: &str = "取消";
const HOOK_DIALOG_PER_HOOK_CHARS: usize = 120;
const HOOK_DIALOG_MAX_HOOKS_SHOWN: usize = 5;
const HOOK_DIALOG_MAX_BODY_CHARS: usize = 1200;

struct DialogBusyGuard(Arc<AtomicBool>);

impl Drop for DialogBusyGuard {
    fn drop(&mut self) {
        self.0.store(false, std::sync::atomic::Ordering::Release);
    }
}

/// Replace the active profile's hook list, gated by a native
/// confirmation dialog. The dialog shows the proposed hooks (with
/// control characters sanitised) so the user can spot tampering.
///
/// Returns `Err` if another `set_hooks` invocation is already showing
/// a dialog, or if the user declines. On success, the new hooks are
/// merged into both the in-memory settings and the active profile,
/// then persisted to disk.
#[tauri::command]
pub async fn set_hooks<R: Runtime>(
    app: AppHandle<R>,
    scheduler: tauri::State<'_, Scheduler>,
    hooks_enabled: bool,
    hooks: Vec<Hook>,
) -> Result<(), String> {
    if scheduler
        .hook_dialog_busy
        .compare_exchange(
            false,
            true,
            std::sync::atomic::Ordering::Acquire,
            std::sync::atomic::Ordering::Relaxed,
        )
        .is_err()
    {
        return Err("another hook-change confirmation is already pending".to_string());
    }
    let _guard = DialogBusyGuard(scheduler.hook_dialog_busy.clone());
    if !confirm_hooks_change(&app, hooks_enabled, &hooks).await {
        return Err("user declined hook change".to_string());
    }
    {
        let mut current = scheduler.settings.lock().await;
        current.hooks_enabled = hooks_enabled;
        current.hooks = hooks.clone();
    }
    {
        let active = scheduler.active_profile_name.lock().await.clone();
        let mut profiles = scheduler.profiles.lock().await;
        if let Some(p) = profiles.iter_mut().find(|p| p.name == active) {
            p.settings.hooks_enabled = hooks_enabled;
            p.settings.hooks = hooks;
        }
    }
    super::super::persist_profiles(scheduler.inner()).await;
    Ok(())
}

async fn confirm_hooks_change<R: Runtime>(
    app: &AppHandle<R>,
    enabled: bool,
    hooks: &[Hook],
) -> bool {
    use tauri_plugin_dialog::{
        DialogExt, MessageDialogButtons, MessageDialogKind, MessageDialogResult,
    };

    let summary = format_hooks_summary(enabled, hooks);
    let app = app.clone();
    let (tx, rx) = tokio::sync::oneshot::channel::<MessageDialogResult>();
    std::thread::spawn(move || {
        let result = app
            .dialog()
            .message(summary)
            .title("Entracte：确认钩子更改")
            .kind(MessageDialogKind::Warning)
            .buttons(MessageDialogButtons::OkCancelCustom(
                HOOK_DIALOG_CANCEL.to_string(),
                HOOK_DIALOG_ALLOW.to_string(),
            ))
            .blocking_show_with_result();
        let _ = tx.send(result);
    });
    match rx.await {
        Ok(MessageDialogResult::Custom(label)) => label == HOOK_DIALOG_ALLOW,
        _ => false,
    }
}

fn format_hooks_summary(enabled: bool, hooks: &[Hook]) -> String {
    let mut s = String::new();
    s.push_str("⚠ 请仅在您本人于 Entracte 的设置中发起此次更改时点击“允许”。\n");
    s.push_str("允许后，Entracte 将在休息事件上运行下列 shell 命令。\n\n");
    s.push_str(&format!(
        "此次更改后，钩子将被{}。\n",
        if enabled { "启用" } else { "停用" }
    ));
    if hooks.is_empty() {
        s.push_str("\n未配置钩子。");
        return s;
    }
    s.push_str(&format!("\n命令（{}）：\n", hooks.len()));
    for h in hooks.iter().take(HOOK_DIALOG_MAX_HOOKS_SHOWN) {
        if s.len() >= HOOK_DIALOG_MAX_BODY_CHARS {
            break;
        }
        let state = if h.enabled { "开" } else { "关" };
        s.push_str(&format!(
            "• [{}] ({}) {}\n",
            h.event.as_str(),
            state,
            sanitize_for_dialog(&h.command, HOOK_DIALOG_PER_HOOK_CHARS)
        ));
    }
    if hooks.len() > HOOK_DIALOG_MAX_HOOKS_SHOWN {
        s.push_str(&format!(
            "… 以及另外 {} 条（允许前请在设置中复查）。\n",
            hooks.len() - HOOK_DIALOG_MAX_HOOKS_SHOWN
        ));
    }
    if s.len() > HOOK_DIALOG_MAX_BODY_CHARS {
        s.truncate(HOOK_DIALOG_MAX_BODY_CHARS);
        s.push_str("…\n");
    }
    s
}

fn sanitize_for_dialog(s: &str, max_chars: usize) -> String {
    let mut out = String::with_capacity(s.len().min(max_chars * 4));
    for (count, c) in s.chars().enumerate() {
        if count >= max_chars {
            out.push('…');
            break;
        }
        let replacement = match c {
            '\n' | '\r' | '\t' => Some('␣'),
            c if (c as u32) < 0x20 || c as u32 == 0x7F => Some('·'),
            '\u{202A}'..='\u{202E}' | '\u{2066}'..='\u{2069}' | '\u{200E}' | '\u{200F}' => {
                Some('·')
            }
            _ => None,
        };
        out.push(replacement.unwrap_or(c));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::hooks::{Hook, HookEvent};

    #[test]
    fn format_hooks_summary_lists_each_hook() {
        let hooks = vec![
            Hook {
                event: HookEvent::BreakStart,
                command: "echo hi".to_string(),
                enabled: true,
            },
            Hook {
                event: HookEvent::PauseEnd,
                command: "sh -c 'curl evil'".to_string(),
                enabled: false,
            },
        ];
        let s = format_hooks_summary(true, &hooks);
        assert!(s.contains("将被启用"));
        assert!(s.contains("break_start"));
        assert!(s.contains("echo hi"));
        assert!(s.contains("pause_end"));
        assert!(s.contains("curl evil"));
        assert!(s.contains("(关)"));
    }

    #[test]
    fn format_hooks_summary_puts_warning_first() {
        let hooks = vec![Hook {
            event: HookEvent::BreakStart,
            command: "x".to_string(),
            enabled: true,
        }];
        let s = format_hooks_summary(true, &hooks);
        let warn_pos = s.find("请仅在您本人").expect("warning present");
        let first_hook_pos = s.find("break_start").expect("hook present");
        assert!(
            warn_pos < first_hook_pos,
            "safety warning must appear before the hook list"
        );
    }

    #[test]
    fn format_hooks_summary_handles_empty_list() {
        let s = format_hooks_summary(false, &[]);
        assert!(s.contains("将被停用"));
        assert!(s.contains("未配置钩子"));
    }

    #[test]
    fn format_hooks_summary_truncates_after_max_shown() {
        let hooks: Vec<Hook> = (0..15)
            .map(|i| Hook {
                event: HookEvent::BreakStart,
                command: format!("cmd-{i}"),
                enabled: true,
            })
            .collect();
        let s = format_hooks_summary(true, &hooks);
        assert!(s.contains("cmd-0"));
        assert!(s.contains(&format!("cmd-{}", HOOK_DIALOG_MAX_HOOKS_SHOWN - 1)));
        assert!(!s.contains(&format!("cmd-{HOOK_DIALOG_MAX_HOOKS_SHOWN}")));
        assert!(s.contains(&format!(
            "以及另外 {} 条",
            15 - HOOK_DIALOG_MAX_HOOKS_SHOWN
        )));
    }

    #[test]
    fn format_hooks_summary_caps_total_body() {
        let hooks: Vec<Hook> = (0..50)
            .map(|i| Hook {
                event: HookEvent::BreakStart,
                command: format!("cmd-{i}-{}", "x".repeat(100)),
                enabled: true,
            })
            .collect();
        let s = format_hooks_summary(true, &hooks);
        assert!(
            s.len() <= HOOK_DIALOG_MAX_BODY_CHARS + 4,
            "body exceeded cap: {}",
            s.len()
        );
    }

    #[test]
    fn sanitize_for_dialog_replaces_control_chars() {
        let s = "a\nb\rc\td\x00e\x1fF\x7Fg";
        let out = sanitize_for_dialog(s, 100);
        assert!(!out.contains('\n'));
        assert!(!out.contains('\r'));
        assert!(!out.contains('\t'));
        assert!(!out.contains('\x00'));
        assert!(!out.contains('\x1f'));
        assert!(!out.contains('\x7f'));
        assert!(out.contains('a') && out.contains('g'));
    }

    #[test]
    fn sanitize_for_dialog_strips_bidi_controls() {
        let s = "hello\u{202E}olleh\u{2066}x\u{200E}y";
        let out = sanitize_for_dialog(s, 100);
        for bad in ['\u{202E}', '\u{2066}', '\u{200E}'] {
            assert!(
                !out.contains(bad),
                "expected {:?} stripped from {:?}",
                bad,
                out
            );
        }
    }

    #[test]
    fn sanitize_for_dialog_clips_long_strings() {
        let s = "x".repeat(500);
        let out = sanitize_for_dialog(&s, 100);
        assert_eq!(out.chars().count(), 101);
        assert!(out.ends_with('…'));
    }

    #[test]
    fn sanitize_for_dialog_leaves_short_safe_strings_intact() {
        assert_eq!(
            sanitize_for_dialog("short safe text", 100),
            "short safe text"
        );
    }

    #[test]
    fn dialog_constants_use_safe_default_button() {
        assert_eq!(HOOK_DIALOG_CANCEL, "取消");
        assert_eq!(HOOK_DIALOG_ALLOW, "允许");
    }

    #[test]
    fn dialog_busy_guard_resets_flag_on_drop() {
        let flag = Arc::new(AtomicBool::new(true));
        {
            let _g = DialogBusyGuard(flag.clone());
        }
        assert!(!flag.load(std::sync::atomic::Ordering::Acquire));
    }
}
