import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Select, InputNumber, Input, message, Typography, Row, Col, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api, type SalesOrder, type Product } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function Sales() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<SalesOrder | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {
    data: salesData,
    isLoading: loading,
  } = useQuery<{ list: SalesOrder[]; total: number }>({
    queryKey: ['sales', { page }],
    queryFn: () => api.sales.list(page, 20),
  });

  const list: SalesOrder[] = salesData?.list ?? [];
  const total = salesData?.total ?? 0;

  const { data: productsData } = useQuery<{ list: Product[] }>({
    queryKey: ['products', { page: 1, search: '' }],
    queryFn: () => api.products.list(undefined, 1, 500),
  });
  const products: Product[] = productsData?.list ?? [];

  const openCreate = () => {
    form.resetFields();
    form.setFieldValue('items', [{ product_id: undefined, quantity: 1, unit_price: 0 }]);
    setModalOpen(true);
  };

  const viewDetail = (order: SalesOrder) => {
    setDetailOpen(order);
    setDetailId(order.id);
  };

  const { data: detail } = useQuery<
    SalesOrder & { items?: { product_name?: string; quantity: number; unit_price: number; amount: number }[] }
  >({
    queryKey: ['salesDetail', detailId],
    queryFn: () => api.sales.get(detailId as number),
    enabled: detailId != null,
  });

  const createSalesMutation = useMutation({
    mutationFn: (values: {
      customer_plate?: string;
      note?: string;
      items: { product_id: number; quantity: number; unit_price: number }[];
    }) => api.sales.create(values),
    onSuccess: () => {
      message.success('出库成功');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onFinish = async (values: { customer_plate?: string; note?: string; items: { product_id: number; quantity: number; unit_price: number }[] }) => {
    const items = (values.items || []).filter((i) => i.product_id && i.quantity > 0);
    if (items.length === 0) {
      message.warning('请至少添加一条商品');
      return;
    }
    try {
      await createSalesMutation.mutateAsync({
        customer_plate: values.customer_plate,
        note: values.note,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price || 0 })),
      });
      setModalOpen(false);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '操作失败');
    }
  };

  const columns = [
    { title: '单号', dataIndex: 'order_no', key: 'order_no', width: 140 },
    { title: '客户/车牌', dataIndex: 'customer_plate', key: 'customer_plate' },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', render: (v: number) => '¥' + Number(v).toFixed(2) },
    { title: '日期', dataIndex: 'created_at', key: 'created_at', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, r: SalesOrder) => <Button type="link" size="small" onClick={() => viewDetail(r)}>查看</Button>,
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>销售出库</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建出库单
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={list}
        columns={columns}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
      />
      <Modal title="新建出库单" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={640} destroyOnHidden>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
          onFinish={onFinish}
          initialValues={{ items: [{ product_id: undefined, quantity: 1, unit_price: 0 }] }}
        >
          <Form.Item name="customer_plate" label="客户/车牌">
            <Input placeholder="选填" />
          </Form.Item>
          <Form.Item label="明细" colon={false} style={{ marginBottom: 0 }}>
            <Divider style={{ margin: '8px 0 12px' }} />
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Row gutter={8} style={{ marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>
                    <Col span={12}>商品</Col>
                    <Col span={4}>数量</Col>
                    <Col span={6}>单价</Col>
                    <Col span={2}></Col>
                  </Row>
                  {fields.map(({ key, name, ...rest }) => (
                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={12}>
                        <Form.Item {...rest} name={[name, 'product_id']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                          <Select
                            placeholder="选择商品"
                            showSearch
                            optionFilterProp="label"
                            options={products.map((p) => ({ value: p.id, label: `${p.brand} ${p.model} ${p.size} (库存${p.stock_quantity})` }))}
                            onChange={(val) => {
                              const p = products.find((x) => x.id === val);
                              if (p) form.setFieldValue(['items', name, 'unit_price'], p.sale_price);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, 'quantity']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...rest} name={[name, 'unit_price']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'right' }}>
                        <Button type="link" onClick={() => remove(name)}>
                          删除
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block>
                      + 添加商品
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">提交出库</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="出库单详情"
        open={!!detailOpen}
        onCancel={() => {
          setDetailOpen(null);
          setDetailId(null);
        }}
        footer={null}
        width={560}
      >
        {detail && (
          <div>
            <p>单号：{detail.order_no}</p>
            {detail.customer_plate && <p>客户/车牌：{detail.customer_plate}</p>}
            <p>总金额：¥{Number(detail.total_amount).toFixed(2)}</p>
            <p>日期：{detail.created_at}</p>
            {detail.note && <p>备注：{detail.note}</p>}
            <Table
              size="small"
              rowKey="id"
              dataSource={detail.items || []}
              columns={[
                { title: '商品', dataIndex: 'product_name', key: 'product_name', render: (_: unknown, r: { product_name?: string; brand?: string; model?: string; size?: string }) => `${r.product_name || ''} ${r.brand || ''} ${r.model || ''} ${r.size || ''}`.trim() },
                { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
                { title: '单价', dataIndex: 'unit_price', key: 'unit_price', width: 90, render: (v: number) => '¥' + Number(v).toFixed(2) },
                { title: '金额', dataIndex: 'amount', key: 'amount', width: 90, render: (v: number) => '¥' + Number(v).toFixed(2) },
              ]}
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
