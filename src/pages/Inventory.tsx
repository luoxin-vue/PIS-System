import { useMemo, useState } from 'react';
import { Table, Tabs, Input, Typography, Space } from 'antd';
import { api, type Product, type InventoryLog } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { usePreferences } from '../context/PreferencesContext';

export function Inventory() {
  const { t } = usePreferences();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');

  const { data: inventoryData, isLoading: loading } = useQuery<{ list: Product[]; total: number }>({
    queryKey: ['inventory', { page, search }],
    queryFn: () => api.inventory.list(search || undefined, page, 50),
  });

  const list: Product[] = inventoryData?.list ?? [];
  const total = inventoryData?.total ?? 0;

  const { data: logsData, isLoading: logsLoading } = useQuery<{ list: InventoryLog[]; total: number }>({
    queryKey: ['inventoryLogs', { page: logsPage }],
    queryFn: () => api.inventory.logs(undefined, logsPage, 30),
    enabled: activeTab === 'logs',
  });

  const logs: InventoryLog[] = logsData?.list ?? [];
  const logsTotal = logsData?.total ?? 0;

  const onTabChange = (key: string) => {
    if (key === 'logs') {
      setActiveTab('logs');
    } else {
      setActiveTab('stock');
    }
  };

  const inventoryColumns = useMemo(
    () => [
      { title: t('inventory.colName'), dataIndex: 'name', key: 'name', width: 120 },
      { title: t('inventory.colBrand'), dataIndex: 'brand', key: 'brand', width: 90 },
      { title: t('inventory.colModel'), dataIndex: 'model', key: 'model', width: 90 },
      { title: t('inventory.colSize'), dataIndex: 'size', key: 'size', width: 100 },
      { title: t('inventory.colQty'), dataIndex: 'stock_quantity', key: 'stock_quantity', width: 90 },
      { title: t('inventory.colLow'), dataIndex: 'low_stock_threshold', key: 'low_stock_threshold', width: 80 },
      {
        title: t('inventory.colCost'),
        dataIndex: 'cost_price',
        key: 'cost_price',
        width: 80,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      {
        title: t('inventory.colSale'),
        dataIndex: 'sale_price',
        key: 'sale_price',
        width: 80,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
    ],
    [t]
  );

  const logColumns = useMemo(
    () => [
      { title: t('inventory.logTime'), dataIndex: 'created_at', key: 'created_at', width: 180 },
      {
        title: t('inventory.logProduct'),
        dataIndex: 'product_name',
        key: 'product_name',
        render: (_: unknown, r: InventoryLog) => `${r.product_name || ''} ${r.size || ''}`.trim(),
      },
      {
        title: t('inventory.logType'),
        dataIndex: 'type',
        key: 'type',
        width: 80,
        render: (v: string) => (v === 'in' ? t('inventory.typeIn') : t('inventory.typeOut')),
      },
      { title: t('inventory.logQty'), dataIndex: 'quantity', key: 'quantity', width: 80 },
      {
        title: t('inventory.logRef'),
        dataIndex: 'ref_type',
        key: 'ref_type',
        width: 80,
        render: (v: string) => (v === 'purchase' ? t('inventory.refPurchase') : t('inventory.refSales')),
      },
    ],
    [t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('inventory.title')}</Typography.Title>
      <Tabs
        onChange={onTabChange}
        items={[
          {
            key: 'stock',
            label: t('inventory.tabStock'),
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Input.Search
                    placeholder={t('inventory.searchPh')}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    onSearch={() => setPage(1)}
                    style={{ width: 260 }}
                  />
                </Space>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={list}
                  columns={inventoryColumns}
                  pagination={{
                    current: page,
                    pageSize: 50,
                    total,
                    showSizeChanger: false,
                    onChange: (p) => setPage(p),
                  }}
                  scroll={{ x: 700 }}
                />
              </>
            ),
          },
          {
            key: 'logs',
            label: t('inventory.tabLogs'),
            children: (
              <>
                <Table
                  rowKey="id"
                  loading={logsLoading}
                  dataSource={logs}
                  columns={logColumns}
                  pagination={{
                    current: logsPage,
                    pageSize: 30,
                    total: logsTotal,
                    showSizeChanger: false,
                    onChange: (p) => setLogsPage(p),
                  }}
                  scroll={{ x: 600 }}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
