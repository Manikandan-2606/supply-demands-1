export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Electronics' | 'Mechanical' | 'Raw Materials' | 'Packaging' | 'Accessories' | 'Office Hardware';
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  unitPrice: number;
  supplierId: string;
  supplierName?: string;
  location: string;
  leadTimeDays: number;
  dailyDemand: number; // units sold per day average
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  rating: number; // 1 to 5
  onTimeDeliveryRate: number; // e.g. 96 (%)
  paymentTerms: string; // 'Net 30', 'Net 60', 'Immediate'
  status: 'active' | 'inactive';
  categoryFocus: string;
  address: string;
}

export interface SaleLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface SalesTransaction {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  date: string;
  channel: 'B2B Wholesale' | 'Direct eCommerce' | 'Distribution Partner' | 'Retail Store';
  items: SaleLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalCost: number;
  marginAmount: number;
  marginPercent: number;
  status: 'completed' | 'processing' | 'refunded';
}

export interface ReplenishmentLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface ReplenishmentOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualReceivedDate?: string;
  status: 'ordered' | 'in_transit' | 'received' | 'cancelled';
  items: ReplenishmentLineItem[];
  totalAmount: number;
  notes: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  changeType: 'sale_deduction' | 'replenishment_addition' | 'manual_adjustment' | 'initial_seed';
  quantityChanged: number; // positive or negative
  previousStock: number;
  newStock: number;
  reference: string; // e.g. Invoice # or PO #
  timestamp: string;
}

export interface Settings {
  companyName: string;
  currency: '$' | '€' | '£' | '¥';
  lowStockThresholdPct: number;
  leadTimeSafetyBufferDays: number;
  forecastHorizonDays: 30 | 60 | 90;
  autoSuggestReorder: boolean;
  theme: 'light' | 'dark';
}

export type ViewTab =
  | 'dashboard'
  | 'inventory'
  | 'suppliers'
  | 'sales'
  | 'replenishment'
  | 'analytics'
  | 'forecast'
  | 'reorder'
  | 'settings';
