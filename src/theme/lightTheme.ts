import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

/** 浅色主题：与深色共用主色，干净商务风 */
export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#0284c7',
    colorBgBase: '#f8fafc',
    colorBgLayout: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.55)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.38)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.24)',
    colorTextLightSolid: '#ffffff',
    colorIcon: '#64748b',
    colorIconHover: '#475569',
    borderRadius: 8,
    fontFamily: `"DM Sans", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif`,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 56,
      headerPadding: '0 20px',
      bodyBg: '#f8fafc',
      siderBg: '#ffffff',
      triggerBg: '#f1f5f9',
      triggerColor: '#64748b',
    },
    Menu: {
      itemColor: 'rgba(0, 0, 0, 0.65)',
      itemSelectedColor: '#4f46e5',
      itemHoverBg: 'rgba(99, 102, 241, 0.08)',
      itemSelectedBg: 'rgba(99, 102, 241, 0.12)',
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.2)',
      darkItemHoverBg: 'rgba(0, 0, 0, 0.04)',
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e2e8f0',
    },
    Table: {
      colorBgContainer: 'transparent',
      headerBg: '#f8fafc',
      rowHoverBg: 'rgba(99, 102, 241, 0.04)',
    },
    Modal: {
      contentBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Input: {
      activeBorderColor: '#6366f1',
      hoverBorderColor: '#818cf8',
      colorBgContainer: '#ffffff',
      hoverBg: '#ffffff',
      activeBg: '#ffffff',
      addonBg: '#f8fafc',
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    },
    Tabs: {
      itemSelectedColor: '#4f46e5',
      inkBarColor: '#6366f1',
    },
  },
};
