import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../api/client';
import { useMutation } from '@tanstack/react-query';
import { ThemeLocaleControls } from '../components/ThemeLocaleControls';

export function Login() {
  const [loading, setLoading] = useState(false);
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const { t } = usePreferences();

  const loginMutation = useMutation({
    mutationFn: (values: { username: string; password: string }) => api.auth.login(values.username, values.password),
    onSuccess: (res) => {
      login(res.token, res.username);
      message.success(t('login.success'));
      navigate('/');
    },
    onError: (e: unknown) => {
      message.error(e instanceof Error ? e.message : t('login.failed'));
    },
    onSettled: () => setLoading(false),
  });

  if (token) return <Navigate to="/" replace />;

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    loginMutation.mutate(values);
  };

  return (
    <div className="login-page">
      <div className="login-page__toolbar" style={{ position: 'absolute', top: 16, right: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeLocaleControls />
      </div>
      <div className="login-page__orb" aria-hidden />
      <div className="login-page__orb login-page__orb--2" aria-hidden />
      <Card
        className="login-card"
        title={<Typography.Text strong style={{ fontSize: 17 }}>{t('login.welcome')}</Typography.Text>}
        extra={<Typography.Text type="secondary">{t('login.subtitle')}</Typography.Text>}
      >
        <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 24 }}>
          {t('login.description')}
        </Typography.Paragraph>
        <Form onFinish={onFinish} layout="vertical" requiredMark={false}>
          <Form.Item name="username" label={t('login.username')} rules={[{ required: true, message: t('login.usernameRequired') }]}>
            <Input placeholder={t('login.usernamePh')} size="large" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label={t('login.password')} rules={[{ required: true, message: t('login.passwordRequired') }]}>
            <Input.Password placeholder={t('login.passwordPh')} size="large" autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
