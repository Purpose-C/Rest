export const zhCN: Record<string, string> = {
  // break-mode
  "breakMode.overlay": "全屏遮罩",
  "breakMode.windowed": "窗口模式",
  "breakMode.notification": "仅系统通知",

  // constants
  "constants.placement.primary": "主显示器",
  "constants.placement.active": "光标所在显示器",
  "constants.placement.all": "所有显示器",
  "constants.hookEvent.break_start": "休息开始",
  "constants.hookEvent.break_end": "休息结束",
  "constants.hookEvent.break_postponed": "休息被推迟",
  "constants.hookEvent.break_skipped": "休息被跳过",
  "constants.hookEvent.pause_start": "暂停开始",
  "constants.hookEvent.pause_end": "暂停结束",
  "constants.theme.dark": "暗色",
  "constants.theme.midnight": "午夜",
  "constants.theme.forest": "森林",
  "constants.theme.rose": "玫瑰",
  "constants.theme.sunset": "日落",
  "constants.theme.rotate": "轮换",
  "constants.theme.custom": "自定义…",
  "constants.soundMode.off": "关闭",
  "constants.soundMode.end_chime": "休息结束时提示音",
  "constants.soundMode.ambient": "氛围音（休息期间循环播放）",
  "constants.tab.schedule": "计划",
  "constants.tab.breaks": "休息",
  "constants.tab.quiet": "暂停",
  "constants.tab.system": "系统",
  "constants.tab.insights": "统计",
  "constants.tab.profiles": "情景",
  "constants.tab.about": "关于",

  // breaks-tab
  "breaks.delivery": "呈现方式",
  "breaks.deliveryDesc":
    "每种休息的显示方式。在“计划”标签页中可以开启或关闭休息并设置其周期。",
  "breaks.deliveryTip":
    "全屏遮罩覆盖整个显示器。窗口模式以屏幕比例显示相同提示，保持桌面可操作。仅系统通知只发送通知，不记录跳过/推迟统计指标。",
  "breaks.microBreaks": "短休息",
  "breaks.longBreaks": "长休息",
  "breaks.testMicro": "测试短休息",
  "breaks.testLong": "测试长休息",
  "breaks.takeLongNow": "立即进行长休息",
  "breaks.overlay": "全屏遮罩",
  "breaks.transparency": "透明度",
  "breaks.transparencyTip":
    "0% 为完全不透明。更高的值可以让您的工作内容隐约显现 —— 作为更温和的提示方式。",
  "breaks.textSize": "字号",
  "breaks.theme": "主题",
  "breaks.themeTip":
    "选择预设主题、“轮换”（每次休息使用不同预设）或“自定义”任意颜色。自定义颜色会自动压暗以保证遮罩调暗屏幕。",
  "breaks.customColor": "自定义颜色",
  "breaks.showHints": "显示健康提示",
  "breaks.rotateHints": "休息期间轮换提示",
  "breaks.rotateHintsTip":
    "关闭：每次休息选择一条提示并在屏幕上保持不变。开启：休息界面每隔 N 秒在剩余提示池中轮换一条提示。",
  "breaks.rotateEverySeconds": "轮换间隔（秒）",
  "breaks.showCurrentTime": "在休息界面上显示当前时间",
  "breaks.showAdvancedOverlay": "显示高级休息界面选项",
  "breaks.showBreakOn": "在何处显示休息",
  "breaks.showBreakOnTip":
    "主显示器：总是在主屏幕显示。光标所在：在休息触发时光标所在的屏幕显示。所有：休息覆盖每一个显示器。",
  "breaks.windowedSize": "窗口模式休息尺寸",
  "breaks.windowedSizeTip":
    "窗口模式休息占据屏幕的比例。仅适用于在“计划”标签页中设置为窗口模式呈现的休息；全屏遮罩始终覆盖整个显示器。",
  "breaks.microWindowedSize": "短休息尺寸",
  "breaks.microWindowedSizeTip":
    "仅针对短休息覆盖窗口模式尺寸。快速的短休息可以比长休息更小。",
  "breaks.longWindowedSize": "长休息尺寸",
  "breaks.longWindowedSizeTip":
    "仅针对长休息覆盖窗口模式尺寸。保留为“与全局相同”以遵循上方的窗口模式尺寸。",
  "breaks.highContrast": "高对比度（纯黑背景、白字、实线环）",
  "breaks.highContrastTip":
    "覆盖主题颜色与透明度设置，直到关闭此选项。即使关闭此选项，操作系统级的“增强对比度”偏好设置也会在休息时自动生效。",
  "breaks.showVignette": "跳过休息时显示暗角",
  "breaks.showVignetteTip":
    "当您持续跳过休息时，休息界面上会出现微妙的暗角，并随着跳过次数增加而加深。",
  "breaks.sound": "音效",
  "breaks.volume": "音量",
  "breaks.soundDesc":
    "音量适用于所有休息音效。请在下方为每种休息类型选择音轨。",
  "breaks.skipPostpone": "跳过与推迟",
  "breaks.strictMode": "严格模式（强制所有休息，禁止跳过或推迟）",
  "breaks.strictModeTip":
    "禁用休息界面上的所有退出途径。严格模式开启时，下方的推迟与跳过设置将被忽略。",
  "breaks.allowPostpone": "允许推迟休息",
  "breaks.allowPostponeTip":
    "推迟功能的总开关。开启后，在下方选择哪些休息类型可以推迟。",
  "breaks.postponeByMinutes": "推迟时长（分钟）",
  "breaks.escalatePostpone": "同一休息的后续推迟递增延迟",
  "breaks.escalatePostponeTip":
    "同一休息的每次推迟都会增加额外延迟，使反复推迟逐渐失去吸引力。",
  "breaks.extraDelayPerPostpone": "每次推迟额外增加延迟（秒）",
  "breaks.maxPostpones": "每场休息最大推迟次数",
  "breaks.perBreakType": "按休息类型",
  "breaks.postponeMicro": "推迟短休息",
  "breaks.postponeMicroTip": "在短休息界面上显示“推迟”按钮。",
  "breaks.postponeLong": "推迟长休息",
  "breaks.postponeLongTip": "在长休息界面上显示“推迟”按钮。",
  "breaks.skipMicro": "跳过短休息",
  "breaks.skipMicroTip":
    "关闭时，短休息界面上不显示“跳过”按钮，且按 Esc 键无法关闭。",
  "breaks.skipLong": "跳过长休息",
  "breaks.skipLongTip":
    "关闭时，长休息界面上不显示“跳过”按钮，且按 Esc 键无法关闭。",
  "breaks.skipNextMicro": "跳过下次短休息",
  "breaks.skipNextLong": "跳过下次长休息",
  "breaks.enforcement": "不可跳过",
  "breaks.microManualFinish": "短休息：等待手动结束",
  "breaks.microManualFinishTip":
    "倒计时归零后短休息界面不会自动关闭，而是保持显示直到您点击“我回来了”。",
  "breaks.longManualFinish": "长休息：等待手动结束",
  "breaks.longManualFinishTip":
    "倒计时归零后长休息界面不会自动关闭，而是保持显示直到您点击“我回来了”。",
  "breaks.microEnforceable": "短休息：不可跳过",
  "breaks.microEnforceableTip":
    "短休息期间隐藏跳过与关闭控件。请谨慎使用。",
  "breaks.longEnforceable": "长休息：不可跳过",
  "breaks.longEnforceableTip": "长休息期间隐藏跳过与关闭控件。",
  "breaks.breakIdeas": "健康提示内容",
  "breaks.breakIdeasDesc": "选择每次休息期间显示的提示类型。",
  "breaks.breakIdeasSupporterDesc":
    " 在下方编辑提示池 —— 每行一条；每次休息随机抽取一条作为起始提示。",
  "breaks.mix": "组合",
  "breaks.microMixTip":
    "身体：拉伸、眼部放松、活动肢体。心理：呼吸、觉察、释放压力。",
  "breaks.mixBoth": "两者兼有",
  "breaks.mixPhysicalOnly": "仅身体",
  "breaks.mixPsychologicalOnly": "仅心理",
  "breaks.physicalPool": "身体提示池（拉伸、眼部放松、活动肢体）",
  "breaks.psychologicalPool":
    "心理提示池（呼吸、觉察、释放压力）",
  "breaks.longMixTip":
    "独处：独自进行的活动（拉伸、呼吸新鲜空气、点心）。社交：与他人一起进行的活动（打电话、一同散步、在室外坐坐）。独自工作？选择“仅独处”即可去除社交类提示。",
  "breaks.mixSoloOnly": "仅独处",
  "breaks.mixSocialOnly": "仅社交",
  "breaks.spreadRoutineSteps": "将引导流程步骤均匀分布到整个休息中",
  "breaks.spreadRoutineStepsTip":
    "开启后，引导流程的步骤时长将被视为相对权重并按比例拉伸以填满整个休息时长。关闭（默认）时，步骤按原作者设定的时长运行，最后一步保持显示直至休息结束。引导流程也可通过自带的步频字段覆盖此项。",
  "breaks.playPluginSoundCues": "播放插件提示音效",
  "breaks.playPluginSoundCuesTip":
    "开启（默认）时，来自插件的引导流程可以播放简短提示音 —— 例如吸气/呼气提示音或动作切换提示音。提示音始终遵循全局音量设置；关闭此项可静音。",
  "breaks.todaysChores": "今日杂事",
  "breaks.choresDesc":
    "记下您今天想完成的杂事 —— 每行一条。在长休息期间，Entracte 会提醒您完成其中一项（这些提醒优先于轮换的健康提示）。列表在每天早晨清空。",
  "breaks.oneChorePerLine": "每行一条杂事",
  "breaks.choresPlaceholder": "浇花\n清理洗碗机\n回复邮件",
  "breaks.promptChoresMorning": "每天早晨提醒我规划今日杂事",
  "breaks.promptChoresMorningTip":
    "开启（默认）时，每天活动时段首次开始且杂事列表为空时，Entracte 会自动打开设置窗口以便您规划今日杂事。关闭后将不再提示 —— 您仍可随时手动填写列表。",
  "breaks.longSoloPool": "独处提示池（拉伸、呼吸新鲜空气、点心、整理）",
  "breaks.longSocialPool": "社交提示池（打电话、一同散步、喝杯咖啡）",
  "breaks.bedtime": "就寝提醒",
  "breaks.oneIdeaPerLine": "每行一条提示",
  "breaks.contentPacks": "内容包",
  "breaks.customCss": "自定义 CSS",
  "breaks.customCssDesc":
    "应用于设置窗口和休息界面。错误的 CSS 可能会导致界面控件被隐藏 —— 如果界面异常，请清空此字段。",
  "breaks.stylesheet": "样式表",

  // schedule-tab
  "schedule.activeHours": "活动时段",
  "schedule.onlyWithinHours": "仅在设定时段内触发休息",
  "schedule.onlyWithinHoursTip":
    "在此时间窗口之外，不会触发休息。就寝提醒不受此限制，使用其独立的下方时间窗口。",
  "schedule.start": "开始时间",
  "schedule.end": "结束时间",
  "schedule.onTheseDays": "生效星期",
  "schedule.onTheseDaysTip":
    "仅在所选星期的上述时段内触发休息 —— 可关闭周末，以便在您玩游戏或放松时保持安静。跨越午夜的时间窗口（例如 22:00–06:00）会将凌晨时段计入其开始当天。",
  "schedule.microBreaks": "短休息",
  "schedule.enableMicro": "启用短休息",
  "schedule.enableMicroTip":
    "短时间、高频率的休息。可在“休息”标签页中设置其呈现方式（全屏遮罩、窗口模式或系统通知）。",
  "schedule.scheduleMode": "计划方式",
  "schedule.modeInterval": "固定间隔",
  "schedule.modeFixed": "固定时刻",
  "schedule.modeBoth": "两者兼有",
  "schedule.intervalMinutes": "间隔（分钟）",
  "schedule.fixedTimes": "固定时刻（逗号分隔，{format}）",
  "schedule.durationSeconds": "时长（秒）",
  "schedule.advancedMicroTiming": "短休息高级定时",
  "schedule.idleResetMinutes": "空闲重置阈值（分钟）",
  "schedule.idleResetTip":
    "如果您离开电脑空闲时间超过此值，当您返回时下次休息的计时器将重置 —— Entracte 会假定您已进行过休息。",
  "schedule.longBreaks": "长休息",
  "schedule.enableLong": "启用长休息",
  "schedule.enableLongTip":
    "较长时间、较低频率的休息。可在“休息”标签页中设置其呈现方式（全屏遮罩、窗口模式或系统通知）。",
  "schedule.durationMinutes": "时长（分钟）",
  "schedule.advancedLongTiming": "长休息高级定时",
  "schedule.bedtime": "就寝提醒",
  "schedule.persistentSleepReminders": "在时段内持续弹出就寝提醒",
  "schedule.persistentSleepRemindersTip":
    "在就寝提醒时段内，Entracte 会触发就寝提醒，代替短休息或长休息。就寝提醒始终显示 —— 会忽略免打扰模式与摄像头占用状态。",
  "schedule.reminderIntervalMinutes": "提醒间隔（分钟）",
  "schedule.reminderDurationSeconds": "提醒时长（秒）",
  "schedule.testNow15s": "立即测试（15秒）",
  "schedule.dailyScreenTime": "每日屏幕时间",
  "schedule.remindWrapUp": "达到每日用时预算后提醒我收尾",
  "schedule.remindWrapUpTip":
    "仅统计活跃输入（打字/点击）时间。在本地时间午夜重置。此提醒为系统通知，而非强制休息。",
  "schedule.dailyBudgetHours": "每日用时预算（小时）",
  "schedule.remindAgainAfter": "再次提醒间隔（分钟，0 = 每天仅一次）",
  "schedule.today": "今日",
  "schedule.screenTimeProgressAria": "每日屏幕时间进度",
  "schedule.showAdvancedScheduling": "显示高级定时选项",
  "schedule.inputAwareScheduling": "感知输入的主动定时",
  "schedule.delayBreakIfTyping": "打字时推迟休息触发",
  "schedule.delayBreakIfTypingTip":
    "如果您在休息到期时正在打字，计时器将等待您暂停打字 —— 最多延迟至下方设置的最大推迟时间。",
  "schedule.typingGraceSeconds": "将此时间内的输入判定为持续打字（秒）",
  "schedule.typingMaxDeferralSeconds": "最大推迟时间（秒）",
  "schedule.pauseCountdownIfTyping": "打字时暂停休息倒计时",
  "schedule.pauseCountdownIfTypingTip":
    "在休息期间，倒计时仅在您未打字时递减。在关闭“等待手动结束”时非常实用。",

  // search-index
  "search.activeHours": "活动时段",
  "search.microBreaks": "短休息",
  "search.longBreaks": "长休息",
  "search.bedtime": "就寝提醒",
  "search.screenTime": "每日屏幕时间",
  "search.delivery": "呈现方式",
  "search.overlay": "全屏遮罩外观",
  "search.sound": "音效",
  "search.skipPostpone": "跳过与推迟",
  "search.breakIdeas": "健康提示内容",
  "search.chores": "今日杂事",
  "search.contentPacks": "内容包",
  "search.customCss": "自定义 CSS",
  "search.autoPause": "自动暂停",
  "search.duringBreaks": "休息期间暂停媒体",
  "search.appPause": "针对特定应用暂停",
  "search.manualPause": "手动暂停",
  "search.startup": "开机启动",
  "search.display": "时间格式",
  "search.notifications": "通知",
  "search.hotkeys": "全局快捷键",
  "search.tray": "托盘倒计时",
  "search.plugins": "插件",
  "search.hooks": "事件钩子",
  "search.insights": "统计与数据",
  "search.manageData": "数据管理",
  "search.profiles": "情景",
  "search.about": "关于与更新",
  "search.supporter": "支持者",
  "search.diagnostics": "诊断信息",

  // insights-tab
  "insights.thisSession": "本次会话",
  "insights.thisSessionDesc":
    "自本次程序启动以来的实时计数。每次 Entracte 重启时重置。",
  "insights.taken": "已完成",
  "insights.skipped": "已跳过",
  "insights.postponed": "已推迟",
  "insights.skipRate": "跳过率",
  "insights.resetCounters": "重置本次会话计数",
  "insights.range": "时间范围",
  "insights.pastWeek": "过去一周",
  "insights.pastMonth": "过去一月",
  "insights.loadingStats": "正在加载统计数据…",
  "insights.summary": "概要",
  "insights.breaksTaken": "已完成休息",
  "insights.breaksTakenSub": "{micro} 次短休息，{long} 次长休息",
  "insights.dismissalRate": "跳过率",
  "insights.dismissalRateSub": "{dismissed} 次已跳过，{postponed} 次已推迟",
  "insights.timePaused": "暂停时长",
  "insights.pauseCountSub": "{count} 次暂停",
  "insights.topSuppression": "主要拦截原因",
  "insights.none": "无",
  "insights.deltaExplanation": "对比标识用于与前 {days} 天进行比较。",
  "stats.minutes": "{minutes} 分钟",
  "stats.hours": "{hours} 小时",
  "stats.hoursMinutes": "{hours} 小时 {minutes} 分钟",
  "stats.weekday.mon": "周一",
  "stats.weekday.tue": "周二",
  "stats.weekday.wed": "周三",
  "stats.weekday.thu": "周四",
  "stats.weekday.fri": "周五",
  "stats.weekday.sat": "周六",
  "stats.weekday.sun": "周日",
  "stats.month.jan": "1月",
  "stats.month.feb": "2月",
  "stats.month.mar": "3月",
  "stats.month.apr": "4月",
  "stats.month.may": "5月",
  "stats.month.jun": "6月",
  "stats.month.jul": "7月",
  "stats.month.aug": "8月",
  "stats.month.sep": "9月",
  "stats.month.oct": "10月",
  "stats.month.nov": "11月",
  "stats.month.dec": "12月",
  "stats.weekdayHistogramAria": "按星期比较已完成和已跳过的休息",
  "stats.takenTooltip": "{label}：已完成 {count} 次",
  "stats.dismissedTooltip": "{label}：已跳过 {count} 次",
  "stats.hourTooltip": "{hour}:00 — {count} 次休息",
  "stats.heatmapDay.mon": "周一",
  "stats.heatmapDay.wed": "周三",
  "stats.heatmapDay.fri": "周五",
  "stats.heatmapAria": "过去 12 周每天已完成的休息",
  "stats.heatmapTooltip": "{date}\n已完成 {taken} 次，已跳过 {dismissed} 次",
  "stats.less": "较少",
  "stats.more": "较多",
  "insights.postponeFollowThrough": "推迟后跟进情况",
  "insights.postponeFollowThroughDesc": "被推迟的休息最终的解决方式。",
  "insights.breaksSuppressedBy": "休息拦截原因分布",
  "insights.byWeekday": "按星期分布",
  "insights.byWeekdayDesc":
    "实色：已完成。浅色：已跳过。悬停在柱状图上可查看详细计数。",
  "insights.timeOfDay": "时段分布",
  "insights.past12Weeks": "过去 12 周",
  "insights.manageData": "数据管理",
  "insights.exportCsv": "导出 CSV",
  "insights.exportBackup": "导出完整备份",
  "insights.importBackup": "导入完整备份",
  "insights.clearHistory": "清空历史记录",
  "insights.clearPrompt":
    "清空所有休息历史记录？此操作无法撤销。",
  "insights.clearTitle": "清空历史记录",
  "insights.clearOk": "清空",
  "insights.cancel": "取消",
  "insights.backupFilter": "Entracte 备份文件",
  "insights.backupWritten": "备份已写入至 {path}",
  "insights.backupExportFailed": "导出备份失败：{error}",
  "insights.importPrompt":
    "导入备份将覆盖本机上的所有情景、设置、休息历史、暂停状态及支持者记录。\n\n是否继续？",
  "insights.importTitle": "导入备份",
  "insights.importOk": "覆盖导入",
  "insights.backupImported": "备份已导入",
  "insights.backupImportFailed": "导入备份失败：{error}",
  "insights.backupSecurityNotice":
    "完整备份文件包含您的手动支持者令牌（如果您拥有）。请妥善保管（如密码一般）—— 保存在您控制的设备上，切勿公开发布在故障报告中。",
  "insights.deltaChipPrev": "上期：{prev}",

  // onboarding-wizard
  "onboarding.stepWelcome": "欢迎",
  "onboarding.stepLogin": "开机启动",
  "onboarding.stepWindow": "活动时段",
  "onboarding.stepHints": "健康提示",
  "onboarding.stepWinddown": "放松收尾",
  "onboarding.stepDone": "准备就绪",
  "onboarding.stepCount": "第 {curr} 步，共 {total} 步",
  "onboarding.close": "关闭",
  "onboarding.skipSetup": "跳过设置",
  "onboarding.back": "上一步",
  "onboarding.finish": "完成",
  "onboarding.next": "下一步",
  "onboarding.welcomeTitle": "欢迎使用 Entracte",
  "onboarding.welcomeBody":
    "Entracte 通过简短的短休息和更充分的长休息，提醒您适时离开屏幕。让我们花不到一分钟的时间进行几项基本设置，使提醒更契合您的工作节奏 —— 您之后可随时在“设置”中修改任何选项。",
  "onboarding.loginTitle": "登录时自动启动 Entracte",
  "onboarding.loginBody":
    "休息提醒仅在 Entracte 运行时生效。设置为自动启动可以让您无需每天手动打开它。",
  "onboarding.loginCheckbox": "登录系统时启动 Entracte",
  "onboarding.windowTitle": "在什么时间触发休息？",
  "onboarding.windowBody":
    "将提醒限制在您的活动时段内，以便 Entracte 在晚上和周末保持安静。关闭此项则全天候提醒。",
  "onboarding.windowCheckbox": "仅在活动时段内提醒我",
  "onboarding.startOfDay": "工作开始时间",
  "onboarding.endOfDay": "工作结束时间",
  "onboarding.onTheseDays": "生效星期",
  "onboarding.onTheseDaysTip":
    "关闭您不工作的日子（例如周末），Entracte 将在这些日子保持静音。您之后可以在“计划”中进行精细调整。",
  "onboarding.hintsTitle": "健康提示",
  "onboarding.hintsBody":
    "每次休息都可以显示一条建议 —— 一次拉伸、一次深呼吸、或短暂离开书桌。长休息建议分为两种类型。",
  "onboarding.hintsCheckbox": "休息期间显示健康提示",
  "onboarding.longSuggestions": "长休息建议偏好",
  "onboarding.longSuggestionsTip":
    "独处：独自进行的活动（拉伸、呼吸新鲜空气、点心）。社交：与他人一起进行的活动（打电话、一同散步）。独自工作？选择“仅独处”即可去除社交类提示。",
  "onboarding.longOptionBoth": "兼顾独处与社交",
  "onboarding.longOptionSolo": "仅独处 —— 我独自工作",
  "onboarding.longOptionSocial": "仅社交",
  "onboarding.winddownTitle": "放松收尾与专注",
  "onboarding.winddownBody":
    "就寝提醒会在傍晚工作临近结束时温和提醒您下线休息。严格模式会移除跳过和推迟按钮以确保休息必定执行 —— 如果您习惯性取消休息，这将非常有用。",
  "onboarding.winddownCheckbox": "睡前提醒我放松收尾",
  "onboarding.winddownStarts": "收尾开始时间",
  "onboarding.winddownEnds": "收尾结束时间",
  "onboarding.strictCheckbox": "严格模式（休息不可跳过或推迟）",
  "onboarding.strictTip":
    "禁用休息界面上的所有退出途径。您随时可以在“休息”标签页中关闭此模式。",
  "onboarding.doneTitle": "一切准备就绪",
  "onboarding.doneBody":
    "基础设置已全部完成。您刚才选择的所有内容 —— 以及休息间隔、音效、休息界面外观、情景模式等更多功能 —— 都可在“设置”中随时细致调整。",

  // quiet-tab
  "quiet.autoPause": "自动暂停",
  "quiet.autoPauseDesc": "满足以下条件时，休息将被拦截。",
  "quiet.dnd": "勿扰模式开启时",
  "quiet.dndTipSupported":
    "读取操作系统级的勿扰/专注状态（支持 macOS、Windows 以及 Linux 上的 GNOME/KDE）。开启时，已计划的休息将被拦截，直到勿扰模式关闭。",
  "quiet.dndTipFallback":
    "在支持的环境下读取操作系统级的勿扰/专注状态。开启时，已计划的休息将被拦截，直到勿扰模式关闭。",
  "quiet.camera": "摄像头正在使用时",
  "quiet.cameraTip":
    "当其他应用程序正在使用摄像头时拦截休息 —— 确保视频会议不被打扰。",
  "quiet.fullscreenVideo": "正在播放全屏视频时",
  "quiet.fullscreenVideoTipReliable":
    "检测到全屏视频播放时拦截休息。通过确认真实的全屏窗口，避免小窗口后台视频阻碍休息。",
  "quiet.fullscreenVideoTipUnreliable":
    "检测到全屏视频播放时拦截休息。在 Wayland 环境下无法可靠确认全屏窗口，因此检测可能不精确：将回退至检测阻止屏幕休眠的媒体播放，这可能会因小窗口后台视频而拦截休息。",
  "quiet.duringBreaks": "休息期间",
  "quiet.pauseMedia": "显示休息时暂停媒体播放",
  "quiet.pauseMediaTipGranular":
    "休息开始时暂停正在播放的媒体（视频或音频），休息结束时恢复播放。精确控制媒体播放器。",
  "quiet.pauseMediaTipFallback":
    "休息开始时暂停正在播放的内容，休息结束时恢复播放。通过尽可能模拟发送播放/暂停媒体键来实现，因此可能不够精准：可能无法准确命中目标播放器，且不会恢复非本程序暂停的内容。",
  "quiet.appPause": "针对特定应用暂停",
  "quiet.appPauseCheckbox": "当以下任一应用运行时暂停休息",
  "quiet.appPauseTip":
    "不区分大小写匹配应用名称片段。只要列表中任一应用处于运行状态，休息即被拦截。",
  "quiet.appPausePlaceholder":
    "每行一个应用名称 —— 支持部分名称、不区分大小写（例如 zoom, obs, keynote）",
  "quiet.quickAdd": "快速添加",
  "quiet.manualPause": "手动暂停",
  "quiet.resume": "恢复",
  "quiet.pausedRemaining": "已暂停 —— 剩余 {remaining}",
  "quiet.pausedIndefinitely": "已无限期暂停",
  "quiet.manualPauseDesc":
    "从菜单栏图标快速暂停指定时长，或在下方设置暂停直到特定日期时间 —— 在休假期间使用电脑而不工作时非常方便。",
  "quiet.pauseUntil": "暂停直到",
  "quiet.pauseUntilThen": "暂停直到该时刻",

  // system-tab
  "system.startup": "启动",
  "system.autostart": "登录系统时启动 Entracte",
  "system.display": "显示",
  "system.timeFormat": "时间格式",
  "system.format24h": "24 小时制（14:30）",
  "system.format12h": "12 小时制（2:30 PM）",
  "system.notifications": "通知",
  "system.prebreakNotify": "休息开始前发送预先通知",
  "system.prebreakNotifyTip":
    "在休息界面出现前 N 秒发送系统通知预警，避免打断您正在进行的思绪。",
  "system.leadTimeSeconds": "提前预警时间（秒）",
  "system.hotkeys": "全局快捷键",
  "system.tray": "托盘倒计时",
  "system.trayCountdown": "在系统托盘图标旁显示下次休息倒计时",
  "system.trayCountdownTip":
    "在托盘图标旁显示距下次休息还有多少分钟。仅支持 macOS 和 Linux —— Windows 托盘不支持文字显示。",
  "system.trayIcon": "显示托盘图标",
  "system.trayIconTip":
    "关闭后菜单栏只保留倒计时数字。在没有数字可显示时图标会自动出现——已暂停、就寝提醒、正在休息——以保证菜单始终可点击。需先开启上方的倒计时：没有数字时，图标是菜单栏上唯一的内容。",
  "system.countdownTo": "倒计时目标",
  "system.plugins": "插件",
  "system.showAdvancedHooks": "显示高级设置（事件钩子）",
  "system.eventHooks": "事件钩子",
  "system.hooksWarning":
    "⚠ 钩子以您的完整用户权限在系统上执行 Shell 命令 —— 恶意命令可能读取或删除您的文件、通过网络传输数据或执行其他程序。请仅添加您自行编写或完全理解的命令。在正式依赖前，请使用“测试”按钮查看命令的具体执行效果。默认关闭；所作修改在点击“保存钩子”并通过确认弹窗后方可生效。命令直接通过 argv 执行（无内置 Shell 环境），因此管道、重定向和 $ENV 变量扩展需要显式包裹在 sh -c \"…\" 中。可用环境变量：$ENTRACTE_EVENT, $ENTRACTE_KIND, $ENTRACTE_DURATION_SECS, $ENTRACTE_OUTCOME。",
  "system.runShellCommands": "在休息事件发生时运行 Shell 命令",
  "system.addHook": "添加钩子",
  "system.waitingConfirmation": "等待确认…",
  "system.saveHooks": "保存钩子",
  "system.reset": "重置",

  // profiles-tab
  "profiles.title": "情景",
  "profiles.desc":
    "每个情景都保留其独立的休息节奏、健康提示和休息界面设置。切换即时生效。当前启用的情景将驱动此处的所有其他设置，并显示在托盘的“当前情景”菜单中。",
  "profiles.moveUpAria": "上移情景 {name}",
  "profiles.moveDownAria": "下移情景 {name}",
  "profiles.nameAria": "情景名称",
  "profiles.activeBadge": "当前启用",
  "profiles.useProfileAria": "启用情景 {name}",
  "profiles.useProfileTitle": "使用此情景",
  "profiles.renameAria": "重命名情景 {name}",
  "profiles.renameTitle": "重命名",
  "profiles.duplicateAria": "复制情景 {name}",
  "profiles.duplicateTitle": "复制",
  "profiles.copyOf": "{source} 副本",
  "profiles.confirmReset": "确认重置",
  "profiles.resetAria": "将情景 {name} 重置为默认值",
  "profiles.resetTitle": "重置为默认值",
  "profiles.confirmDelete": "确认删除",
  "profiles.deleteAria": "删除情景 {name}",
  "profiles.deleteTitle": "删除",
  "profiles.newPlaceholder": "新情景名称",
  "profiles.add": "添加",

  // about-tab
  "about.title": "关于",
  "about.checking": "正在检查…",
  "about.checkUpdates": "检查更新",
  "about.version": "版本 {version}",
  "about.tagline": "跨平台健康休息提醒助手。",
  "about.license": "基于 Apache 2.0 协议开源。",
  "about.autoCheckUpdates": "启动时自动检查更新",
  "about.updateAvailable": "发现新版本：{latest}（当前版本为 {current}）。",
  "about.downloadFor": "下载适用于 {label} 的版本",
  "about.allDownloads": "所有下载选项",
  "about.openReleasePage": "打开发布页面",
  "about.windowsUnsignedWarning":
    "Windows 安装程序尚未进行 Authenticode 签名，因此 SmartScreen 会弹出提示 —— 点击“更多信息”→“仍要运行”即可继续。",
  "about.latestVersion": "您当前已是最新版本（{current}）。",
  "about.checkFailed": "检查更新失败：{error}",
  "about.supporter": "支持者",
  "about.supporterUnlocked": "感谢您的支持！定制功能包已解锁。",
  "about.licenseKey": "许可证密钥：{key}",
  "about.removeLicense": "移除许可证",
  "about.supporterPitch":
    "Entracte 可免费使用。支持者可永久解锁定制功能包 —— 自定义休息界面颜色、轮换主题、自定义音效、自定义 CSS 以及可编辑的健康提示池。",
  "about.becomeSupporter": "成为支持者 →",
  "about.alreadyHaveLicense":
    "已有许可证？请在下方粘贴并点击“验证”。",
  "about.licensePlaceholder": "许可证密钥",
  "about.verifying": "正在验证…",
  "about.verify": "验证",
  "about.verifyWelcome": "欢迎 —— 定制功能包已解锁。",
  "about.verifyInactive": "验证已完成，但许可证尚未激活。请重试。",
  "about.verifyFailed": "无法验证：{error}",
  "about.licenseRemoved": "许可证已移除。",
  "about.removeFailed": "无法移除许可证：{error}",
  "about.author": "作者",
  "about.buyMeACoffee": "☕ 请我喝杯咖啡",
  "about.authorName": "由 Dr. Athanasia M. Mowinckel 开发",
  "about.authorBio":
    "资深研发工程师与研究员，致力于开发可复现科研与开发者健康工具。",
  "about.companionApp": "配套应用",
  "about.cairnPitch":
    "也需要追踪工作时间？Cairn 是 Entracte 的同门应用 —— 本地优先的时间记录工具，静默感知您的工作内容。",
  "about.tryCairn": "尝试 Cairn →",
  "about.diagnostics": "诊断信息",
  "about.copyDiagnosticsReport": "复制诊断报告",
  "about.reportCopied": "报告已复制到剪贴板",
  "about.copyFailed": "复制到剪贴板失败",
  "about.couldNotBuildReport": "无法生成诊断报告",
  "about.diagnosticsHint":
    "在 {link} 提交 Issue 时，请点击“复制诊断报告” —— 报告包含应用版本、设置以及最近 50 KB 的运行日志。",

  // settings shell
  "infoTip.more": "更多信息",
  "infoTip.warning": "警告",

  "settings.skipToContent": "跳转到设置内容",
  "settings.sectionsAria": "设置导航",
  "settings.loading": "正在加载…",

  // advanced component
  "advanced.default": "高级设置",

  // content-packs component
  "contentPacks.filter": "Entracte 内容包",
  "contentPacks.defaultName": "Entracte 内容包 ({today})",
  "contentPacks.exportedTo": "已导出至 {path}",
  "contentPacks.exportFailed": "导出失败：{error}",
  "contentPacks.importedSuccess": "成功导入 {ideas} 和 {routines}。",
  "contentPacks.importFailed": "导入失败：{error}",
  "contentPacks.desc":
    "将您的健康提示与引导流程导出为本地文件进行分享或备份。",
  "contentPacks.tip":
    "内容包是普通的 JSON 文件。导入会将其包含的提示与引导流程合并到您的提示池中，不会删除已有内容；完全重复的项目将被自动跳过。",
  "contentPacks.importBtn": "导入内容包…",
  "contentPacks.exportBtn": "导出内容包…",

  // hook-row component
  "hooks.testSuccess": "✓ 退出码 0",
  "hooks.testFail": "退出，错误码 {code}",
  "hooks.noOutput": "无输出内容。",
  "hooks.eventAria": "钩子触发事件",
  "hooks.commandAria": "钩子执行命令",
  "hooks.commandPlaceholder":
    '例如 sh -c "osascript -e \'tell app \\"Music\\" to pause\'"',
  "hooks.on": "触发时机",
  "hooks.testing": "正在测试…",
  "hooks.test": "测试",
  "hooks.remove": "删除",
  "hooks.insertTemplateAria": "插入模板",
  "hooks.insertTemplate": "插入模板…",

  // hook-templates
  "hookTemplate.log-to-file": "将休息事件记录到日志文件",
  "hookTemplate.pause-music-macos": "暂停音乐 — macOS (Music app)",
  "hookTemplate.resume-music-macos": "恢复音乐 — macOS (Music app)",
  "hookTemplate.notify-linux": "桌面通知 — Linux (notify-send)",
  "hookTemplate.slack-status": "设置 Slack 状态（需填入您的 Token）",
  "hookTemplate.home-assistant-scene":
    "Home Assistant 场景（需填入您的主机和 Token）",

  // hotkeys
  "hotkeyAction.pause": "暂停休息",
  "hotkeyAction.pause_15m": "暂停 15 分钟",
  "hotkeyAction.pause_30m": "暂停 30 分钟",
  "hotkeyAction.pause_60m": "暂停 60 分钟",
  "hotkeyAction.resume": "恢复休息",
  "hotkeyAction.trigger_micro": "立即进行短休息",
  "hotkeyAction.trigger_long": "立即进行长休息",
  "hotkeyAction.skip_micro": "跳过下次短休息",
  "hotkeyAction.skip_long": "跳过下次长休息",
  "hotkeyAction.cycle_profile": "切换至下一个情景",
  "hotkeys.enable": "启用全局快捷键",
  "hotkeys.enableTip":
    "为下列操作注册操作系统级快捷键。无论当前窗口是否处于焦点状态均可触发。格式示例：CmdOrCtrl+Alt+P。",
  "hotkeys.invalidSyntax":
    "无法识别的快捷键。请使用一个或多个修饰键（CmdOrCtrl, Alt, Shift）加上一个按键，例如 CmdOrCtrl+Alt+P。",
  "hotkeys.conflict": "此快捷键已被其他操作占用。请为每个操作设置唯一的组合键。",
  "hotkeys.placeholder": "例如 CmdOrCtrl+Alt+P",
  "hotkeys.clearAria": "清除 {label} 的快捷键",
  "hotkeys.clear": "清除",

  // shared counts
  "common.countHints": "{n} 条健康提示",
  "common.countRoutines": "{n} 个引导流程",
  "common.countImages": "，含 {n} 张图片",

  // plugins component
  "plugins.filter": "Entracte 插件",
  "plugins.listError": "无法获取插件列表：{error}",
  "plugins.installedContent":
    '已安装“{name}” —— 添加了 {hints} 和 {routines}{images}。',
  "plugins.installedGeneric": '已安装“{name}”。',
  "plugins.installFailed": "安装失败：{error}",
  "plugins.removed": '已卸载“{name}”。',
  "plugins.uninstallFailed": "卸载失败：{error}",
  "plugins.desc": "安装本地插件文件，添加来自社区的健康提示与引导流程。",
  "plugins.tip":
    "插件是您自行选择的本地文件 —— 无需应用商店、无需账号、无需网络连接。安装时会弹出确认对话框显示插件名称、作者及签名密钥。卸载时会精确移除其添加的所有内容。",
  "plugins.warning": "⚠ 请仅安装来自可信来源的插件文件。",
  "plugins.working": "正在处理…",
  "plugins.installBtn": "安装插件…",
  "plugins.uninstallAria": "卸载 {name}",
  "plugins.uninstall": "卸载",
  "plugins.noPlugins": "未安装任何插件。",
  "plugins.rowCounts": "{hints} 条健康提示，{routines} 个引导流程",

  // postpone-donut component
  "postponeDonut.taken": "最终完成",
  "postponeDonut.dismissed": "随后跳过",
  "postponeDonut.skipped": "另行跳过",
  "postponeDonut.unresolved": "仍在等待",
  "postponeDonut.ariaLabel":
    "推迟跟进情况：{taken} 次已完成，{dismissed} 次随后跳过，{skipped} 次另行跳过，{unresolved} 次待处理",
  "postponeDonut.caption": "次推迟",

  // routine-picker component
  "routine.category.eyes": "眼部",
  "routine.category.mobility": "活动",
  "routine.category.breathing": "呼吸",
  "routine.category.desk_yoga": "桌面瑜伽",
  "routine.difficulty.gentle": "温和",
  "routine.difficulty.moderate": "适度",
  "routine.difficulty.active": "充分活动",
  "routine.guidedRoutine": "引导流程",
  "routine.guidedRoutineTip":
    "在休息期间按步骤循序渐进的动作指导，而非单一的静态提示。“随机”会在每次休息时从下方过滤条件中抽取一套新流程；“无”则保留上方的轮换提示。",
  "routine.modeNone": "无（轮换提示）",
  "routine.modeRandom": "随机（按过滤条件）",
  "routine.categories": "分类",
  "routine.categoriesTip":
    "仅从勾选的分类中抽取流程。全部不勾选则从所有分类中抽取。",
  "routine.maxDifficulty": "最高难度",
  "routine.maxDifficultyTip":
    "包含此难度及以下的流程 —— “温和”仅包含最轻量的动作，“充分活动”包含所有流程。",

  // rows component
  "rows.platformOnly": "（仅支持 {platforms}）",

  // settings-search component
  "search.inputPlaceholder": "搜索设置…",
  "search.inputAria": "搜索设置",
  "search.empty": "未找到匹配的设置项",

  // sound-controls component
  "soundControls.filterAudio": "音频",
  "soundControls.sound": "音效",
  "soundControls.soundTip":
    "休息结束提示音在休息完成时播放一次。氛围音在休息期间循环播放，休息结束时停止。",
  "soundControls.track": "音轨",
  "soundControls.customFile": "自定义文件…",
  "soundControls.noFileSelected": "未选择文件",
  "soundControls.replace": "替换…",
  "soundControls.chooseFile": "选择文件…",
  "soundControls.useBundled": "使用内置音效",

  // suppression-bars component
  "suppressionBars.tableAria": "按原因及休息类型统计的拦截次数",
  "suppressionBars.trackAria": "{label}：共拦截 {total} 次",
  "suppressionBars.segTitle": "{kind} — {label}：{count} 次",
  "suppressionBars.kindMicro": "短休息",
  "suppressionBars.kindLong": "长休息",
  "suppressionBars.kindSleep": "就寝提醒",

  // tray-countdown
  "trayCountdown.next": "下次休息（最近）",
  "trayCountdown.short": "下次短休息",
  "trayCountdown.long": "下次长休息",

  // weekdays
  "weekdays.mon.abbr": "周一",
  "weekdays.mon.name": "星期一",
  "weekdays.tue.abbr": "周二",
  "weekdays.tue.name": "星期二",
  "weekdays.wed.abbr": "周三",
  "weekdays.wed.name": "星期三",
  "weekdays.thu.abbr": "周四",
  "weekdays.thu.name": "星期四",
  "weekdays.fri.abbr": "周五",
  "weekdays.fri.name": "星期五",
  "weekdays.sat.abbr": "周六",
  "weekdays.sat.name": "星期六",
  "weekdays.sun.abbr": "周日",
  "weekdays.sun.name": "星期日",
  "weekdayToggle.groupAria": "活动时段生效的星期",

  // windowed-size-row component
  "windowedSize.sameAsGlobal": "与全局相同",
  "windowedSize.custom": "自定义",
  "windowedSize.customSize": "自定义尺寸",

  // window-kind
  "windowTitle.overlay": "Entracte — 休息",
  "windowTitle.pause": "Entracte — 暂停",
  "windowTitle.quick": "Entracte — 快速面板",
  "windowTitle.settings": "Entracte — 设置",

  // app areas
  "app.areaOverlay": "休息界面",
  "app.areaPause": "暂停选择器",
  "app.areaQuick": "快速面板",
  "app.areaSettings": "设置",

  // error-boundary
  "error.areaHitError": "{area}发生错误",
  "error.somethingWentWrong": "出现了一些问题",
  "error.recoveryHint": "窗口通常可以自行恢复。如果无法恢复，请重新加载。",
  "error.technicalDetails": "技术详情",
  "error.tryAgain": "重试",
  "error.reload": "重新加载",

  // pause-picker
  "pausePicker.dayAria": "日",
  "pausePicker.monthAria": "月",
  "pausePicker.yearAria": "年",
  "pausePicker.title": "暂停直到",
  "pausePicker.hint":
    "在选定的日期和时间之前拦截所有休息，按您所在地区的格式显示。",
  "pausePicker.presets": "快捷暂停选项",
  "pausePicker.pause2h": "2 小时",
  "pausePicker.pause4h": "4 小时",
  "pausePicker.tomorrowMorning": "明早 6 点",
  "pausePicker.time": "时间",
  "pausePicker.cancel": "取消",
  "pausePicker.pause": "暂停",

  // a11y helpers
  "a11y.dialogLabel.sleep": "Entracte，就寝提醒",
  "a11y.dialogLabel.long": "Entracte，长休息",
  "a11y.dialogLabel.micro": "Entracte，短休息",
  "a11y.durationMinutesSeconds": "{minutes} 分钟 {seconds} 秒",
  "a11y.durationMinutes": "{minutes} 分钟",
  "a11y.durationSeconds": "{seconds} 秒",
  "a11y.announceBreak": "{label}。您有 {duration} 时间。",
  "a11y.youHave": "您有 {duration} 时间。",
  "a11y.timesUp": "时间到",
  "a11y.remainingMinutesSeconds": "剩余 {minutes} 分钟 {seconds} 秒",
  "a11y.remainingMinutes": "剩余 {minutes} 分钟",
  "a11y.remainingSeconds": "剩余 {seconds} 秒",
  "a11y.milestoneHalfway": "您的{noun}已过半。",
  "a11y.milestoneOneMinute": "还剩大约一分钟。",
  "a11y.milestoneTenSeconds": "即将结束。",
  "a11y.milestoneBedtimeComplete": "就寝提醒结束。",
  "a11y.milestoneBreakComplete": "休息结束。",
  "a11y.nounBedtime": "就寝提醒",
  "a11y.nounBreak": "休息",

  // chore-prompt
  "chorePrompt.withMinutes": "您有约 {mins} 分钟 —— 完成这项杂事：{chore}",
  "chorePrompt.quick": "快速完成 —— 这项杂事：{chore}",

  // postpone
  "postpone.withCount": "推迟（第 {count} 次，共 {max} 次）",
  "postpone.simple": "推迟",

  // skip-hint
  "overlay.enforceableLongBreakHint":
    "长休息已设为不可跳过 —— 可在“设置 → 计划”中更改。",

  // breath
  "breath.phase.inhale": "吸气",
  "breath.phase.hold": "保持",
  "breath.phase.exhale": "呼气",
  "breath.phase.hold_out": "屏息",
  "breath.phase.rest": "放松",
  "breath.phaseLabel": "{phase} · {seconds} 秒",
  "breath.phaseAria": "{phase}，{seconds} 秒",

  // overlay
  "overlay.kind.sleep": "就寝提醒",
  "overlay.kind.long": "长休息",
  "overlay.kind.micro": "短休息",
  "overlay.done": "完成",
  "overlay.timerSeconds": "{seconds} 秒",
  "overlay.stepSeconds": " · {seconds} 秒",
  "overlay.stepProgressAria": "第 {curr} 步，共 {total} 步：{text}",
  "overlay.stepProgress": "第 {curr} 步，共 {total} 步",
  "overlay.choreAria": "本次休息杂事：{chore}",
  "overlay.wellnessTipAria": "健康提示：{hint}",
  "overlay.typingPaused": "已暂停 —— 停止打字后将恢复休息倒计时",
  "overlay.imBack": "我回来了",
  "overlay.endBreakAria": "结束休息",
  "overlay.postponeBreakAria": "推迟休息",
  "overlay.skip": "跳过",
  "overlay.skipBreakAria": "跳过休息",
  "overlay.postponeExhausted": "推迟次数已用尽 —— 请进行本次休息",
};
