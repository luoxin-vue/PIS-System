import { zhApiTicketMessages } from './modules/zh/apiTicket';
import { zhCommonMessages } from './modules/zh/common';
import { zhDashboardReportsMessages } from './modules/zh/dashboardReports';
import { zhProductsSuppliersMessages } from './modules/zh/productsSuppliers';
import { zhPurchasesSalesInventoryMessages } from './modules/zh/purchasesSalesInventory';

export const messagesZhCN: Record<string, string> = {
  ...zhCommonMessages,
  ...zhDashboardReportsMessages,
  ...zhProductsSuppliersMessages,
  ...zhPurchasesSalesInventoryMessages,
  ...zhApiTicketMessages,
};
