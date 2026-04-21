import { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Select, InputNumber, Input, message, Typography, Row, Col, Divider, theme } from 'antd';
import { PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import { api, type SalesOrder, type Product, type SalesOrderDetail } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreferences } from '../context/PreferencesContext';
import { printSalesOrderWithLocalTemplate } from '../utils/hiprint';

export function Sales() {
  const { t } = usePreferences();
  const { token } = theme.useToken();
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

  const { data: detail } = useQuery<SalesOrderDetail>({
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
      message.success(t('sales.success'));
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onFinish = async (values: {
    customer_plate?: string;
    note?: string;
    items: { product_id: number; quantity: number; unit_price: number }[];
  }) => {
    const items = (values.items || []).filter((i) => i.product_id && i.quantity > 0);
    if (items.length === 0) {
      message.warning(t('sales.needItem'));
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
      message.error(e instanceof Error ? e.message : t('sales.opFailed'));
    }
  };

  const columns = useMemo(
    () => [
      { title: t('sales.colOrder'), dataIndex: 'order_no', key: 'order_no', width: 140 },
      { title: t('sales.colCustomer'), dataIndex: 'customer_plate', key: 'customer_plate' },
      {
        title: t('sales.colAmount'),
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      { title: t('sales.colDate'), dataIndex: 'created_at', key: 'created_at', width: 180 },
      {
        title: t('sales.colAction'),
        key: 'action',
        width: 80,
        render: (_: unknown, r: SalesOrder) => (
          <Button type="link" size="small" onClick={() => viewDetail(r)}>
            {t('sales.view')}
          </Button>
        ),
      },
    ],
    [t]
  );

  const detailColumns = useMemo(
    () => [
      {
        title: t('sales.colProductName'),
        dataIndex: 'product_name',
        key: 'product_name',
        render: (_: unknown, r: { product_name?: string; brand?: string; model?: string; size?: string }) =>
          `${r.product_name || ''} ${r.brand || ''} ${r.model || ''} ${r.size || ''}`.trim(),
      },
      { title: t('sales.colQuantity'), dataIndex: 'quantity', key: 'quantity', width: 80 },
      {
        title: t('sales.colUnitPrice'),
        dataIndex: 'unit_price',
        key: 'unit_price',
        width: 90,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      {
        title: t('sales.colLineAmount'),
        dataIndex: 'amount',
        key: 'amount',
        width: 90,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
    ],
    [t]
  );

  const handlePrintDetail = async () => {
    if (!detail) return;
    const result = await printSalesOrderWithLocalTemplate(detail);
    if (result.ok) return;
    if (result.reason === 'no-template') {
      message.warning(t('ticket.printNoTemplate'));
      return;
    }
    message.error(t('ticket.printTemplateInvalid'));
  };

  return (
    <div>
      <Typography.Title level={4}>{t('sales.title')}</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('sales.new')}
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
      <Modal
        title={t('sales.modalTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
          onFinish={onFinish}
          initialValues={{ items: [{ product_id: undefined, quantity: 1, unit_price: 0 }] }}
        >
          <Form.Item name="customer_plate" label={t('sales.labelCustomer')}>
            <Input placeholder={t('sales.phOptional')} />
          </Form.Item>
          <Form.Item label={t('sales.labelItems')} colon={false} style={{ marginBottom: 0 }}>
            <Divider style={{ margin: '8px 0 12px' }} />
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Row gutter={8} style={{ marginBottom: 8, color: token.colorTextSecondary }}>
                    <Col span={12}>{t('sales.colProduct')}</Col>
                    <Col span={4}>{t('sales.colQty')}</Col>
                    <Col span={6}>{t('sales.colPrice')}</Col>
                    <Col span={2} />
                  </Row>
                  {fields.map(({ key, name, ...rest }) => (
                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={12}>
                        <Form.Item {...rest} name={[name, 'product_id']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                          <Select
                            placeholder={t('sales.phProduct')}
                            showSearch
                            optionFilterProp="label"
                            options={products.map((p) => ({
                              value: p.id,
                              label: `${p.brand} ${p.model} ${p.size} ${t('sales.stockHint', { stock: String(p.stock_quantity) })}`,
                            }))}
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
                          {t('sales.remove')}
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block>
                      {t('sales.addLine')}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="note" label={t('sales.note')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">
              {t('sales.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t('sales.detailTitle')}
        open={!!detailOpen}
        onCancel={() => {
          setDetailOpen(null);
          setDetailId(null);
        }}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => void handlePrintDetail()} disabled={!detail}>
            {t('ticket.print')}
          </Button>,
          <Button key="close" onClick={() => {
            setDetailOpen(null);
            setDetailId(null);
          }}>
            {t('common.close')}
          </Button>,
        ]}
        width={560}
      >
        {detail && (
          <div>
            <p>
              {t('sales.orderNo')}
              {detail.order_no}
            </p>
            {detail.customer_plate && (
              <p>
                {t('sales.customer')}
                {detail.customer_plate}
              </p>
            )}
            <p>
              {t('sales.total')}
              {t('common.currency')}
              {Number(detail.total_amount).toFixed(2)}
            </p>
            <p>
              {t('sales.date')}
              {detail.created_at}
            </p>
            {detail.note && (
              <p>
                {t('sales.noteLabel')}
                {detail.note}
              </p>
            )}
            <Table size="small" rowKey="id" dataSource={detail.items || []} columns={detailColumns} pagination={false} />
          </div>
        )}
      </Modal>
    </div>
  );
}
