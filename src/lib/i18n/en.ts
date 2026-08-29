export const en: Record<string, string> = {
  // break-mode
  "breakMode.overlay": "Full-screen overlay",
  "breakMode.windowed": "Windowed",
  "breakMode.notification": "System notification only",

  // constants
  "constants.placement.primary": "Primary monitor",
  "constants.placement.active": "Monitor under cursor",
  "constants.placement.all": "All monitors",
  "constants.hookEvent.break_start": "Break starts",
  "constants.hookEvent.break_end": "Break ends",
  "constants.hookEvent.break_postponed": "Break postponed",
  "constants.hookEvent.break_skipped": "Break skipped",
  "constants.hookEvent.pause_start": "Pause starts",
  "constants.hookEvent.pause_end": "Pause ends",
  "constants.theme.dark": "Dark",
  "constants.theme.midnight": "Midnight",
  "constants.theme.forest": "Forest",
  "constants.theme.rose": "Rose",
  "constants.theme.sunset": "Sunset",
  "constants.theme.rotate": "Rotate",
  "constants.theme.custom": "Custom…",
  "constants.soundMode.off": "Off",
  "constants.soundMode.end_chime": "Chime at end of break",
  "constants.soundMode.ambient": "Ambient (loops during break)",
  "constants.tab.schedule": "Schedule",
  "constants.tab.breaks": "Breaks",
  "constants.tab.quiet": "Pausing",
  "constants.tab.system": "System",
  "constants.tab.insights": "Insights",
  "constants.tab.profiles": "Profiles",
  "constants.tab.about": "About",

  // breaks-tab
  "breaks.delivery": "Delivery",
  "breaks.deliveryDesc":
    "How each break appears. Turn a break on or off, and set its cadence, on the Schedule tab.",
  "breaks.deliveryTip":
    "Full-screen overlay covers the monitor. Windowed shows the same prompt sized to a fraction of the screen, leaving the desktop reachable. System notification only posts a notification and records no skip/postpone metrics.",
  "breaks.microBreaks": "Micro breaks",
  "breaks.longBreaks": "Long breaks",
  "breaks.testMicro": "Test micro",
  "breaks.testLong": "Test long",
  "breaks.takeLongNow": "Take a long break now",
  "breaks.overlay": "Overlay",
  "breaks.transparency": "Transparency",
  "breaks.transparencyTip":
    "0% is fully opaque. Higher values let your work show through faintly — useful as a softer prompt.",
  "breaks.textSize": "Text size",
  "breaks.theme": "Theme",
  "breaks.themeTip":
    "Pick a preset, Rotate (different preset every break), or Custom for any colour. Custom colours are auto-darkened so the overlay still dims the screen.",
  "breaks.customColor": "Custom color",
  "breaks.showHints": "Show wellness hints",
  "breaks.rotateHints": "Rotate hints during the break",
  "breaks.rotateHintsTip":
    "Off: one idea is picked per break and stays on screen. On: the overlay cycles through the remaining ideas in the pool every N seconds.",
  "breaks.rotateEverySeconds": "Rotate every (seconds)",
  "breaks.showCurrentTime": "Show current time on overlay",
  "breaks.showAdvancedOverlay": "Show advanced overlay options",
  "breaks.showBreakOn": "Show break on",
  "breaks.showBreakOnTip":
    "Primary: always the main display. Under cursor: wherever your mouse is when the break fires. All: a break covers every monitor.",
  "breaks.windowedSize": "Windowed break size",
  "breaks.windowedSizeTip":
    "How much of the screen a windowed-mode break fills. Only applies to breaks set to Windowed delivery on the Schedule tab; full-screen overlays always cover the whole monitor.",
  "breaks.microWindowedSize": "Micro break size",
  "breaks.microWindowedSizeTip":
    "Override the windowed size for micro breaks only. A quick micro break can be smaller than a long one.",
  "breaks.longWindowedSize": "Long break size",
  "breaks.longWindowedSizeTip":
    "Override the windowed size for long breaks only. Leave on “Same as global” to follow the windowed break size above.",
  "breaks.highContrast":
    "High contrast (pure black, white text, solid ring)",
  "breaks.highContrastTip":
    'Overrides theme colour and transparency until turned off. Your OS-level "Increase contrast" preference auto-applies at break time even with this off.',
  "breaks.showVignette": "Show vignette when breaks are skipped",
  "breaks.showVignetteTip":
    "A subtle dark vignette appears on the overlay when you've been skipping breaks, intensifying with each skip.",
  "breaks.sound": "Sound",
  "breaks.volume": "Volume",
  "breaks.soundDesc":
    "The volume applies to every break sound. Choose the track for each break type below.",
  "breaks.skipPostpone": "Skip & postpone",
  "breaks.strictMode":
    "Strict mode (all breaks enforced, no skip or postpone)",
  "breaks.strictModeTip":
    "Disables every escape hatch on the overlay. The postpone and skip controls below are ignored while strict mode is on.",
  "breaks.allowPostpone": "Allow postponing a break",
  "breaks.allowPostponeTip":
    "Master switch for postponing. Turn it on, then choose below which break types can be postponed.",
  "breaks.postponeByMinutes": "Postpone by (minutes)",
  "breaks.escalatePostpone":
    "Escalate each subsequent postpone of the same break",
  "breaks.escalatePostponeTip":
    "Each postpone of the same break adds extra delay, making repeated postponing progressively less attractive.",
  "breaks.extraDelayPerPostpone": "Extra delay per postpone (seconds)",
  "breaks.maxPostpones": "Maximum postpones per break",
  "breaks.perBreakType": "Per break type",
  "breaks.postponeMicro": "Postpone micro breaks",
  "breaks.postponeMicroTip":
    "Shows a Postpone button on the micro break overlay.",
  "breaks.postponeLong": "Postpone long breaks",
  "breaks.postponeLongTip": "Shows a Postpone button on the long break overlay.",
  "breaks.skipMicro": "Skip micro breaks",
  "breaks.skipMicroTip":
    "When off, the micro break overlay has no Skip button and Esc won't dismiss it.",
  "breaks.skipLong": "Skip long breaks",
  "breaks.skipLongTip":
    "When off, the long break overlay has no Skip button and Esc won't dismiss it.",
  "breaks.skipNextMicro": "Skip next micro",
  "breaks.skipNextLong": "Skip next long",
  "breaks.enforcement": "Enforcement",
  "breaks.microManualFinish": "Micro: wait for manual finish",
  "breaks.microManualFinishTip":
    'The micro overlay stays up until you press "I\'m back", instead of auto-closing when the countdown reaches zero.',
  "breaks.longManualFinish": "Long: wait for manual finish",
  "breaks.longManualFinishTip":
    'The long overlay stays up until you press "I\'m back", instead of auto-closing when the countdown reaches zero.',
  "breaks.microEnforceable": "Micro: cannot be dismissed",
  "breaks.microEnforceableTip":
    "Skip and close controls are hidden during the micro break. Use sparingly.",
  "breaks.longEnforceable": "Long: cannot be dismissed",
  "breaks.longEnforceableTip":
    "Skip and close controls are hidden during the long break.",
  "breaks.breakIdeas": "Break ideas",
  "breaks.breakIdeasDesc":
    "Choose which kinds of prompt appear during each break.",
  "breaks.breakIdeasSupporterDesc":
    " Edit the pools below — one idea per line; each break picks a random starting idea.",
  "breaks.mix": "Mix",
  "breaks.microMixTip":
    "Physical: stretches, eye rest, movement. Psychological: breathing, awareness, tension release.",
  "breaks.mixBoth": "Both",
  "breaks.mixPhysicalOnly": "Physical only",
  "breaks.mixPsychologicalOnly": "Psychological only",
  "breaks.physicalPool": "Physical (stretches, eye rest, movement)",
  "breaks.psychologicalPool":
    "Psychological (breathing, awareness, tension release)",
  "breaks.longMixTip":
    "Solo: things to do on your own (stretch, fresh air, snack). Social: things to do with someone (call, walk together, sit outside). Working alone? Pick Solo only to drop the social prompts.",
  "breaks.mixSoloOnly": "Solo only",
  "breaks.mixSocialOnly": "Social only",
  "breaks.spreadRoutineSteps":
    "Spread routine steps across the whole break",
  "breaks.spreadRoutineStepsTip":
    "When on, a routine's step durations are treated as relative weights and scaled to fill the full break length. When off (default), steps run at their authored durations and the last step holds until the break ends. A routine can override this per-routine with its own pacing field.",
  "breaks.playPluginSoundCues": "Play plugin sound cues",
  "breaks.playPluginSoundCuesTip":
    "When on (default), routines from plugins may play their own short sound cues — a breathing in/out tone, or a chime between exercises. Cues always follow your overall sound volume; turn this off to silence them.",
  "breaks.todaysChores": "Today's chores",
  "breaks.choresDesc":
    "Jot down chores you'd like done today — one per line. During a long break, Entracte nudges you to knock one out (these take precedence over the rotating wellness tips). The list clears each morning.",
  "breaks.oneChorePerLine": "One chore per line",
  "breaks.choresPlaceholder":
    "Water the plants\nEmpty the dishwasher\nReply to Sam",
  "breaks.promptChoresMorning":
    "Prompt me to plan chores each morning",
  "breaks.promptChoresMorningTip":
    "When on (default), the first time your work window opens each day with an empty list, Entracte opens this Preferences window here so you can jot down the day's chores. Turn it off to never be prompted — you can still fill the list in yourself any time.",
  "breaks.longSoloPool": "Solo (stretch, fresh air, snack, tidy)",
  "breaks.longSocialPool": "Social (call, walk together, share a coffee)",
  "breaks.bedtime": "Bedtime",
  "breaks.oneIdeaPerLine": "One idea per line",
  "breaks.contentPacks": "Content packs",
  "breaks.customCss": "Custom CSS",
  "breaks.customCssDesc":
    "Applied to the settings window and the break overlay. Bad CSS can hide controls — clear this field if anything breaks.",
  "breaks.stylesheet": "Stylesheet",

  // schedule-tab
  "schedule.activeHours": "Active hours",
  "schedule.onlyWithinHours": "Only fire breaks within set hours",
  "schedule.onlyWithinHoursTip":
    "Outside this window, breaks won't fire. Bedtime reminders ignore this and use their own window below.",
  "schedule.start": "Start",
  "schedule.end": "End",
  "schedule.onTheseDays": "On these days",
  "schedule.onTheseDaysTip":
    "Breaks only fire within the hours above on the selected days — turn off weekends so Entracte stays quiet while you game or relax. A window that runs past midnight (e.g. 22:00–06:00) counts the early-morning hours as part of the day it started.",
  "schedule.microBreaks": "Micro breaks",
  "schedule.enableMicro": "Enable micro breaks",
  "schedule.enableMicroTip":
    "Short, frequent breaks. Set how they're delivered (overlay, windowed, or notification) on the Breaks tab.",
  "schedule.scheduleMode": "Schedule",
  "schedule.modeInterval": "Interval",
  "schedule.modeFixed": "Fixed times",
  "schedule.modeBoth": "Both",
  "schedule.intervalMinutes": "Interval (minutes)",
  "schedule.fixedTimes":
    "Fixed times (comma-separated, {format})",
  "schedule.durationSeconds": "Duration (seconds)",
  "schedule.advancedMicroTiming": "Advanced micro timing",
  "schedule.idleResetMinutes": "Idle reset threshold (minutes)",
  "schedule.idleResetTip":
    "If you've been idle longer than this, the next-break timer resets when you come back — Entracte assumes you already took a break.",
  "schedule.longBreaks": "Long breaks",
  "schedule.enableLong": "Enable long breaks",
  "schedule.enableLongTip":
    "Longer, less frequent breaks. Set how they're delivered (overlay, windowed, or notification) on the Breaks tab.",
  "schedule.durationMinutes": "Duration (minutes)",
  "schedule.advancedLongTiming": "Advanced long timing",
  "schedule.bedtime": "Bedtime",
  "schedule.persistentSleepReminders":
    "Persistent sleep reminders within window",
  "schedule.persistentSleepRemindersTip":
    "Inside the bedtime window, Entracte fires a Sleep prompt instead of micro or long breaks. Sleep prompts always show — they ignore DnD and camera-in-use.",
  "schedule.reminderIntervalMinutes": "Reminder interval (minutes)",
  "schedule.reminderDurationSeconds": "Reminder duration (seconds)",
  "schedule.testNow15s": "Test now (15s)",
  "schedule.dailyScreenTime": "Daily screen time",
  "schedule.remindWrapUp": "Remind me to wrap up after a daily budget",
  "schedule.remindWrapUpTip":
    "Counts only active typing/clicking. Resets at local midnight. The reminder is a system notification, not a forced break.",
  "schedule.dailyBudgetHours": "Daily budget (hours)",
  "schedule.remindAgainAfter":
    "Remind again after (minutes, 0 = once per day)",
  "schedule.today": "Today",
  "schedule.screenTimeProgressAria": "Daily screen time progress",
  "schedule.showAdvancedScheduling": "Show advanced scheduling",
  "schedule.inputAwareScheduling": "Input-aware scheduling",
  "schedule.delayBreakIfTyping": "Delay break if I'm typing",
  "schedule.delayBreakIfTypingTip":
    "If you're mid-keystroke when a break is due, it waits until you pause typing — up to the maximum deferral below.",
  "schedule.typingGraceSeconds":
    "Treat input within (seconds) as typing",
  "schedule.typingMaxDeferralSeconds": "Maximum deferral (seconds)",
  "schedule.pauseCountdownIfTyping":
    "Pause break countdown while I'm typing",
  "schedule.pauseCountdownIfTypingTip":
    'During a break, the countdown only ticks while you\'re not typing. Useful with "Wait for manual finish" off.',

  // search-index
  "search.activeHours": "Active hours",
  "search.microBreaks": "Micro breaks",
  "search.longBreaks": "Long breaks",
  "search.bedtime": "Bedtime",
  "search.screenTime": "Daily screen time",
  "search.delivery": "Delivery mode",
  "search.overlay": "Overlay appearance",
  "search.sound": "Sound",
  "search.skipPostpone": "Skip & postpone",
  "search.breakIdeas": "Break ideas",
  "search.chores": "Today's chores",
  "search.contentPacks": "Content packs",
  "search.customCss": "Custom CSS",
  "search.autoPause": "Auto-pause",
  "search.duringBreaks": "Pause media during breaks",
  "search.appPause": "Pause for specific apps",
  "search.manualPause": "Manual pause",
  "search.startup": "Start at login",
  "search.display": "Time format",
  "search.notifications": "Notifications",
  "search.hotkeys": "Global hotkeys",
  "search.tray": "Tray countdown",
  "search.plugins": "Plugins",
  "search.hooks": "Event hooks",
  "search.insights": "Insights & stats",
  "search.manageData": "Manage data",
  "search.profiles": "Profiles",
  "search.about": "About & updates",
  "search.supporter": "Supporter",
  "search.diagnostics": "Diagnostics",

  // insights-tab
  "insights.thisSession": "This session",
  "insights.thisSessionDesc":
    "Live counters since this run started. They reset every time Entracte restarts.",
  "insights.taken": "Taken",
  "insights.skipped": "Skipped",
  "insights.postponed": "Postponed",
  "insights.skipRate": "Skip rate",
  "insights.resetCounters": "Reset session counters",
  "insights.range": "Range",
  "insights.pastWeek": "Past week",
  "insights.pastMonth": "Past month",
  "insights.loadingStats": "Loading stats…",
  "insights.summary": "Summary",
  "insights.breaksTaken": "Breaks taken",
  "insights.breaksTakenSub": "{micro} micro, {long} long",
  "insights.dismissalRate": "Dismissal rate",
  "insights.dismissalRateSub": "{dismissed} dismissed, {postponed} postponed",
  "insights.timePaused": "Time paused",
  "insights.pauseCountSub": "{count} pause{suffix}",
  "insights.topSuppression": "Top suppression",
  "insights.none": "None",
  "insights.deltaExplanation":
    "Delta chips compare with the previous {days} days.",
  "stats.minutes": "{minutes}m",
  "stats.hours": "{hours}h",
  "stats.hoursMinutes": "{hours}h {minutes}m",
  "stats.weekday.mon": "Mon",
  "stats.weekday.tue": "Tue",
  "stats.weekday.wed": "Wed",
  "stats.weekday.thu": "Thu",
  "stats.weekday.fri": "Fri",
  "stats.weekday.sat": "Sat",
  "stats.weekday.sun": "Sun",
  "stats.month.jan": "Jan",
  "stats.month.feb": "Feb",
  "stats.month.mar": "Mar",
  "stats.month.apr": "Apr",
  "stats.month.may": "May",
  "stats.month.jun": "Jun",
  "stats.month.jul": "Jul",
  "stats.month.aug": "Aug",
  "stats.month.sep": "Sep",
  "stats.month.oct": "Oct",
  "stats.month.nov": "Nov",
  "stats.month.dec": "Dec",
  "stats.weekdayHistogramAria": "Breaks taken vs dismissed by weekday",
  "stats.takenTooltip": "{label}: {count} taken",
  "stats.dismissedTooltip": "{label}: {count} dismissed",
  "stats.hourTooltip": "{hour}:00 — {count} break{suffix}",
  "stats.heatmapDay.mon": "Mon",
  "stats.heatmapDay.wed": "Wed",
  "stats.heatmapDay.fri": "Fri",
  "stats.heatmapAria": "Breaks taken per day, last 12 weeks",
  "stats.heatmapTooltip": "{date}\n{taken} taken, {dismissed} dismissed",
  "stats.less": "Less",
  "stats.more": "More",
  "insights.postponeFollowThrough": "Postpone follow-through",
  "insights.postponeFollowThroughDesc":
    "How postponed breaks eventually resolved.",
  "insights.breaksSuppressedBy": "Breaks suppressed by",
  "insights.byWeekday": "By weekday",
  "insights.byWeekdayDesc":
    "Solid: taken. Faded: dismissed. Hover a bar for counts.",
  "insights.timeOfDay": "Time of day",
  "insights.past12Weeks": "Past 12 weeks",
  "insights.manageData": "Manage data",
  "insights.exportCsv": "Export CSV",
  "insights.exportBackup": "Export full backup",
  "insights.importBackup": "Import full backup",
  "insights.clearHistory": "Clear history",
  "insights.clearPrompt":
    "Clear all break history? This cannot be undone.",
  "insights.clearTitle": "Clear history",
  "insights.clearOk": "Clear",
  "insights.cancel": "Cancel",
  "insights.backupFilter": "Entracte backup",
  "insights.backupWritten": "Backup written to {path}",
  "insights.backupExportFailed": "Backup export failed: {error}",
  "insights.importPrompt":
    "Importing replaces your profiles, settings, break history, pause state, and supporter record on this machine.\n\nContinue?",
  "insights.importTitle": "Import backup",
  "insights.importOk": "Replace",
  "insights.backupImported": "Backup imported",
  "insights.backupImportFailed": "Backup import failed: {error}",
  "insights.backupSecurityNotice":
    "Full-backup files contain your manual supporter token (if you have one). Treat them like a password — keep them on a device you control, don't post them in public bug reports.",
  "insights.deltaChipPrev": "Previous: {prev}",

  // onboarding-wizard
  "onboarding.stepWelcome": "Welcome",
  "onboarding.stepLogin": "Start at login",
  "onboarding.stepWindow": "Working hours",
  "onboarding.stepHints": "Wellness hints",
  "onboarding.stepWinddown": "Wind down",
  "onboarding.stepDone": "All set",
  "onboarding.stepCount": "Step {curr} of {total}",
  "onboarding.close": "Close",
  "onboarding.skipSetup": "Skip setup",
  "onboarding.back": "Back",
  "onboarding.finish": "Finish",
  "onboarding.next": "Next",
  "onboarding.welcomeTitle": "Welcome to Entracte",
  "onboarding.welcomeBody":
    "Entracte nudges you to step away from the screen with short micro breaks and longer rest breaks. Let’s tune a few things so the reminders fit how you work — it takes under a minute, and you can change everything later in Settings.",
  "onboarding.loginTitle": "Start Entracte at login",
  "onboarding.loginBody":
    "Break reminders only work while Entracte is running. Starting it automatically means you don’t have to remember to launch it each day.",
  "onboarding.loginCheckbox": "Start Entracte when I log in",
  "onboarding.windowTitle": "When should breaks fire?",
  "onboarding.windowBody":
    "Limit reminders to your working hours so Entracte stays quiet evenings and weekends. Leave this off to be reminded around the clock.",
  "onboarding.windowCheckbox": "Only remind me during working hours",
  "onboarding.startOfDay": "Start of day",
  "onboarding.endOfDay": "End of day",
  "onboarding.onTheseDays": "On these days",
  "onboarding.onTheseDaysTip":
    "Turn off days you don't work — like the weekend — and Entracte stays quiet then. You can fine-tune this later under Schedule.",
  "onboarding.hintsTitle": "Wellness hints",
  "onboarding.hintsBody":
    "Each break can show a suggestion — a stretch, a breath, a moment away from the desk. Long-break ideas come in two flavours.",
  "onboarding.hintsCheckbox": "Show a wellness hint during breaks",
  "onboarding.longSuggestions": "Long-break suggestions",
  "onboarding.longSuggestionsTip":
    "Solo: things to do on your own (stretch, fresh air, snack). Social: things to do with someone (call, walk together). Working alone? Pick Solo only to drop the social prompts.",
  "onboarding.longOptionBoth": "Mix of solo and social",
  "onboarding.longOptionSolo": "Solo only — I work alone",
  "onboarding.longOptionSocial": "Social only",
  "onboarding.winddownTitle": "Wind down & focus",
  "onboarding.winddownBody":
    "Bedtime prompts gently remind you to log off as the evening winds down. Strict mode removes the skip and postpone buttons so breaks always happen — handy if you tend to dismiss them.",
  "onboarding.winddownCheckbox": "Remind me to wind down before bed",
  "onboarding.winddownStarts": "Wind-down starts",
  "onboarding.winddownEnds": "Wind-down ends",
  "onboarding.strictCheckbox":
    "Strict mode (breaks can’t be skipped or postponed)",
  "onboarding.strictTip":
    "Disables every escape hatch on the overlay. You can turn this off any time on the Breaks tab.",
  "onboarding.doneTitle": "You’re all set",
  "onboarding.doneBody":
    "That’s the essentials. Everything you picked — plus break intervals, sounds, overlay appearance, profiles and more — lives in Settings, ready whenever you want to fine-tune it.",

  // quiet-tab
  "quiet.autoPause": "Auto-pause",
  "quiet.autoPauseDesc":
    "Breaks are automatically suppressed while these conditions apply.",
  "quiet.dnd": "Do Not Disturb is on",
  "quiet.dndTipSupported":
    "Reads your OS-level DnD / Focus state (macOS, Windows, and GNOME/KDE on Linux). When on, scheduled breaks are suppressed until DnD turns off.",
  "quiet.dndTipFallback":
    "Reads your OS-level DnD / Focus state where available. When on, scheduled breaks are suppressed until DnD turns off.",
  "quiet.camera": "Camera is in use",
  "quiet.cameraTip":
    "Suppresses breaks while another app is using your webcam — keeps video meetings uninterrupted.",
  "quiet.fullscreenVideo": "Fullscreen video is playing",
  "quiet.fullscreenVideoTipReliable":
    "Suppresses breaks while a fullscreen video is detected. Confirms a real fullscreen window, so a small background video won't hold your breaks.",
  "quiet.fullscreenVideoTipUnreliable":
    "Suppresses breaks while a fullscreen video is detected. On Wayland there is no way to confirm a fullscreen window, so detection is unreliable: it falls back to any media keeping the display awake, which may suppress breaks for a small background video.",
  "quiet.duringBreaks": "During breaks",
  "quiet.pauseMedia": "Pause media while a break is showing",
  "quiet.pauseMediaTipGranular":
    "When a break starts, pauses whatever is playing (video or audio) and resumes it when the break ends. This targets your media players precisely.",
  "quiet.pauseMediaTipFallback":
    "When a break starts, pauses whatever is playing and resumes it when the break ends. It can only send a best-effort play/pause media key, so it is unreliable: it may miss the player you meant, and it will never resume anything it did not itself pause.",
  "quiet.appPause": "Pause for specific apps",
  "quiet.appPauseCheckbox": "Pause when any of these apps are running",
  "quiet.appPauseTip":
    "Matches partial app names case-insensitively. Whenever any listed app is running, breaks are suppressed.",
  "quiet.appPausePlaceholder":
    "One app name per line — partial, case-insensitive match (e.g. zoom, obs, keynote)",
  "quiet.quickAdd": "Quick add",
  "quiet.manualPause": "Manual pause",
  "quiet.resume": "Resume",
  "quiet.pausedRemaining": "Paused — {remaining} left",
  "quiet.pausedIndefinitely": "Paused indefinitely",
  "quiet.manualPauseDesc":
    "Pause from the menu bar icon for a quick duration, or until a specific date and time below — handy over a holiday when you're on the computer but not working.",
  "quiet.pauseUntil": "Pause until",
  "quiet.pauseUntilThen": "Pause until then",

  // system-tab
  "system.startup": "Startup",
  "system.autostart": "Start Entracte at login",
  "system.display": "Display",
  "system.timeFormat": "Time format",
  "system.format24h": "24-hour (14:30)",
  "system.format12h": "12-hour (2:30 PM)",
  "system.notifications": "Notifications",
  "system.prebreakNotify": "Notify before a break starts",
  "system.prebreakNotifyTip":
    "Posts a heads-up system notification N seconds before the overlay appears, so a break doesn't catch you mid-thought.",
  "system.leadTimeSeconds": "Lead time (seconds)",
  "system.hotkeys": "Global hotkeys",
  "system.tray": "Tray countdown",
  "system.trayCountdown": "Show countdown to next break in the tray",
  "system.trayCountdownTip":
    "Shows a live mm:ss next to the tray icon. macOS and Linux only — Windows doesn't support tray text.",
  "system.countdownTo": "Count down to",
  "system.plugins": "Plugins",
  "system.showAdvancedHooks": "Show advanced (hooks)",
  "system.eventHooks": "Event hooks",
  "system.hooksWarning":
    "⚠ Hooks run shell commands on your machine with your full user permissions — a hostile command can read or delete your files, send data over the network, or run other programs. Only add commands you wrote or fully understand. Use Test to see exactly what a command does before relying on it. Off by default; changes only take effect after Save hooks and a confirmation dialog. Commands run via argv (no shell), so pipes, redirects and $ENV expansion need an explicit sh -c \"…\" wrapper. Available variables: $ENTRACTE_EVENT, $ENTRACTE_KIND, $ENTRACTE_DURATION_SECS, $ENTRACTE_OUTCOME.",
  "system.runShellCommands": "Run shell commands on break events",
  "system.addHook": "Add hook",
  "system.waitingConfirmation": "Waiting for confirmation…",
  "system.saveHooks": "Save hooks",
  "system.reset": "Reset",

  // profiles-tab
  "profiles.title": "Profiles",
  "profiles.desc":
    'Each profile keeps its own break cadence, hints, and overlay settings. Switching is instant. The active profile drives every other tab here, and appears in the tray under "Active profile".',
  "profiles.moveUpAria": "Move {name} up",
  "profiles.moveDownAria": "Move {name} down",
  "profiles.nameAria": "Profile name",
  "profiles.activeBadge": "active",
  "profiles.useProfileAria": "Use profile {name}",
  "profiles.useProfileTitle": "Use this profile",
  "profiles.renameAria": "Rename profile {name}",
  "profiles.renameTitle": "Rename",
  "profiles.duplicateAria": "Duplicate profile {name}",
  "profiles.duplicateTitle": "Duplicate",
  "profiles.copyOf": "{source} copy",
  "profiles.confirmReset": "Confirm reset",
  "profiles.resetAria": "Reset profile {name} to defaults",
  "profiles.resetTitle": "Reset to defaults",
  "profiles.confirmDelete": "Confirm delete",
  "profiles.deleteAria": "Delete profile {name}",
  "profiles.deleteTitle": "Delete",
  "profiles.newPlaceholder": "New profile name",
  "profiles.add": "Add",

  // about-tab
  "about.title": "About",
  "about.checking": "Checking…",
  "about.checkUpdates": "Check for updates",
  "about.version": "Version {version}",
  "about.tagline": "Cross-platform break reminder.",
  "about.license": "Apache 2.0 licensed.",
  "about.autoCheckUpdates": "Automatically check for updates on launch",
  "about.updateAvailable":
    "Update available: {latest} (you have {current}).",
  "about.downloadFor": "Download for {label}",
  "about.allDownloads": "All downloads",
  "about.openReleasePage": "Open release page",
  "about.windowsUnsignedWarning":
    "The Windows installer isn't Authenticode-signed yet, so SmartScreen will warn — click More info → Run anyway to proceed.",
  "about.latestVersion": "You're on the latest version ({current}).",
  "about.checkFailed": "Check failed: {error}",
  "about.supporter": "Supporter",
  "about.supporterUnlocked": "Thank you. The customisation pack is unlocked.",
  "about.licenseKey": "License: {key}",
  "about.removeLicense": "Remove license",
  "about.supporterPitch":
    "Entracte is free to use. The customisation pack — custom overlay colours, rotating themes, custom sounds, custom CSS, and editable break hints — is unlocked by becoming a supporter once, forever.",
  "about.becomeSupporter": "Become a supporter →",
  "about.alreadyHaveLicense":
    "Already have a license? Paste it below and click Verify.",
  "about.licensePlaceholder": "License key",
  "about.verifying": "Verifying…",
  "about.verify": "Verify",
  "about.verifyWelcome": "Welcome — the customisation pack is unlocked.",
  "about.verifyInactive":
    "Validation finished but the license isn't active. Try again.",
  "about.verifyFailed": "Could not verify: {error}",
  "about.licenseRemoved": "License removed.",
  "about.removeFailed": "Could not remove license: {error}",
  "about.author": "Author",
  "about.buyMeACoffee": "☕ Buy me a coffee",
  "about.authorName": "Built by Dr. Athanasia M. Mowinckel",
  "about.authorBio":
    "Senior staff engineer & researcher, working on tools for reproducible science and developer wellbeing.",
  "about.companionApp": "Companion app",
  "about.cairnPitch":
    "Tracking your work hours too? Cairn is Entracte's sibling — local-first time tracking that quietly notices what you work on.",
  "about.tryCairn": "Try Cairn →",
  "about.diagnostics": "Diagnostics",
  "about.copyDiagnosticsReport": "Copy diagnostics report",
  "about.reportCopied": "Report copied to clipboard",
  "about.copyFailed": "Clipboard copy failed",
  "about.couldNotBuildReport": "Could not build report",
  "about.diagnosticsHint":
    "Click Copy diagnostics report when filing an issue at {link} — it includes app version, settings, and the last 50 KB of logs.",

  "infoTip.more": "More information",
  "infoTip.warning": "Warning",

  // settings shell
  "settings.skipToContent": "Skip to settings content",
  "settings.sectionsAria": "Settings sections",
  "settings.loading": "Loading…",

  // advanced component
  "advanced.default": "Advanced",

  // content-packs component
  "contentPacks.filter": "Entracte content pack",
  "contentPacks.defaultName": "Entracte content pack ({today})",
  "contentPacks.exportedTo": "Exported to {path}",
  "contentPacks.exportFailed": "Export failed: {error}",
  "contentPacks.importedSuccess": "Imported {ideas} and {routines}.",
  "contentPacks.importFailed": "Import failed: {error}",
  "contentPacks.desc":
    "Share or back up your break ideas and guided routines as a local file.",
  "contentPacks.tip":
    "A content pack is a plain JSON file. Importing adds its ideas and routines to your pools without removing anything you already have; exact duplicates are skipped.",
  "contentPacks.importBtn": "Import content pack…",
  "contentPacks.exportBtn": "Export content pack…",

  // hook-row component
  "hooks.testSuccess": "✓ Exited 0",
  "hooks.testFail": "Exited with code {code}",
  "hooks.noOutput": "No output.",
  "hooks.eventAria": "Hook event",
  "hooks.commandAria": "Hook command",
  "hooks.commandPlaceholder":
    'e.g. sh -c "osascript -e \'tell app \\"Music\\" to pause\'"',
  "hooks.on": "On",
  "hooks.testing": "Testing…",
  "hooks.test": "Test",
  "hooks.remove": "Remove",
  "hooks.insertTemplateAria": "Insert template",
  "hooks.insertTemplate": "Insert template…",

  // hook-templates
  "hookTemplate.log-to-file": "Log break events to a file",
  "hookTemplate.pause-music-macos": "Pause music — macOS (Music app)",
  "hookTemplate.resume-music-macos": "Resume music — macOS (Music app)",
  "hookTemplate.notify-linux": "Desktop notification — Linux (notify-send)",
  "hookTemplate.slack-status": "Set Slack status (fill in your token)",
  "hookTemplate.home-assistant-scene":
    "Home Assistant scene (fill in your host & token)",

  // hotkeys
  "hotkeyAction.pause": "Pause breaks",
  "hotkeyAction.pause_15m": "Pause for 15 minutes",
  "hotkeyAction.pause_30m": "Pause for 30 minutes",
  "hotkeyAction.pause_60m": "Pause for 60 minutes",
  "hotkeyAction.resume": "Resume breaks",
  "hotkeyAction.trigger_micro": "Take a micro break now",
  "hotkeyAction.trigger_long": "Take a long break now",
  "hotkeyAction.skip_micro": "Skip next micro break",
  "hotkeyAction.skip_long": "Skip next long break",
  "hotkeyAction.cycle_profile": "Switch to next profile",
  "hotkeys.enable": "Enable global hotkeys",
  "hotkeys.enableTip":
    "Register OS-level keyboard shortcuts for the actions below. They fire whether or not this window is focused. Format example: CmdOrCtrl+Alt+P.",
  "hotkeys.invalidSyntax":
    "Not a recognised shortcut. Use one or more modifiers (CmdOrCtrl, Alt, Shift) plus a single key, e.g. CmdOrCtrl+Alt+P.",
  "hotkeys.conflict":
    "This shortcut is also bound to another action. Give each action a unique chord.",
  "hotkeys.placeholder": "e.g. CmdOrCtrl+Alt+P",
  "hotkeys.clearAria": "Clear {label} shortcut",
  "hotkeys.clear": "Clear",

  // shared counts
  "common.countHints": "{n} idea{suffix}",
  "common.countRoutines": "{n} routine{suffix}",
  "common.countImages": " with {n} image{suffix}",

  // plugins component
  "plugins.filter": "Entracte plugin",
  "plugins.listError": "Could not list plugins: {error}",
  "plugins.installedContent":
    'Installed "{name}" — added {hints} and {routines}{images}.',
  "plugins.installedGeneric": 'Installed "{name}".',
  "plugins.installFailed": "Install failed: {error}",
  "plugins.removed": 'Removed "{name}".',
  "plugins.uninstallFailed": "Uninstall failed: {error}",
  "plugins.desc":
    "Install a local plugin file to add break ideas and routines from the community.",
  "plugins.tip":
    "Plugins are local files you choose yourself — no store, no account, no network. Installing shows a confirmation dialog with the plugin's name, author, and signing key. Uninstalling removes exactly what it added.",
  "plugins.warning": "⚠ Only install plugin files from sources you trust.",
  "plugins.working": "Working…",
  "plugins.installBtn": "Install plugin…",
  "plugins.uninstallAria": "Uninstall {name}",
  "plugins.uninstall": "Uninstall",
  "plugins.noPlugins": "No plugins installed.",
  "plugins.rowCounts": "{hints} idea{hSuffix}, {routines} routine{rSuffix}",

  // postpone-donut component
  "postponeDonut.taken": "Eventually taken",
  "postponeDonut.dismissed": "Dismissed instead",
  "postponeDonut.skipped": "Skipped instead",
  "postponeDonut.unresolved": "Still pending",
  "postponeDonut.ariaLabel":
    "Postpone follow-through: {taken} taken, {dismissed} dismissed, {skipped} skipped, {unresolved} pending",
  "postponeDonut.caption": "postpone{suffix}",

  // routine-picker component
  "routine.category.eyes": "Eyes",
  "routine.category.mobility": "Mobility",
  "routine.category.breathing": "Breathing",
  "routine.category.desk_yoga": "Desk yoga",
  "routine.difficulty.gentle": "Gentle",
  "routine.difficulty.moderate": "Moderate",
  "routine.difficulty.active": "Active",
  "routine.guidedRoutine": "Guided routine",
  "routine.guidedRoutineTip":
    "Step-by-step prompts that advance through the break instead of a single rotating idea. Random picks a fresh routine each break from the filters below; None keeps the rotating ideas above.",
  "routine.modeNone": "None (rotate ideas)",
  "routine.modeRandom": "Random (from filters)",
  "routine.categories": "Categories",
  "routine.categoriesTip":
    "Draw routines only from the ticked categories. Leave all unticked to draw from every category.",
  "routine.maxDifficulty": "Maximum difficulty",
  "routine.maxDifficultyTip":
    "Include routines up to and including this level — Gentle for the lightest only, Active for everything.",

  // rows component
  "rows.platformOnly": " ({platforms} only)",

  // settings-search component
  "search.inputPlaceholder": "Search settings…",
  "search.inputAria": "Search settings",
  "search.empty": "No matching settings",

  // sound-controls component
  "soundControls.filterAudio": "Audio",
  "soundControls.sound": "Sound",
  "soundControls.soundTip":
    "End chime plays once when the break finishes. Ambient loops throughout the break and stops when it ends.",
  "soundControls.track": "Track",
  "soundControls.customFile": "Custom file…",
  "soundControls.noFileSelected": "No file selected",
  "soundControls.replace": "Replace…",
  "soundControls.chooseFile": "Choose file…",
  "soundControls.useBundled": "Use bundled",

  // suppression-bars component
  "suppressionBars.tableAria": "Suppressions by reason and break kind",
  "suppressionBars.trackAria": "{label}: {total} suppressions",
  "suppressionBars.segTitle": "{kind} — {label}: {count}",
  "suppressionBars.kindMicro": "Micro",
  "suppressionBars.kindLong": "Long",
  "suppressionBars.kindSleep": "Sleep",

  // tray-countdown
  "trayCountdown.next": "Next break (soonest)",
  "trayCountdown.short": "Next micro break",
  "trayCountdown.long": "Next long break",

  // weekdays
  "weekdays.mon.abbr": "Mon",
  "weekdays.mon.name": "Monday",
  "weekdays.tue.abbr": "Tue",
  "weekdays.tue.name": "Tuesday",
  "weekdays.wed.abbr": "Wed",
  "weekdays.wed.name": "Wednesday",
  "weekdays.thu.abbr": "Thu",
  "weekdays.thu.name": "Thursday",
  "weekdays.fri.abbr": "Fri",
  "weekdays.fri.name": "Friday",
  "weekdays.sat.abbr": "Sat",
  "weekdays.sat.name": "Saturday",
  "weekdays.sun.abbr": "Sun",
  "weekdays.sun.name": "Sunday",
  "weekdayToggle.groupAria": "Days the work window applies to",

  // windowed-size-row component
  "windowedSize.sameAsGlobal": "Same as global",
  "windowedSize.custom": "Custom",
  "windowedSize.customSize": "Custom size",

  // window-kind
  "windowTitle.overlay": "Entracte — Break",
  "windowTitle.pause": "Entracte — Pause",
  "windowTitle.settings": "Entracte — Settings",

  // app areas
  "app.areaOverlay": "Break overlay",
  "app.areaPause": "Pause picker",
  "app.areaSettings": "Settings",

  // error-boundary
  "error.areaHitError": "{area} hit an error",
  "error.somethingWentWrong": "Something went wrong",
  "error.recoveryHint": "The window can usually recover. If it doesn't, reload.",
  "error.technicalDetails": "Technical details",
  "error.tryAgain": "Try again",
  "error.reload": "Reload",

  // pause-picker
  "pausePicker.dayAria": "Day",
  "pausePicker.monthAria": "Month",
  "pausePicker.yearAria": "Year",
  "pausePicker.title": "Pause until",
  "pausePicker.hint":
    "Suppress all breaks until the chosen date and time, shown in your region's format.",
  "pausePicker.time": "Time",
  "pausePicker.cancel": "Cancel",
  "pausePicker.pause": "Pause",

  // a11y helpers
  "a11y.dialogLabel.sleep": "Entracte, bedtime",
  "a11y.dialogLabel.long": "Entracte, long break",
  "a11y.dialogLabel.micro": "Entracte, micro break",
  "a11y.durationMinutesSeconds":
    "{minutes} minute{mSuffix} {seconds} second{sSuffix}",
  "a11y.durationMinutes": "{minutes} minute{mSuffix}",
  "a11y.durationSeconds": "{seconds} second{sSuffix}",
  "a11y.announceBreak": "{label}. You have {duration}.",
  "a11y.youHave": "You have {duration}.",
  "a11y.timesUp": "Time's up",
  "a11y.remainingMinutesSeconds":
    "{minutes} minute{mSuffix} {seconds} second{sSuffix} remaining",
  "a11y.remainingMinutes": "{minutes} minute{mSuffix} remaining",
  "a11y.remainingSeconds": "{seconds} second{sSuffix} remaining",
  "a11y.milestoneHalfway": "Halfway through your {noun}.",
  "a11y.milestoneOneMinute": "About a minute left.",
  "a11y.milestoneTenSeconds": "Almost done.",
  "a11y.milestoneBedtimeComplete": "Bedtime complete.",
  "a11y.milestoneBreakComplete": "Break complete.",
  "a11y.nounBedtime": "bedtime",
  "a11y.nounBreak": "break",

  // chore-prompt
  "chorePrompt.withMinutes": "You've got ~{mins} min — knock out: {chore}",
  "chorePrompt.quick": "Quick one — knock out: {chore}",

  // postpone
  "postpone.withCount": "Postpone ({count} of {max})",
  "postpone.simple": "Postpone",

  // skip-hint
  "overlay.enforceableLongBreakHint":
    "Long breaks are set to enforceable — change in Settings → Schedule.",

  // breath
  "breath.phase.inhale": "Breathe in",
  "breath.phase.hold": "Hold",
  "breath.phase.exhale": "Breathe out",
  "breath.phase.hold_out": "Hold",
  "breath.phase.rest": "Rest",
  "breath.phaseLabel": "{phase} · {seconds}s",
  "breath.phaseAria": "{phase}, {seconds} seconds",

  // overlay
  "overlay.kind.sleep": "Bedtime",
  "overlay.kind.long": "Long break",
  "overlay.kind.micro": "Micro break",
  "overlay.done": "Done",
  "overlay.timerSeconds": "{seconds}s",
  "overlay.stepSeconds": " · {seconds}s",
  "overlay.stepProgressAria": "Step {curr} of {total}: {text}",
  "overlay.stepProgress": "Step {curr} of {total}",
  "overlay.choreAria": "Chore for this break: {chore}",
  "overlay.wellnessTipAria": "Wellness tip: {hint}",
  "overlay.typingPaused": "Paused — break resumes when you stop typing",
  "overlay.imBack": "I'm back",
  "overlay.endBreakAria": "End break",
  "overlay.postponeBreakAria": "Postpone break",
  "overlay.skip": "Skip",
  "overlay.skipBreakAria": "Skip break",
  "overlay.postponeExhausted": "Postpone exhausted — take this break",
};
