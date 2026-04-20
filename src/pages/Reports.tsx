import { useState } from 'react';
import { Card, Row, Col, DatePicker, Space, Typography } from 'antd';
import { api } from '../api/client';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';

export function Reports() {
  const [from, setFrom] = useState<string | undefined>(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState<string | undefined>(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  const {
    data: summaryData,
  } = useQuery<{
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

  const data = (summaryData as
    | {
        purchase_total: number;
        purchase_count: number;
        sales_total: number;
        sales_count: number;
        gross_profit: number;
      }
    | null) ?? null;
  const trend = trendData?.list ?? [];

  return (
    <div>
      <Typography.Title level={4}>报表</Typography.Title>
      <Space style={{ marginBottom: 24 }}>
        <span>时间范围：</span>
        <DatePicker
          value={from ? dayjs(from) : null}
          onChange={(_, s) => {
            setFrom(Array.isArray(s) ? s[0] : s || undefined);
            setLoading(true);
          }}
        />
        <span>至</span>
        <DatePicker
          value={to ? dayjs(to) : null}
          onChange={(_, s) => {
            setTo(Array.isArray(s) ? s[0] : s || undefined);
            setLoading(true);
          }}
        />
      </Space>

      <Card title="采购 / 销售趋势" style={{ marginBottom: 16 }}>
        <ReactECharts
          option={{
            tooltip: { trigger: 'axis' },
            legend: { data: ['采购', '销售'] },
            grid: { left: 40, right: 20, top: 40, bottom: 30 },
            xAxis: { type: 'category', data: trend.map((t) => t.date.slice(5)) },
            yAxis: { type: 'value' },
            series: [
              { name: '采购', type: 'bar', data: trend.map((t) => Number(t.purchase_total || 0)) },
              { name: '销售', type: 'bar', data: trend.map((t) => Number(t.sales_total || 0)) },
            ],
          }}
          style={{ height: 320 }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title="采购汇总" loading={loading} style={{ minHeight: 140 }}>
            <p>采购笔数：{data?.purchase_count ?? '-'}</p>
            <p>采购总额：¥{data?.purchase_total != null ? Number(data.purchase_total).toFixed(2) : '-'}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="销售汇总" loading={loading} style={{ minHeight: 140 }}>
            <p>销售笔数：{data?.sales_count ?? '-'}</p>
            <p>销售总额：¥{data?.sales_total != null ? Number(data.sales_total).toFixed(2) : '-'}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="毛利" loading={loading} style={{ minHeight: 140 }}>
            <p>毛利（销售 - 采购）：¥{data?.gross_profit != null ? Number(data.gross_profit).toFixed(2) : '-'}</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
