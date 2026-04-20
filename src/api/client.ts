// 本地通过 Vite 代理使用 `/api`；GitHub Pages 上在构建时注入 VITE_API_BASE（完整前缀，勿尾斜杠）
const API_BASE =
  import.meta.env.VITE_API_BASE != null && String(import.meta.env.VITE_API_BASE).trim() !== ''
    ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '')
    : '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  let url = API_BASE + path;
  if (params) {
    const search = new URLSearchParams(params).toString();
    url += (path.includes('?') ? '&' : '?') + search;
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let msg = res.statusText || `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: unknown; message?: unknown };
      const piece = body?.error ?? body?.message;
      if (piece != null && piece !== '') msg = String(piece);
    } catch {
      /* 非 JSON 响应时沿用 statusText */
    }
    throw new Error(msg || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; username: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (username: string, password: string) =>
      request<{ token: string; username: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },
  products: {
    list: (q?: string, page = 1, limit = 20) =>
      request<{ list: Product[]; total: number }>('/products', { params: { q: q ?? '', page: String(page), limit: String(limit) } }),
    get: (id: number) => request<Product>('/products/' + id),
    create: (data: Partial<Product>) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Product>) => request<Product>('/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>('/products/' + id, { method: 'DELETE' }),
  },
  suppliers: {
    list: (q?: string, page = 1, limit = 20) =>
      request<{ list: Supplier[]; total: number }>('/suppliers', { params: { q: q ?? '', page: String(page), limit: String(limit) } }),
    get: (id: number) => request<Supplier>('/suppliers/' + id),
    create: (data: Partial<Supplier>) => request<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Supplier>) => request<Supplier>('/suppliers/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>('/suppliers/' + id, { method: 'DELETE' }),
  },
  purchases: {
    list: (page = 1, limit = 20) =>
      request<{ list: PurchaseOrder[]; total: number }>('/purchases', { params: { page: String(page), limit: String(limit) } }),
    get: (id: number) => request<PurchaseOrderDetail>('/purchases/' + id),
    create: (data: { supplier_id: number; note?: string; items: { product_id: number; quantity: number; unit_price: number }[] }) =>
      request<PurchaseOrderDetail>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
  },
  sales: {
    list: (page = 1, limit = 20) =>
      request<{ list: SalesOrder[]; total: number }>('/sales', { params: { page: String(page), limit: String(limit) } }),
    get: (id: number) => request<SalesOrderDetail>('/sales/' + id),
    create: (data: { customer_plate?: string; note?: string; items: { product_id: number; quantity: number; unit_price: number }[] }) =>
      request<SalesOrderDetail>('/sales', { method: 'POST', body: JSON.stringify(data) }),
  },
  inventory: {
    list: (q?: string, page = 1, limit = 50) =>
      request<{ list: Product[]; total: number }>('/inventory', { params: { q: q ?? '', page: String(page), limit: String(limit) } }),
    alerts: () => request<{ list: Product[] }>('/inventory/alerts'),
    logs: (product_id?: number, page = 1, limit = 50) =>
      request<{ list: InventoryLog[]; total: number }>('/inventory/logs', {
        params: { ...(product_id ? { product_id: String(product_id) } : {}), page: String(page), limit: String(limit) },
      }),
  },
  reports: {
    dashboard: () =>
      request<{
        products_count: number;
        low_stock_count: number;
        purchase_today_total: number;
        purchase_today_count: number;
        sales_today_total: number;
        sales_today_count: number;
        trend: { date: string; purchase_total: number; sales_total: number }[];
      }>('/reports/dashboard'),
    trend: (from: string, to: string) =>
      request<{ list: { date: string; purchase_total: number; sales_total: number }[] }>('/reports/trend', {
        params: { from, to },
      }),
    summary: (from?: string, to?: string) =>
      request<{ purchase_total: number; purchase_count: number; sales_total: number; sales_count: number; gross_profit: number }>(
        '/reports/summary',
        { params: { ...(from ? { from } : {}), ...(to ? { to } : {}) } }
      ),
  },
};

export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  note: string;
  created_at?: string;
}

export interface PurchaseOrder {
  id: number;
  order_no: string;
  supplier_id: number;
  supplier_name?: string;
  total_amount: number;
  note: string;
  created_at: string;
}

export interface PurchaseItem {
  id: number;
  product_id: number;
  product_name?: string;
  brand?: string;
  model?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseItem[];
}

export interface SalesOrder {
  id: number;
  order_no: string;
  customer_plate: string;
  total_amount: number;
  note: string;
  created_at: string;
}

export interface SalesItem {
  id: number;
  product_id: number;
  product_name?: string;
  brand?: string;
  model?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface SalesOrderDetail extends SalesOrder {
  items: SalesItem[];
}

export interface InventoryLog {
  id: number;
  product_id: number;
  product_name?: string;
  size?: string;
  type: 'in' | 'out';
  quantity: number;
  ref_type: string;
  ref_id: number;
  created_at: string;
}
