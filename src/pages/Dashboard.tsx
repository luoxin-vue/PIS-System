import { useEffect } from 'react';
import { Card, Row, Col, List, Typography, Spin, Statistic, message } from 'antd';
import { Link } from 'react-router-dom';
import { api, type Product } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { WarningOutlined, InboxOutlined, ShoppingCartOutlined, DollarOutlined, DatabaseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

export function Dashboard() {
  const { data: alertsData, isLoading: alertsLoading } = useQuery<{ list: Product[] }>({
    queryKey: ['inventoryAlerts'],
    queryFn: () => api.inventory.alerts(),
  });

  const { data: dashData, error: dashError, isLoading: dashLoading } = useQuery<{
    products_count: number;
    low_stock_count: number;
    purchase_today_total: number;
    purchase_today_count: number;
    sales_today_total: number;
    sales_today_count: number;
    trend: { date: string; purchase_total: number; sales_total: number }[];
  }>({
    queryKey: ['dashboard'],
    queryFn: () => api.reports.dashboard(),
  });

  useEffect(() => {
    if (dashError) {
      message.error(dashError instanceof Error ? dashError.message : '首页数据加载失败');
    }
  }, [dashError]);

  const dash = dashData ?? null;
  const alerts = alertsData?.list ?? [];

  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['采购', '销售'] },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: (dash?.trend || []).map((t) => t.date.slice(5)) },
    yAxis: { type: 'value' },
    series: [
      { name: '采购', type: 'line', smooth: true, data: (dash?.trend || []).map((t) => Number(t.purchase_total || 0)) },
      { name: '销售', type: 'line', smooth: true, data: (dash?.trend || []).map((t) => Number(t.sales_total || 0)) },
    ],
  } as const;

  return (
    <div>
      <Typography.Title level={4}>首页</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Link to="/products">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<InboxOutlined />} label="商品管理" />
                <Statistic value={dash?.products_count ?? '-'} />
              </Row>
              <Typography.Text type="secondary">商品总数</Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/purchases">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<ShoppingCartOutlined />} label="采购入库" />
                <Statistic
                  value={dash?.purchase_today_total != null ? Number(dash.purchase_today_total).toFixed(0) : '-'}
                  prefix="¥"
                />
              </Row>
              <Typography.Text type="secondary">今日 {dash?.purchase_today_count ?? '-'} 笔</Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/sales">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<DollarOutlined />} label="销售出库" />
                <Statistic
                  value={dash?.sales_today_total != null ? Number(dash.sales_today_total).toFixed(0) : '-'}
                  prefix="¥"
                />
              </Row>
              <Typography.Text type="secondary">今日 {dash?.sales_today_count ?? '-'} 笔</Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/inventory">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<DatabaseOutlined />} label="库存" />
                <Statistic value={dash?.low_stock_count ?? '-'} />
              </Row>
              <Typography.Text type="secondary">低库存预警数</Typography.Text>
            </Card>
          </Link>
        </Col>
      </Row>

      <Card title="近 7 天采购 / 销售趋势" style={{ marginTop: 16 }} loading={dashLoading}>
        <ReactECharts option={chartOption} style={{ height: 280 }} />
      </Card>

      <Card title="低库存预警" style={{ marginTop: 24 }}>
        {alertsLoading ? (
          <Spin />
        ) : alerts.length === 0 ? (
          <Typography.Text type="secondary">暂无低库存商品</Typography.Text>
        ) : (
          <List
            dataSource={alerts}
            renderItem={(p) => (
              <List.Item>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                {p.brand} {p.model} {p.size} — 当前库存 {p.stock_quantity}，预警线 {p.low_stock_threshold}
                <Link to="/inventory" style={{ marginLeft: 8 }}>
                  查看库存
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

function SpaceIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </div>
  );
}
