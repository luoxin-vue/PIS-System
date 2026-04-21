import React from 'react';
import { translate, type LocaleCode } from './i18n';

function storedLocale(): LocaleCode {
  const v = localStorage.getItem('app-locale');
  return v === 'en-US' || v === 'zh-CN' ? v : 'zh-CN';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const loc = storedLocale();
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 640,
            margin: '40px auto',
            background: 'var(--error-boundary-bg, #fff)',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ color: '#cf1322', marginTop: 0 }}>{translate(loc, 'errorBoundary.title')}</h2>
          <pre
            style={{
              overflow: 'auto',
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ color: '#666' }}>{translate(loc, 'errorBoundary.hint')}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
