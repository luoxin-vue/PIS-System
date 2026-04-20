import { messagesZhCN } from './messages/zh-CN';
import { messagesEnUS } from './messages/en-US';

export type LocaleCode = 'zh-CN' | 'en-US';

/** 与 PreferencesContext 使用同一 key，供 API 层读取当前语言 */
export const LOCALE_STORAGE_KEY = 'app-locale';

export function getStoredLocale(): LocaleCode {
  if (typeof localStorage === 'undefined') return 'zh-CN';
  const v = localStorage.getItem(LOCALE_STORAGE_KEY);
  return v === 'en-US' || v === 'zh-CN' ? v : 'zh-CN';
}

const catalogs: Record<LocaleCode, Record<string, string>> = {
  'zh-CN': messagesZhCN,
  'en-US': messagesEnUS,
};

export function getMessages(locale: LocaleCode): Record<string, string> {
  return catalogs[locale] ?? catalogs['zh-CN'];
}

export function translate(locale: LocaleCode, key: string, vars?: Record<string, string | number>): string {
  let s = getMessages(locale)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      const re = new RegExp(`\\{${k}\\}`, 'g');
      s = s.replace(re, String(v));
    }
  }
  return s;
}
