import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useMutation } from '@tanstack/react-query';

export function Login() {
  const [loading, setLoading] = useState(false);
  const { token, login } = useAuth();
  const navigate = useNavigate();
  if (token) return <Navigate to="/" replace />;

  const loginMutation = useMutation({
    mutationFn: (values: { username: string; password: string }) => api.auth.login(values.username, values.password),
    onSuccess: (res) => {
      login(res.token, res.username);
      message.success('登录成功');
      navigate('/');
    },
    onError: (e: unknown) => {
      message.error(e instanceof Error ? e.message : '登录失败');
    },
    onSettled: () => setLoading(false),
  });

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    loginMutation.mutate(values);
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <Card title="玛吉斯轮胎店 - 进销存" extra="登录">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
