import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  message,
  Typography,
  Row,
  Col,
  Divider,
  theme,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api, type PurchaseOrder, type Product, type Supplier } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreferences } from '../context/PreferencesContext';

export function Purchases() {
  const { t } = usePreferences();
  const { token } = theme.useToken();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<PurchaseOrder | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { data: purchasesData, isLoading: loading } = useQuery<{ list: PurchaseOrder[]; total: number }>({
    queryKey: ['purchases', { page }],
    queryFn: () => api.purchases.list(page, 20),
  });

  const list: PurchaseOrder[] = purchasesData?.list ?? [];
  const total = purchasesData?.total ?? 0;

  const { data: productsData } = useQuery<{ list: Product[] }>({
    queryKey: ['products', { page: 1, search: '' }],
    queryFn: () => api.products.list(undefined, 1, 500),
  });
  const products: Product[] = productsData?.list ?? [];

  const { data: suppliersData } = useQuery<{ list: Supplier[] }>({
    queryKey: ['suppliersAll'],
    queryFn: () => api.suppliers.list(undefined, 1, 500),
  });
  const suppliers: Supplier[] = suppliersData?.list ?? [];

  const openCreate = () => {
    form.resetFields();
    form.setFieldValue('items', [{ product_id: undefined, quantity: 1, unit_price: 0 }]);
    setModalOpen(true);
  };

  const viewDetail = (order: PurchaseOrder) => {
    setDetailOpen(order);
    setDetailId(order.id);
  };

  const { data: detail } = useQuery<
    PurchaseOrder & { items?: { product_name?: string; quantity: number; unit_price: number; amount: number }[] }
  >({
    queryKey: ['purchaseDetail', detailId],
    queryFn: () => api.purchases.get(detailId as number),
    enabled: detailId != null,
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (values: {
      supplier_id: number;
      note?: string;
      items: { product_id: number; quantity: number; unit_price: number }[];
    }) => api.purchases.create(values),
    onSuccess: () => {
      message.success(t('purchases.success'));
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const onFinish = async (values: {
    supplier_id: number;
    note?: string;
    items: { product_id: number; quantity: number; unit_price: number }[];
  }) => {
    const items = (values.items || []).filter((i) => i.product_id && i.quantity > 0);
    if (items.length === 0) {
      message.warning(t('purchases.needItem'));
      return;
    }
    try {
      await createPurchaseMutation.mutateAsync({
        supplier_id: values.supplier_id,
        note: values.note,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price || 0 })),
      });
      setModalOpen(false);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : t('purchases.opFailed'));
    }
  };

  const columns = useMemo(
    () => [
      { title: t('purchases.colOrder'), dataIndex: 'order_no', key: 'order_no', width: 140 },
      { title: t('purchases.colSupplier'), dataIndex: 'supplier_name', key: 'supplier_name' },
      {
        title: t('purchases.colAmount'),
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      { title: t('purchases.colDate'), dataIndex: 'created_at', key: 'created_at', width: 180 },
      {
        title: t('purchases.colAction'),
        key: 'action',
        width: 80,
        render: (_: unknown, r: PurchaseOrder) => (
          <Button type="link" size="small" onClick={() => viewDetail(r)}>
            {t('purchases.view')}
          </Button>
        ),
      },
    ],
    [t]
  );

  const detailColumns = useMemo(
    () => [
      {
        title: t('purchases.colProductName'),
        dataIndex: 'product_name',
        key: 'product_name',
        render: (_: unknown, r: { product_name?: string; brand?: string; model?: string; size?: string }) =>
          `${r.product_name || ''} ${r.brand || ''} ${r.model || ''} ${r.size || ''}`.trim(),
      },
      { title: t('purchases.colQuantity'), dataIndex: 'quantity', key: 'quantity', width: 80 },
      {
        title: t('purchases.colUnitPrice'),
        dataIndex: 'unit_price',
        key: 'unit_price',
        width: 90,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      {
        title: t('purchases.colLineAmount'),
        dataIndex: 'amount',
        key: 'amount',
        width: 90,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
    ],
    [t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('purchases.title')}</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('purchases.new')}
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
        title={t('purchases.modalTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={680}
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
          <Form.Item name="supplier_id" label={t('purchases.labelSupplier')} rules={[{ required: true }]}>
            <Select
              placeholder={t('purchases.phSupplier')}
              showSearch
              optionFilterProp="label"
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item label={t('purchases.labelItems')} colon={false}>
            <Divider style={{ margin: '8px 0 12px' }} />
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Row gutter={8} style={{ marginBottom: 8, color: token.colorTextSecondary }}>
                    <Col span={12}>{t('purchases.colProduct')}</Col>
                    <Col span={4}>{t('purchases.colQty')}</Col>
                    <Col span={6}>{t('purchases.colPrice')}</Col>
                    <Col span={2} />
                  </Row>
                  {fields.map(({ key, name, ...rest }) => (
                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={12}>
                        <Form.Item
                          {...rest}
                          name={[name, 'product_id']}
                          rules={[{ required: true, message: t('purchases.ruleProduct') }]}
                        >
                          <Select
                            placeholder={t('purchases.phProduct')}
                            showSearch
                            optionFilterProp="label"
                            options={products.map((p) => ({ value: p.id, label: `${p.brand} ${p.model} ${p.size}` }))}
                            onChange={(val) => {
                              const p = products.find((x) => x.id === val);
                              if (p) form.setFieldValue(['items', name, 'unit_price'], p.cost_price);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...rest}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: t('purchases.ruleQty') }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...rest}
                          name={[name, 'unit_price']}
                          rules={[{ required: true, message: t('purchases.rulePrice') }]}
                        >
                          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'right' }}>
                        <Button type="link" onClick={() => remove(name)}>
                          {t('purchases.remove')}
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block>
                      {t('purchases.addLine')}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="note" label={t('purchases.note')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">
              {t('purchases.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t('purchases.detailTitle')}
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
            <p>
              {t('purchases.orderNo')}
              {detail.order_no}
            </p>
            <p>
              {t('purchases.supplier')}
              {detail.supplier_name}
            </p>
            <p>
              {t('purchases.total')}
              {t('common.currency')}
              {Number(detail.total_amount).toFixed(2)}
            </p>
            <p>
              {t('purchases.date')}
              {detail.created_at}
            </p>
            {detail.note && (
              <p>
                {t('purchases.noteLabel')}
                {detail.note}
              </p>
            )}
            <Table
              size="small"
              rowKey="id"
              dataSource={detail.items || []}
              columns={detailColumns}
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
