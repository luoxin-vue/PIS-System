import type { SalesOrderDetail } from '../api/client';

const TEMPLATE_STORAGE_KEY = 'pis-hiprint-template-v3';
const LEGACY_TEMPLATE_KEYS = ['pis-hiprint-template-v2', 'pis-hiprint-template-v1'];

type HiPrintTemplate = {
  print: (data?: unknown) => void;
};

type HiPrintModule = typeof import('rc-hiprint');

let initialized = false;
let hiprintModulePromise: Promise<HiPrintModule> | null = null;

function loadHiprintModule() {
  if (!hiprintModulePromise) {
    hiprintModulePromise = import('rc-hiprint');
  }
  return hiprintModulePromise;
}

async function ensureHiprintReady(): Promise<HiPrintModule> {
  const hiprintModule = await loadHiprintModule();
  const hiprint = hiprintModule.default;
  const { defaultElementTypeProvider, disAutoConnect } = hiprintModule;
  if (initialized) return hiprintModule;
  disAutoConnect();
  hiprint.init({
    providers: [new (defaultElementTypeProvider as unknown as new () => unknown)()],
  });
  initialized = true;
  return hiprintModule;
}

function buildPrintData(order: SalesOrderDetail) {
  return {
    title: 'Sales Receipt',
    orderNo: order.order_no,
    date: order.created_at,
    customer: order.customer_plate || '',
    total: Number(order.total_amount).toFixed(2),
    note: order.note || '',
    barcode: order.order_no,
    qrcode: order.order_no,
    customText: `${order.order_no}  ${order.customer_plate || ''}`.trim(),
    table: (order.items || []).map((it, idx) => ({
      id: idx + 1,
      name: `${it.product_name || ''} ${it.brand || ''} ${it.model || ''} ${it.size || ''}`.trim(),
      gender: '',
      count: Number(it.quantity),
      amount: Number(it.amount).toFixed(2),
    })),
  };
}

export function hasLocalTicketTemplate(): boolean {
  if (localStorage.getItem(TEMPLATE_STORAGE_KEY)) return true;
  return LEGACY_TEMPLATE_KEYS.some((k) => Boolean(localStorage.getItem(k)));
}

export async function printSalesOrderWithLocalTemplate(
  order: SalesOrderDetail
): Promise<{ ok: boolean; reason?: 'no-template' | 'invalid-template' }> {
  const raw =
    localStorage.getItem(TEMPLATE_STORAGE_KEY) ??
    LEGACY_TEMPLATE_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ??
    null;
  if (!raw) return { ok: false, reason: 'no-template' };

  let templateJson: unknown;
  try {
    templateJson = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid-template' };
  }

  const hiprintModule = await ensureHiprintReady();
  const hiprint = hiprintModule.default;
  const template = new (hiprint as any).PrintTemplate({ template: templateJson }) as HiPrintTemplate;
  template.print(buildPrintData(order));
  return { ok: true };
}

