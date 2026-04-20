import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { darkTheme } from '../theme/darkTheme';
import { lightTheme } from '../theme/lightTheme';
import { formMessagesEn, formMessagesZh } from '../i18n/formMessages';
import type { LocaleCode } from '../i18n';
import { translate } from '../i18n';

export type ThemeMode = 'dark' | 'light';

const STORAGE_THEME = 'app-theme';
const STORAGE_LOCALE = 'app-locale';

function readTheme(): ThemeMode {
  const v = localStorage.getItem(STORAGE_THEME);
  return v === 'light' || v === 'dark' ? v : 'dark';
}

function readLocale(): LocaleCode {
  const v = localStorage.getItem(STORAGE_LOCALE);
  return v === 'en-US' || v === 'zh-CN' ? v : 'zh-CN';
}

type PreferencesContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readTheme);
  const [locale, setLocaleState] = useState<LocaleCode>(readLocale);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    localStorage.setItem(STORAGE_THEME, m);
    document.documentElement.setAttribute('data-theme', m);
  }, []);

  const setLocale = useCallback((l: LocaleCode) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_LOCALE, l);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const antdTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  const antdLocale = locale === 'zh-CN' ? zhCN : enUS;
  const formValidateMessages = locale === 'zh-CN' ? formMessagesZh : formMessagesEn;

  const value = useMemo(
    () => ({ themeMode, setThemeMode, locale, setLocale, t }),
    [themeMode, setThemeMode, locale, setLocale, t]
  );

  return (
    <PreferencesContext.Provider value={value}>
      <ConfigProvider locale={antdLocale} theme={antdTheme} form={{ validateMessages: formValidateMessages }}>
        {children}
      </ConfigProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
