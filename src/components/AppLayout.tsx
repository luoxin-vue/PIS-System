import { useMemo } from 'react';
import { Layout, Menu, Button, Typography, theme } from 'antd';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  DashboardOutlined,
  InboxOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { ThemeLocaleControls } from './ThemeLocaleControls';

const linkStyle = { color: 'inherit' as const };

export default function AppLayout() {
  const { token } = theme.useToken();
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, t } = usePreferences();

  const menuItems = useMemo(
    () => [
      { key: '/', icon: <DashboardOutlined />, label: <Link to="/" style={linkStyle}>{t('menu.dashboard')}</Link> },
      { key: '/products', icon: <InboxOutlined />, label: <Link to="/products" style={linkStyle}>{t('menu.products')}</Link> },
      { key: '/suppliers', icon: <ShopOutlined />, label: <Link to="/suppliers" style={linkStyle}>{t('menu.suppliers')}</Link> },
      {
        key: '/purchases',
        icon: <ShoppingCartOutlined />,
        label: <Link to="/purchases" style={linkStyle}>{t('menu.purchases')}</Link>,
      },
      { key: '/sales', icon: <DollarOutlined />, label: <Link to="/sales" style={linkStyle}>{t('menu.sales')}</Link> },
      { key: '/inventory', icon: <DatabaseOutlined />, label: <Link to="/inventory" style={linkStyle}>{t('menu.inventory')}</Link> },
      { key: '/reports', icon: <BarChartOutlined />, label: <Link to="/reports" style={linkStyle}>{t('menu.reports')}</Link> },
    ],
    [t]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        width={228}
        breakpoint="lg"
        collapsedWidth={64}
        style={{
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: themeMode === 'dark' ? '4px 0 24px rgba(0, 0, 0, 0.2)' : '4px 0 16px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text strong style={{ color: token.colorText, fontSize: 15, letterSpacing: 0.5 }}>
            {t('layout.brand')}
          </Typography.Text>
        </div>
        <Menu
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderInlineEnd: 'none' }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
          }}
        >
          <Typography.Text strong style={{ fontSize: 15, color: token.colorText }}>
            {t('layout.title')}
          </Typography.Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ThemeLocaleControls />
            <Typography.Text type="secondary">{username}</Typography.Text>
            <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('layout.logout')}
            </Button>
          </div>
        </Layout.Header>
        <Layout.Content style={{ padding: 20, minHeight: 280 }} className="app-main-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
