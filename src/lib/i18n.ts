import { en } from "./i18n/en";
import { zhCN } from "./i18n/zh-CN";

export type Locale = "en" | "zh-CN";

let currentLocale: Locale = "en";

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = currentLocale === "zh-CN" ? zhCN : en;
  let text = dict[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}
