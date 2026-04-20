import { useMemo, type CSSProperties } from 'react';
import { Button, Dropdown, theme } from 'antd';
import type { MenuProps } from 'antd';
import { MoonOutlined, SunOutlined, DownOutlined } from '@ant-design/icons';
import { usePreferences, type ThemeMode } from '../context/PreferencesContext';
import type { LocaleCode } from '../i18n';
import { LangFlagIcon } from './LangFlagIcon';

/**
 * 主题 / 语言下拉（矢量月亮太阳 + SVG 国旗），顶栏与登录页共用
 */
export function ThemeLocaleControls() {
  const { token } = theme.useToken();
  const { themeMode, setThemeMode, locale, setLocale, t } = usePreferences();

  const themeMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dark', icon: <MoonOutlined />, label: t('layout.themeDark') },
      { key: 'light', icon: <SunOutlined />, label: t('layout.themeLight') },
    ],
    [t]
  );

  const localeMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'zh-CN', icon: <LangFlagIcon locale="zh-CN" width={22} />, label: '中文' },
      { key: 'en-US', icon: <LangFlagIcon locale="en-US" width={22} />, label: 'English' },
    ],
    []
  );

  const themeMenu: MenuProps = {
    selectable: true,
    selectedKeys: [themeMode],
    items: themeMenuItems,
    onClick: ({ key }) => setThemeMode(key as ThemeMode),
  };

  const localeMenu: MenuProps = {
    selectable: true,
    selectedKeys: [locale],
    items: localeMenuItems,
    onClick: ({ key }) => setLocale(key as LocaleCode),
  };

  const btnStyle: CSSProperties = {
    color: token.colorText,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <>
      <Dropdown menu={themeMenu} trigger={['click']} placement="bottomRight">
        <Button type="text" size="small" style={btnStyle}>
          {themeMode === 'dark' ? <MoonOutlined /> : <SunOutlined />}
          <span>{themeMode === 'dark' ? t('layout.themeDark') : t('layout.themeLight')}</span>
          <DownOutlined style={{ fontSize: 10, opacity: 0.65 }} />
        </Button>
      </Dropdown>
      <Dropdown menu={localeMenu} trigger={['click']} placement="bottomRight">
        <Button type="text" size="small" style={btnStyle}>
          <LangFlagIcon locale={locale} width={22} />
          <span>{locale === 'zh-CN' ? '中文' : 'English'}</span>
          <DownOutlined style={{ fontSize: 10, opacity: 0.65 }} />
        </Button>
      </Dropdown>
    </>
  );
}
