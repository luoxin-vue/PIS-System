import { useState } from 'react';
import { Table, Tabs, Input, Typography, Space } from 'antd';
import { api, type Product, type InventoryLog } from '../api/client';
import { useQuery } from '@tanstack/react-query';

export function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');

  const {
    data: inventoryData,
    isLoading: loading,
  } = useQuery<{ list: Product[]; total: number }>({
    queryKey: ['inventory', { page, search }],
    queryFn: () => api.inventory.list(search || undefined, page, 50),
  });

  const list: Product[] = inventoryData?.list ?? [];
  const total = inventoryData?.total ?? 0;

  const {
    data: logsData,
    isLoading: logsLoading,
  } = useQuery<{ list: InventoryLog[]; total: number }>({
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

  const inventoryColumns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 90 },
    { title: '型号', dataIndex: 'model', key: 'model', width: 90 },
    { title: '规格', dataIndex: 'size', key: 'size', width: 100 },
    { title: '当前库存', dataIndex: 'stock_quantity', key: 'stock_quantity', width: 90 },
    { title: '预警线', dataIndex: 'low_stock_threshold', key: 'low_stock_threshold', width: 80 },
    { title: '进价', dataIndex: 'cost_price', key: 'cost_price', width: 80, render: (v: number) => '¥' + Number(v).toFixed(2) },
    { title: '售价', dataIndex: 'sale_price', key: 'sale_price', width: 80, render: (v: number) => '¥' + Number(v).toFixed(2) },
  ];

  const logColumns = [
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    { title: '商品', dataIndex: 'product_name', key: 'product_name', render: (_: unknown, r: InventoryLog) => `${r.product_name || ''} ${r.size || ''}`.trim() },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => (v === 'in' ? '入库' : '出库') },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '关联', dataIndex: 'ref_type', key: 'ref_type', width: 80, render: (v: string) => (v === 'purchase' ? '采购' : '销售') },
  ];

  return (
    <div>
      <Typography.Title level={4}>库存</Typography.Title>
      <Tabs onChange={onTabChange}
        items={[
          {
            key: 'stock',
            label: '当前库存',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Input.Search
                    placeholder="搜索商品"
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
            label: '库存流水',
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
