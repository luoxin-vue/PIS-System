import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

/** 精致暗黑：冷灰底 + 靛蓝强调色，对比度足够 */
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#38bdf8',
    colorBgBase: '#0b0f14',
    colorBgLayout: '#0b0f14',
    colorBgContainer: '#141922',
    colorBgElevated: '#1a2230',
    colorBorder: '#2a3344',
    colorBorderSecondary: '#232b3a',
    colorText: 'rgba(255, 255, 255, 0.9)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.55)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.38)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.24)',
    colorTextLightSolid: '#ffffff',
    colorIcon: '#94a3b8',
    colorIconHover: '#e2e8f0',
    borderRadius: 8,
    fontFamily: `"DM Sans", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif`,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#141922',
      headerHeight: 56,
      headerPadding: '0 20px',
      bodyBg: '#0b0f14',
      siderBg: '#0f141c',
      triggerBg: '#1a2230',
      triggerColor: '#94a3b8',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.2)',
      darkSubMenuItemBg: '#0f141c',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      itemSelectedColor: '#c7d2fe',
      itemColor: 'rgba(255, 255, 255, 0.78)',
    },
    Card: {
      colorBgContainer: '#141922',
      colorBorderSecondary: '#2a3344',
    },
    Table: {
      colorBgContainer: 'transparent',
      headerBg: 'rgba(255, 255, 255, 0.04)',
      rowHoverBg: 'rgba(99, 102, 241, 0.07)',
    },
    Modal: {
      contentBg: '#141922',
      headerBg: '#141922',
    },
    Input: {
      activeBorderColor: '#818cf8',
      hoverBorderColor: '#6366f1',
      colorBgContainer: '#1a2230',
      hoverBg: '#1a2230',
      activeBg: '#1a2230',
      addonBg: '#1a2230',
    },
    Button: {
      primaryShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
    },
    Tabs: {
      itemSelectedColor: '#a5b4fc',
      inkBarColor: '#6366f1',
    },
  },
};
