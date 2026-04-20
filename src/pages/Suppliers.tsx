import { useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, type Supplier } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function Suppliers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {
    data: suppliersData,
    isLoading: loading,
  } = useQuery<{ list: Supplier[]; total: number }>({
    queryKey: ['suppliers', { page, search }],
    queryFn: () => api.suppliers.list(search || undefined, page, 20),
  });

  const list: Supplier[] = suppliersData?.list ?? [];
  const total = suppliersData?.total ?? 0;

  const onSearch = () => {
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r: Supplier) => {
    setEditing(r);
    form.setFieldsValue({ name: r.name, contact: r.contact, phone: r.phone, note: r.note });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除该供应商？',
      onOk: () =>
        deleteSupplierMutation.mutate(id, {
          onError: (e) => {
            message.error(e instanceof Error ? e.message : '删除失败');
          },
        }),
    });
  };

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => api.suppliers.delete(id),
    onSuccess: () => {
      message.success('已删除');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: (values: Record<string, string>) => api.suppliers.create(values),
    onSuccess: () => {
      message.success('已添加');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: (params: { id: number; values: Record<string, string> }) => api.suppliers.update(params.id, params.values),
    onSuccess: () => {
      message.success('已更新');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const onFinish = async (values: Record<string, string>) => {
    try {
      if (editing) {
        await updateSupplierMutation.mutateAsync({ id: editing.id, values });
      } else {
        await createSupplierMutation.mutateAsync(values);
      }
      setModalOpen(false);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '操作失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, r: Supplier) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4}>供应商管理</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索名称/联系人/电话" value={search} onChange={(e) => setSearch(e.target.value)} onSearch={onSearch} style={{ width: 260 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增供应商
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
      <Modal title={editing ? '编辑供应商' : '新增供应商'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnHidden>
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
          <Form.Item name="contact" label="联系人">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} />
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
