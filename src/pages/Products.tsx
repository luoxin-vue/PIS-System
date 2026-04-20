import { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, type Product } from '../api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function Products() {
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
      message.success('已删除');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除该商品？',
      onOk: () =>
        deleteProductMutation.mutate(id, {
          onError: (e) => {
            message.error(e instanceof Error ? e.message : '删除失败');
          },
        }),
    });
  };

  const onFinish = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.products.update(editing.id, values as Partial<Product>);
        message.success('已更新');
      } else {
        await api.products.create(values as Partial<Product>);
        message.success('已添加');
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '操作失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '型号', dataIndex: 'model', key: 'model', width: 100 },
    { title: '规格', dataIndex: 'size', key: 'size', width: 100 },
    { title: '进价', dataIndex: 'cost_price', key: 'cost_price', width: 80, render: (v: number) => '¥' + Number(v).toFixed(2) },
    { title: '售价', dataIndex: 'sale_price', key: 'sale_price', width: 80, render: (v: number) => '¥' + Number(v).toFixed(2) },
    { title: '库存', dataIndex: 'stock_quantity', key: 'stock_quantity', width: 80 },
    { title: '预警线', dataIndex: 'low_stock_threshold', key: 'low_stock_threshold', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, r: Product) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>商品管理</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索名称/品牌/型号/规格" value={search} onChange={(e) => setSearch(e.target.value)} onSearch={onSearch} style={{ width: 260 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增商品
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
      <Modal title={editing ? '编辑商品' : '新增商品'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnHidden>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
          onFinish={onFinish}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="品牌" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label="型号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="size" label="规格" rules={[{ required: true }]}>
            <Input placeholder="如 205/55R16" />
          </Form.Item>
          <Form.Item name="cost_price" label="进价" initialValue={0}>
            <Input type="number" step={0.01} />
          </Form.Item>
          <Form.Item name="sale_price" label="售价" initialValue={0}>
            <Input type="number" step={0.01} />
          </Form.Item>
          <Form.Item name="stock_quantity" label="库存数量" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="low_stock_threshold" label="低库存预警线" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
