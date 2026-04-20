import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 640,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ color: '#cf1322', marginTop: 0 }}>页面出错了</h2>
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
          <p style={{ color: '#666' }}>
            请打开浏览器控制台（F12）查看完整错误信息，或尝试刷新页面。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
