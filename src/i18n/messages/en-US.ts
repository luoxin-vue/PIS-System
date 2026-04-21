import { enApiTicketMessages } from './modules/en/apiTicket';
import { enCommonMessages } from './modules/en/common';
import { enDashboardReportsMessages } from './modules/en/dashboardReports';
import { enProductsSuppliersMessages } from './modules/en/productsSuppliers';
import { enPurchasesSalesInventoryMessages } from './modules/en/purchasesSalesInventory';

export const messagesEnUS: Record<string, string> = {
  ...enCommonMessages,
  ...enDashboardReportsMessages,
  ...enProductsSuppliersMessages,
  ...enPurchasesSalesInventoryMessages,
  ...enApiTicketMessages,
};
