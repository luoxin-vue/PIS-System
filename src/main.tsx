import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';
import { PreferencesProvider } from './context/PreferencesContext';

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <BrowserRouter basename={routerBasename || undefined}>
            <App />
          </BrowserRouter>
        </PreferencesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  // </React.StrictMode>
);
