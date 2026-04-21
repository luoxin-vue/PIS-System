import { useMemo, useState } from 'react';
import { Table, Button, Space, Input, Modal, Popconfirm, Form, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, type Supplier } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePreferences } from '../context/PreferencesContext';

export function Suppliers() {
  const { t } = usePreferences();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { data: suppliersData, isLoading: loading } = useQuery<{ list: Supplier[]; total: number }>({
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

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => api.suppliers.delete(id),
    onSuccess: () => {
      message.success(t('suppliers.deleted'));
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleDelete = (id: number) => {
    deleteSupplierMutation.mutate(id, {
      onError: (e) => {
        message.error(e instanceof Error ? e.message : t('suppliers.deleteFailed'));
      },
    });
  };

  const createSupplierMutation = useMutation({
    mutationFn: (values: Record<string, string>) => api.suppliers.create(values),
    onSuccess: () => {
      message.success(t('suppliers.added'));
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: (params: { id: number; values: Record<string, string> }) =>
      api.suppliers.update(params.id, params.values),
    onSuccess: () => {
      message.success(t('suppliers.updated'));
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
      message.error(e instanceof Error ? e.message : t('suppliers.opFailed'));
    }
  };

  const columns = useMemo(
    () => [
      { title: t('suppliers.colName'), dataIndex: 'name', key: 'name' },
      { title: t('suppliers.colContact'), dataIndex: 'contact', key: 'contact' },
      { title: t('suppliers.colPhone'), dataIndex: 'phone', key: 'phone' },
      { title: t('suppliers.colNote'), dataIndex: 'note', key: 'note', ellipsis: true },
      {
        title: t('suppliers.colAction'),
        key: 'action',
        width: 120,
        render: (_: unknown, r: Supplier) => (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
            <Popconfirm title={t('suppliers.deleteConfirm')} onConfirm={() => handleDelete(r.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [t]
  );

  return (
    <div>
      <Typography.Title level={4}>{t('suppliers.title')}</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t('suppliers.searchPh')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={onSearch}
          style={{ width: 260 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('suppliers.add')}
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
        title={editing ? t('suppliers.edit') : t('suppliers.create')}
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
          <Form.Item name="name" label={t('suppliers.colName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label={t('suppliers.colContact')}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('suppliers.colPhone')}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label={t('suppliers.colNote')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item wrapperCol={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <Button type="primary" htmlType="submit">
              {t('suppliers.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
