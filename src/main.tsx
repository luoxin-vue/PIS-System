import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const queryClient = new QueryClient();
const zhValidateMessages = {
  required: '${label}不能为空',
  types: {
    email: '${label}不是合法的邮箱地址',
    number: '${label}必须是数字',
  },
  number: {
    min: '${label}不能小于${min}',
    max: '${label}不能大于${max}',
  },
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN} form={{ validateMessages: zhValidateMessages }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  // </React.StrictMode>
);
