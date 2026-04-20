import { useMemo, useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, type Product } from '../api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePreferences } from '../context/PreferencesContext';

export function Products() {
  const { t } = usePreferences();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {
    data: productsData,
    isLoading: loading,
  } = useQuery<{ list: Product[]; total: number }>({
    queryKey: ['products', { page, search }],
    queryFn: () => api.products.list(search || undefined, page, 20),
  });

  const list: Product[] = productsData?.list ?? [];
  const total = productsData?.total ?? 0;

  const onSearch = () => {
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r: Product) => {
    setEditing(r);
    form.setFieldsValue({
      name: r.name,
      brand: r.brand,
      model: r.model,
      size: r.size,
      cost_price: r.cost_price,
      sale_price: r.sale_price,
      stock_quantity: r.stock_quantity,
      low_stock_threshold: r.low_stock_threshold,
    });
    setModalOpen(true);
  };
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      message.success(t('products.deleted'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: t('products.deleteConfirm'),
      onOk: () =>
        deleteProductMutation.mutate(id, {
          onError: (e) => {
            message.error(e instanceof Error ? e.message : t('products.deleteFailed'));
          },
        }),
    });
  };

  const onFinish = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.products.update(editing.id, values as Partial<Product>);
        message.success(t('products.updated'));
      } else {
        await api.products.create(values as Partial<Product>);
        message.success(t('products.added'));
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : t('products.opFailed'));
    }
  };

  const columns = useMemo(
    () => [
      { title: t('products.colName'), dataIndex: 'name', key: 'name', width: 120 },
      { title: t('products.colBrand'), dataIndex: 'brand', key: 'brand', width: 100 },
      { title: t('products.colModel'), dataIndex: 'model', key: 'model', width: 100 },
      { title: t('products.colSize'), dataIndex: 'size', key: 'size', width: 100 },
      {
        title: t('products.colCost'),
        dataIndex: 'cost_price',
        key: 'cost_price',
        width: 80,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      {
        title: t('products.colPrice'),
        dataIndex: 'sale_price',
        key: 'sale_price',
        width: 80,
        render: (v: number) => t('common.currency') + Number(v).toFixed(2),
      },
      { title: t('products.colStock'), dataIndex: 'stock_quantity', key: 'stock_quantity', width: 80 },
      { title: t('products.colLow'), dataIndex: 'low_stock_threshold', key: 'low_stock_threshold', width: 80 },
      {
        title: t('products.colAction'),
        key: 'action',
        width: 120,
        render: (_: unknown, r: Product) => (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
          </Space>
        ),
      },
    ],
    [t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('products.title')}</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t('products.searchPh')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={onSearch}
          style={{ width: 260 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('products.add')}
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
        scroll={{ x: 900 }}
      />
      <Modal
        title={editing ? t('products.edit') : t('products.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
          onFinish={onFinish}
        >
          <Form.Item name="name" label={t('products.colName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label={t('products.colBrand')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label={t('products.colModel')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="size" label={t('products.colSize')} rules={[{ required: true }]}>
            <Input placeholder={t('products.sizePh')} />
          </Form.Item>
          <Form.Item name="cost_price" label={t('products.labelCost')} initialValue={0}>
            <Input type="number" step={0.01} />
          </Form.Item>
          <Form.Item name="sale_price" label={t('products.labelPrice')} initialValue={0}>
            <Input type="number" step={0.01} />
          </Form.Item>
          <Form.Item name="stock_quantity" label={t('products.labelStock')} initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="low_stock_threshold" label={t('products.labelLow')} initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">
              {t('products.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
