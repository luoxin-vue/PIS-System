import { useState, useMemo } from 'react';
import { Card, Row, Col, DatePicker, Space, Typography } from 'antd';
import { api } from '../api/client';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import { getChartTheme } from '../theme/chartTokens';
import { usePreferences } from '../context/PreferencesContext';

export function Reports() {
  const { t, themeMode } = usePreferences();
  const isDark = themeMode === 'dark';
  const c = useMemo(() => getChartTheme(isDark), [isDark]);

  const [from, setFrom] = useState<string | undefined>(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState<string | undefined>(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  const { data: summaryData } = useQuery<{
    purchase_total: number;
    purchase_count: number;
    sales_total: number;
    sales_count: number;
    gross_profit: number;
  }>({
    queryKey: ['reportsSummary', { from, to }],
    queryFn: () => api.reports.summary(from!, to!),
    enabled: !!from && !!to,
  });

  const { data: trendData } = useQuery<{ list: { date: string; purchase_total: number; sales_total: number }[] }>({
    queryKey: ['reportsTrend', { from, to }],
    queryFn: () => api.reports.trend(from!, to!),
    enabled: !!from && !!to,
  });

  const data =
    (summaryData as {
      purchase_total: number;
      purchase_count: number;
      sales_total: number;
      sales_count: number;
      gross_profit: number;
    } | null) ?? null;
  const trend = trendData?.list ?? [];

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
        data: trend.map((x) => x.date.slice(5)),
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
          type: 'bar' as const,
          itemStyle: { color: c.bar1 },
          emphasis: { itemStyle: { color: c.bar1Em } },
          data: trend.map((x) => Number(x.purchase_total || 0)),
        },
        {
          name: t('chart.sales'),
          type: 'bar' as const,
          itemStyle: { color: c.bar2 },
          emphasis: { itemStyle: { color: c.bar2Em } },
          data: trend.map((x) => Number(x.sales_total || 0)),
        },
      ],
    }),
    [trend, c, t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('reports.title')}</Typography.Title>
      <Space style={{ marginBottom: 24 }}>
        <span>{t('reports.range')}</span>
        <DatePicker
          value={from ? dayjs(from) : null}
          onChange={(_, s) => {
            setFrom(Array.isArray(s) ? s[0] : s || undefined);
            setLoading(true);
          }}
        />
        <span>{t('reports.to')}</span>
        <DatePicker
          value={to ? dayjs(to) : null}
          onChange={(_, s) => {
            setTo(Array.isArray(s) ? s[0] : s || undefined);
            setLoading(true);
          }}
        />
      </Space>

      <Card title={t('reports.chartTitle')} style={{ marginBottom: 16 }}>
        <ReactECharts option={chartOption} style={{ height: 320 }} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title={t('reports.purchaseSummary')} loading={loading} style={{ minHeight: 140 }}>
            <p>
              {t('reports.purchaseCount')}
              {data?.purchase_count ?? '-'}
            </p>
            <p>
              {t('reports.purchaseTotal')}
              {t('common.currency')}
              {data?.purchase_total != null ? Number(data.purchase_total).toFixed(2) : '-'}
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title={t('reports.salesSummary')} loading={loading} style={{ minHeight: 140 }}>
            <p>
              {t('reports.salesCount')}
              {data?.sales_count ?? '-'}
            </p>
            <p>
              {t('reports.salesTotal')}
              {t('common.currency')}
              {data?.sales_total != null ? Number(data.sales_total).toFixed(2) : '-'}
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title={t('reports.grossTitle')} loading={loading} style={{ minHeight: 140 }}>
            <p>
              {t('reports.grossLine')}
              {t('common.currency')}
              {data?.gross_profit != null ? Number(data.gross_profit).toFixed(2) : '-'}
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
