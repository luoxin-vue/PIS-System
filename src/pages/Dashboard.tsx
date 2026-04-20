import { useEffect, useMemo, type ReactNode } from 'react';
import { Card, Row, Col, List, Typography, Spin, Statistic, message } from 'antd';
import { Link } from 'react-router-dom';
import { api, type Product } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { WarningOutlined, InboxOutlined, ShoppingCartOutlined, DollarOutlined, DatabaseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getChartTheme } from '../theme/chartTokens';
import { usePreferences } from '../context/PreferencesContext';

export function Dashboard() {
  const { t, themeMode } = usePreferences();
  const isDark = themeMode === 'dark';
  const c = useMemo(() => getChartTheme(isDark), [isDark]);

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
      message.error(dashError instanceof Error ? dashError.message : t('dashboard.loadFailed'));
    }
  }, [dashError, t]);

  const dash = dashData ?? null;
  const alerts = alertsData?.list ?? [];

  const chartOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      textStyle: { color: c.text },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        textStyle: { color: c.tooltipText, fontSize: 12 },
      },
      legend: { data: [t('chart.purchase'), t('chart.sales')], textStyle: { color: c.legend } },
      grid: { left: 44, right: 24, top: 44, bottom: 32 },
      xAxis: {
        type: 'category' as const,
        data: (dash?.trend || []).map((x) => x.date.slice(5)),
        axisLine: { lineStyle: { color: c.axisLine } },
        axisLabel: { color: c.axisLabel },
        splitLine: { lineStyle: { color: c.splitLine } },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { lineStyle: { color: c.axisLine } },
        axisLabel: { color: c.axisLabel },
        splitLine: { lineStyle: { color: c.splitLine } },
      },
      series: [
        {
          name: t('chart.purchase'),
          type: 'line' as const,
          smooth: true,
          lineStyle: { color: c.line1, width: 2 },
          itemStyle: { color: c.line1Item },
          areaStyle: { color: c.line1Area },
          data: (dash?.trend || []).map((x) => Number(x.purchase_total || 0)),
        },
        {
          name: t('chart.sales'),
          type: 'line' as const,
          smooth: true,
          lineStyle: { color: c.line2, width: 2 },
          itemStyle: { color: c.line2Item },
          areaStyle: { color: c.line2Area },
          data: (dash?.trend || []).map((x) => Number(x.sales_total || 0)),
        },
      ],
    }),
    [dash?.trend, c, t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('dashboard.title')}</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Link to="/products">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<InboxOutlined />} label={t('dashboard.cardProducts')} />
                <Statistic value={dash?.products_count ?? '-'} />
              </Row>
              <Typography.Text type="secondary">{t('dashboard.cardProductsSub')}</Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/purchases">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<ShoppingCartOutlined />} label={t('dashboard.cardPurchases')} />
                <Statistic
                  value={dash?.purchase_today_total != null ? Number(dash.purchase_today_total).toFixed(0) : '-'}
                  prefix={t('common.currency')}
                />
              </Row>
              <Typography.Text type="secondary">
                {t('dashboard.cardPurchasesSub', { count: String(dash?.purchase_today_count ?? '-') })}
              </Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/sales">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<DollarOutlined />} label={t('dashboard.cardSales')} />
                <Statistic
                  value={dash?.sales_today_total != null ? Number(dash.sales_today_total).toFixed(0) : '-'}
                  prefix={t('common.currency')}
                />
              </Row>
              <Typography.Text type="secondary">
                {t('dashboard.cardSalesSub', { count: String(dash?.sales_today_count ?? '-') })}
              </Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Link to="/inventory">
            <Card style={{ minHeight: 120 }}>
              <Row align="middle" justify="space-between">
                <SpaceIcon icon={<DatabaseOutlined />} label={t('dashboard.cardInventory')} />
                <Statistic value={dash?.low_stock_count ?? '-'} />
              </Row>
              <Typography.Text type="secondary">{t('dashboard.cardInventorySub')}</Typography.Text>
            </Card>
          </Link>
        </Col>
      </Row>

      <Card title={t('dashboard.chartTitle')} style={{ marginTop: 16 }} loading={dashLoading}>
        <ReactECharts option={chartOption} style={{ height: 280 }} />
      </Card>

      <Card title={t('dashboard.alertsTitle')} style={{ marginTop: 24 }}>
        {alertsLoading ? (
          <Spin />
        ) : alerts.length === 0 ? (
          <Typography.Text type="secondary">{t('dashboard.alertsEmpty')}</Typography.Text>
        ) : (
          <List
            dataSource={alerts}
            renderItem={(p) => (
              <List.Item>
                <WarningOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
                {t('dashboard.alertLine', {
                  brand: p.brand,
                  model: p.model,
                  size: p.size,
                  stock: String(p.stock_quantity),
                  threshold: String(p.low_stock_threshold),
                })}
                <Link to="/inventory" style={{ marginLeft: 8 }}>
                  {t('dashboard.viewInventory')}
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

function SpaceIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </div>
  );
}
