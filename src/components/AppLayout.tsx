import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">首页</Link> },
  { key: '/products', icon: <InboxOutlined />, label: <Link to="/products">商品</Link> },
  { key: '/suppliers', icon: <ShopOutlined />, label: <Link to="/suppliers">供应商</Link> },
  { key: '/purchases', icon: <ShoppingCartOutlined />, label: <Link to="/purchases">采购入库</Link> },
  { key: '/sales', icon: <DollarOutlined />, label: <Link to="/sales">销售出库</Link> },
  { key: '/inventory', icon: <DatabaseOutlined />, label: <Link to="/inventory">库存</Link> },
  { key: '/reports', icon: <BarChartOutlined />, label: <Link to="/reports">报表</Link> },
];

export default function AppLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        width={220}
        breakpoint="lg"
        collapsedWidth={64}
        style={{ background: '#001529' }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 16px', color: '#fff', fontWeight: 600 }}>
          进销存
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 16px' }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>罗鑫的进销存系统</span>
          <div>
            {username}
            <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </div>
        </Layout.Header>
        <Layout.Content style={{ padding: 16 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
