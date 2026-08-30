import { t } from "../../lib/i18n";
import { en } from "../../lib/i18n/en";
import type { Tab } from "./types";

/** Fold the English label into keywords so searches like "bedtime" still
 * hit after `setLocale("zh-CN")` replaces `entry.label`. */
function kw(enKey: string, extra: string): string {
  return `${en[enKey] ?? ""} ${extra}`;
}

/** One searchable destination in the Settings window. `anchorId` must match
 * the `id` on a section heading inside the tab named by `tabId`, so the
 * navigator can switch to the tab and scroll the section into view. */
export type SettingsSearchEntry = {
  id: string;
  label: string;
  tabId: Tab;
  anchorId: string;
  /** Extra terms (synonyms, control names) folded into the match. */
  keywords: string;
};

/** Static map of every section a user might search for. Metadata only — the
 * controls themselves are rendered by their tab, not from this list. */
export const SETTINGS_INDEX: SettingsSearchEntry[] = [
  // Schedule
  {
    id: "active-hours",
    get label() {
      return t("search.activeHours");
    },
    tabId: "schedule",
    anchorId: "settings-active-hours",
    keywords: kw(
      "search.activeHours",
      "work window weekdays days start end time range when 活动时段 工作时段 工作日 开始 结束 时间",
    ),
  },
  {
    id: "micro-breaks",
    get label() {
      return t("search.microBreaks");
    },
    tabId: "schedule",
    anchorId: "settings-micro-breaks",
    keywords: kw(
      "search.microBreaks",
      "interval fixed times duration enable cadence frequency idle 短休息 间隔 时长 启用 空闲",
    ),
  },
  {
    id: "long-breaks",
    get label() {
      return t("search.longBreaks");
    },
    tabId: "schedule",
    anchorId: "settings-long-breaks",
    keywords: kw(
      "search.longBreaks",
      "interval fixed times duration enable cadence frequency idle 长休息 间隔 时长 启用 空闲",
    ),
  },
  {
    id: "bedtime",
    get label() {
      return t("search.bedtime");
    },
    tabId: "schedule",
    anchorId: "settings-bedtime",
    keywords: kw(
      "search.bedtime",
      "sleep night wind down reminder window 就寝提醒 夜间 收尾 窗口",
    ),
  },
  {
    id: "screen-time",
    get label() {
      return t("search.screenTime");
    },
    tabId: "schedule",
    anchorId: "settings-screen-time",
    keywords: kw(
      "search.screenTime",
      "budget limit usage time at keyboard wrap up 屏幕时间 限额 使用时长 放松收尾",
    ),
  },
  // Breaks
  {
    id: "delivery",
    get label() {
      return t("search.delivery");
    },
    tabId: "breaks",
    anchorId: "settings-delivery",
    keywords: kw(
      "search.delivery",
      "overlay windowed notification fullscreen test how appears 全屏遮罩 窗口模式 仅系统通知 测试 呈现",
    ),
  },
  {
    id: "overlay",
    get label() {
      return t("search.overlay");
    },
    tabId: "breaks",
    anchorId: "settings-overlay",
    keywords: kw(
      "search.overlay",
      "transparency opacity theme colour color text size high contrast monitor vignette 透明度 主题 字号 高对比度 显示器 暗角",
    ),
  },
  {
    id: "sound",
    get label() {
      return t("search.sound");
    },
    tabId: "breaks",
    anchorId: "settings-sound",
    keywords: kw(
      "search.sound",
      "volume chime ambient track audio custom file 音量 提示音 氛围音 音效",
    ),
  },
  {
    id: "skip-postpone",
    get label() {
      return t("search.skipPostpone");
    },
    tabId: "breaks",
    anchorId: "settings-skip-postpone",
    keywords: kw(
      "search.skipPostpone",
      "strict mode escalation enforce manual finish cannot be dismissed snooze 严格模式 跳过 推迟 无法关闭",
    ),
  },
  {
    id: "break-ideas",
    get label() {
      return t("search.breakIdeas");
    },
    tabId: "breaks",
    anchorId: "settings-break-ideas",
    keywords: kw(
      "search.breakIdeas",
      "hints routines mix physical psychological solo social guided 健康提示 引导流程 身体 心理 独处 社交",
    ),
  },
  {
    id: "chores",
    get label() {
      return t("search.chores");
    },
    tabId: "breaks",
    anchorId: "settings-chores",
    keywords: kw(
      "search.chores",
      "tasks post-it morning prompt to do list 杂事 待办 提醒 晨间 列表",
    ),
  },
  {
    id: "content-packs",
    get label() {
      return t("search.contentPacks");
    },
    tabId: "breaks",
    anchorId: "settings-content-packs",
    keywords: kw(
      "search.contentPacks",
      "import export share routines hints json 内容包 导入 导出 分享 健康提示 引导流程",
    ),
  },
  {
    id: "custom-css",
    get label() {
      return t("search.customCss");
    },
    tabId: "breaks",
    anchorId: "settings-custom-css",
    keywords: kw(
      "search.customCss",
      "stylesheet style supporter overlay appearance 样式 自定义 外观 全屏遮罩",
    ),
  },
  // Pausing
  {
    id: "auto-pause",
    get label() {
      return t("search.autoPause");
    },
    tabId: "quiet",
    anchorId: "settings-auto-pause",
    keywords: kw(
      "search.autoPause",
      "do not disturb dnd focus camera webcam fullscreen video suppress 勿扰 摄像头 全屏 视频 拦截",
    ),
  },
  {
    id: "during-breaks",
    get label() {
      return t("search.duringBreaks");
    },
    tabId: "quiet",
    anchorId: "settings-during-breaks",
    keywords: kw(
      "search.duringBreaks",
      "music spotify video play pause media 音乐 视频 播放 暂停",
    ),
  },
  {
    id: "app-pause",
    get label() {
      return t("search.appPause");
    },
    tabId: "quiet",
    anchorId: "settings-app-pause",
    keywords: kw(
      "search.appPause",
      "zoom obs keynote running application suppress 应用 运行 拦截 暂停",
    ),
  },
  {
    id: "manual-pause",
    get label() {
      return t("search.manualPause");
    },
    tabId: "quiet",
    anchorId: "settings-manual-pause",
    keywords: kw(
      "search.manualPause",
      "pause until resume holiday snooze 暂停 恢复 直到 假期",
    ),
  },
  // System
  {
    id: "startup",
    get label() {
      return t("search.startup");
    },
    tabId: "system",
    anchorId: "settings-startup",
    keywords: kw("search.startup", "autostart boot launch 开机 启动 登录"),
  },
  {
    id: "display",
    get label() {
      return t("search.display");
    },
    tabId: "system",
    anchorId: "settings-display",
    keywords: kw("search.display", "clock 12 24 hour am pm 时钟 小时 时间格式"),
  },
  {
    id: "notifications",
    get label() {
      return t("search.notifications");
    },
    tabId: "system",
    anchorId: "settings-notifications",
    keywords: kw(
      "search.notifications",
      "pre-break heads up lead time warning 通知 提前提醒 即将开始",
    ),
  },
  {
    id: "hotkeys",
    get label() {
      return t("search.hotkeys");
    },
    tabId: "system",
    anchorId: "settings-hotkeys",
    keywords: kw(
      "search.hotkeys",
      "keyboard shortcuts accelerator pause resume trigger 快捷键 键盘 暂停 恢复",
    ),
  },
  {
    id: "tray",
    get label() {
      return t("search.tray");
    },
    tabId: "system",
    anchorId: "settings-tray",
    keywords: kw(
      "search.tray",
      "menu bar icon timer countdown next break 菜单栏 托盘 倒计时 图标",
    ),
  },
  {
    id: "plugins",
    get label() {
      return t("search.plugins");
    },
    tabId: "system",
    anchorId: "settings-plugins",
    keywords: kw(
      "search.plugins",
      "extensions install content detector export 插件 安装 内容包 检测器 导出",
    ),
  },
  {
    id: "hooks",
    get label() {
      return t("search.hooks");
    },
    tabId: "system",
    anchorId: "settings-hooks",
    keywords: kw(
      "search.hooks",
      "shell command script break start end advanced automation 钩子 命令 脚本 休息",
    ),
  },
  // Insights
  {
    id: "insights",
    get label() {
      return t("search.insights");
    },
    tabId: "insights",
    anchorId: "settings-insights",
    keywords: kw(
      "search.insights",
      "stats history breaks taken skipped dismissed heatmap session 统计 历史 跳过 拦截 热力图",
    ),
  },
  {
    id: "manage-data",
    get label() {
      return t("search.manageData");
    },
    tabId: "insights",
    anchorId: "settings-manage-data",
    keywords: kw(
      "search.manageData",
      "export csv backup import clear history reset 导出 备份 导入 清空 历史",
    ),
  },
  // Profiles
  {
    id: "profiles",
    get label() {
      return t("search.profiles");
    },
    tabId: "profiles",
    anchorId: "settings-profiles",
    keywords: kw(
      "search.profiles",
      "switch duplicate rename reset preset 情景 切换 复制 重命名 重置",
    ),
  },
  // About
  {
    id: "about",
    get label() {
      return t("search.about");
    },
    tabId: "about",
    anchorId: "settings-about",
    keywords: kw("search.about", "version update check release 版本 更新 检查 发布"),
  },
  {
    id: "supporter",
    get label() {
      return t("search.supporter");
    },
    tabId: "about",
    anchorId: "settings-supporter",
    keywords: kw(
      "search.supporter",
      "license key unlock customisation pack donate 支持者 许可证 解锁 捐赠",
    ),
  },
  {
    id: "diagnostics",
    get label() {
      return t("search.diagnostics");
    },
    tabId: "about",
    anchorId: "settings-diagnostics",
    keywords: kw("search.diagnostics", "report logs bug issue copy 诊断 日志 问题 复制"),
  },
];

const MAX_RESULTS = 8;

/** Case-insensitive AND-match over each entry's label + keywords. Returns at
 * most {@link MAX_RESULTS} entries, in index order. */
export function filterSettingsIndex(query: string): SettingsSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return SETTINGS_INDEX.filter((entry) => {
    const haystack = `${entry.label} ${entry.keywords}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, MAX_RESULTS);
}
