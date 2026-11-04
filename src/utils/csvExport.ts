import { Product, Supplier, SalesTransaction, ReplenishmentOrder } from '../types';
import { ReorderRecommendation } from './calculations';

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProductsCSV(products: Product[], suppliers: Supplier[]) {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Current Stock',
    'Safety Stock',
    'Reorder Point',
    'Reorder Quantity',
    'Unit Cost',
    'Unit Price',
    'Location',
    'Supplier',
    'Lead Time (Days)',
    'Daily Demand Velocity',
    'Total Value'
  ];

  const rows = products.map(p => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    return [
      escapeCSV(p.sku),
      escapeCSV(p.name),
      escapeCSV(p.category),
      p.currentStock,
      p.minStock,
      p.reorderPoint,
      p.reorderQuantity,
      p.unitCost.toFixed(2),
      p.unitPrice.toFixed(2),
      escapeCSV(p.location),
      escapeCSV(supplier?.name || p.supplierName || 'N/A'),
      p.leadTimeDays,
      p.dailyDemand,
      (p.currentStock * p.unitCost).toFixed(2)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `SupplyIQ_Products_${new Date().toISOString().split('T')[0]}.csv`;
  triggerDownload(csvContent, filename);
}

export function exportSuppliersCSV(suppliers: Supplier[]) {
  const headers = [
    'Supplier Name',
    'Contact Person',
    'Email',
    'Phone',
    'Category Focus',
    'Lead Time (Days)',
    'Rating',
    'On-Time Delivery (%)',
    'Payment Terms',
    'Status',
    'Address'
  ];

  const rows = suppliers.map(s => [
    escapeCSV(s.name),
    escapeCSV(s.contactPerson),
    escapeCSV(s.email),
    escapeCSV(s.phone),
    escapeCSV(s.categoryFocus),
    s.leadTimeDays,
    s.rating,
    s.onTimeDeliveryRate,
    escapeCSV(s.paymentTerms),
    escapeCSV(s.status),
    escapeCSV(s.address)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `SupplyIQ_Suppliers_${new Date().toISOString().split('T')[0]}.csv`;
  triggerDownload(csvContent, filename);
}

export function exportSalesCSV(sales: SalesTransaction[]) {
  const headers = [
    'Invoice Reference',
    'Date',
    'Customer Name',
    'Customer Email',
    'Sales Channel',
    'Items Summary',
    'Item Count',
    'Subtotal',
    'Tax',
    'Total Revenue',
    'Total Cost',
    'Gross Margin ($)',
    'Gross Margin (%)',
    'Status'
  ];

  const rows = sales.map(s => {
    const itemsSummary = s.items.map(i => `${i.productName} (x${i.quantity})`).join('; ');
    const itemCount = s.items.reduce((sum, i) => sum + i.quantity, 0);
    return [
      escapeCSV(s.reference),
      escapeCSV(s.date),
      escapeCSV(s.customerName),
      escapeCSV(s.customerEmail),
      escapeCSV(s.channel),
      escapeCSV(itemsSummary),
      itemCount,
      s.subtotal.toFixed(2),
      s.tax.toFixed(2),
      s.total.toFixed(2),
      s.totalCost.toFixed(2),
      s.marginAmount.toFixed(2),
      s.marginPercent.toFixed(1),
      escapeCSV(s.status)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `SupplyIQ_Sales_${new Date().toISOString().split('T')[0]}.csv`;
  triggerDownload(csvContent, filename);
}

export function exportReplenishmentsCSV(replenishments: ReplenishmentOrder[]) {
  const headers = [
    'Order Number',
    'Supplier',
    'Order Date',
    'Expected Delivery',
    'Actual Received Date',
    'Status',
    'Items Summary',
    'Total Units',
    'Total PO Cost',
    'Notes'
  ];

  const rows = replenishments.map(r => {
    const itemsSummary = r.items.map(i => `${i.productName} (x${i.quantity})`).join('; ');
    const totalUnits = r.items.reduce((sum, i) => sum + i.quantity, 0);
    return [
      escapeCSV(r.orderNumber),
      escapeCSV(r.supplierName),
      escapeCSV(r.orderDate),
      escapeCSV(r.expectedDeliveryDate),
      escapeCSV(r.actualReceivedDate || 'Pending'),
      escapeCSV(r.status),
      escapeCSV(itemsSummary),
      totalUnits,
      r.totalAmount.toFixed(2),
      escapeCSV(r.notes)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `SupplyIQ_PurchaseOrders_${new Date().toISOString().split('T')[0]}.csv`;
  triggerDownload(csvContent, filename);
}

export function exportReorderRecommendationsCSV(recommendations: ReorderRecommendation[]) {
  const headers = [
    'Product Name',
    'SKU',
    'Supplier',
    'Current Stock',
    'Reorder Point',
    'Days of Supply',
    'Lead Time (Days)',
    'Urgency',
    'Recommended Order Quantity',
    'Estimated PO Cost',
    'Justification Reason'
  ];

  const rows = recommendations.map(rec => [
    escapeCSV(rec.product.name),
    escapeCSV(rec.product.sku),
    escapeCSV(rec.supplier?.name || rec.product.supplierName || 'N/A'),
    rec.currentStock,
    rec.reorderPoint,
    rec.daysOfSupply,
    rec.leadTimeDays,
    escapeCSV(rec.urgency.toUpperCase()),
    rec.suggestedQuantity,
    rec.estimatedCost.toFixed(2),
    escapeCSV(rec.reason)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `SupplyIQ_Reorder_Recommendations_${new Date().toISOString().split('T')[0]}.csv`;
  triggerDownload(csvContent, filename);
}
