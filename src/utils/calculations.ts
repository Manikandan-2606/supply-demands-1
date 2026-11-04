import { Product, Supplier, SalesTransaction, ReplenishmentOrder } from '../types';

export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0
  });
}

export type StockHealthStatus = 'healthy' | 'low_stock' | 'critical' | 'out_of_stock';

export function getProductStatus(product: Product): StockHealthStatus {
  if (product.currentStock <= 0) return 'out_of_stock';
  if (product.currentStock <= product.minStock) return 'critical';
  if (product.currentStock <= product.reorderPoint) return 'low_stock';
  return 'healthy';
}

export function getStatusLabel(status: StockHealthStatus): string {
  switch (status) {
    case 'out_of_stock':
      return 'Out of Stock';
    case 'critical':
      return 'Critical Low';
    case 'low_stock':
      return 'Reorder Required';
    case 'healthy':
      return 'Healthy';
  }
}

export function getStatusColors(status: StockHealthStatus): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  switch (status) {
    case 'out_of_stock':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-900',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/50'
      };
    case 'critical':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/50'
      };
    case 'low_stock':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-900',
        badgeBg: 'bg-orange-100 dark:bg-orange-900/50'
      };
    case 'healthy':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-900',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50'
      };
  }
}

export interface ReorderRecommendation {
  product: Product;
  supplier?: Supplier;
  currentStock: number;
  reorderPoint: number;
  dailyDemand: number;
  daysOfSupply: number;
  leadTimeDays: number;
  projectedStockoutDays: number;
  suggestedQuantity: number;
  estimatedCost: number;
  urgency: 'critical' | 'high' | 'medium' | 'nominal';
  reason: string;
}

export function calculateReorderRecommendations(
  products: Product[],
  suppliers: Supplier[],
  bufferDays: number = 3
): ReorderRecommendation[] {
  const recommendations: ReorderRecommendation[] = [];

  for (const product of products) {
    const supplier = suppliers.find(s => s.id === product.supplierId);
    const leadTime = supplier?.leadTimeDays ?? product.leadTimeDays ?? 7;
    const dailyDemand = product.dailyDemand > 0 ? product.dailyDemand : 1;
    const daysOfSupply = Math.max(0, product.currentStock / dailyDemand);
    const criticalThresholdDays = leadTime + bufferDays;

    const isBelowReorder = product.currentStock <= product.reorderPoint;
    const isImminentStockout = daysOfSupply <= criticalThresholdDays;

    if (isBelowReorder || isImminentStockout) {
      let urgency: 'critical' | 'high' | 'medium' | 'nominal' = 'medium';
      let reason = '';

      if (product.currentStock === 0) {
        urgency = 'critical';
        reason = 'Currently out of stock - immediate fulfillment required';
      } else if (daysOfSupply < leadTime) {
        urgency = 'critical';
        reason = `Stock will deplete in ${Math.round(daysOfSupply)} days, but supplier lead time is ${leadTime} days`;
      } else if (daysOfSupply <= criticalThresholdDays) {
        urgency = 'high';
        reason = `Within lead time + ${bufferDays}d safety buffer window (${Math.round(daysOfSupply)}d supply left)`;
      } else {
        urgency = 'medium';
        reason = `Stock (${product.currentStock}) breached reorder point (${product.reorderPoint})`;
      }

      // Calculate suggested batch: ensures at least 25 days coverage + supplier minimum batch
      const suggestedCoverageDays = Math.max(30, leadTime * 2);
      const idealBatch = Math.ceil(dailyDemand * suggestedCoverageDays);
      const suggestedQuantity = Math.max(product.reorderQuantity, idealBatch);
      const estimatedCost = suggestedQuantity * product.unitCost;

      recommendations.push({
        product,
        supplier,
        currentStock: product.currentStock,
        reorderPoint: product.reorderPoint,
        dailyDemand,
        daysOfSupply: Number(daysOfSupply.toFixed(1)),
        leadTimeDays: leadTime,
        projectedStockoutDays: Math.floor(daysOfSupply),
        suggestedQuantity,
        estimatedCost,
        urgency,
        reason
      });
    }
  }

  // Sort by urgency: critical first, then high, then medium
  const rank = { critical: 0, high: 1, medium: 2, nominal: 3 };
  return recommendations.sort((a, b) => rank[a.urgency] - rank[b.urgency]);
}

export function calculateDashboardKPIs(
  products: Product[],
  suppliers: Supplier[],
  sales: SalesTransaction[],
  replenishments: ReplenishmentOrder[]
) {
  const totalStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);

  const outOfStockCount = products.filter(p => p.currentStock <= 0).length;
  const criticalCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length;
  const lowStockCount = products.filter(
    p => p.currentStock > p.minStock && p.currentStock <= p.reorderPoint
  ).length;
  const healthyCount = products.filter(p => p.currentStock > p.reorderPoint).length;

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
  const grossProfit = totalSalesRevenue - totalSalesCost;
  const grossMarginPercent = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  const pendingReplenishments = replenishments.filter(r => r.status === 'ordered' || r.status === 'in_transit');
  const inboundUnits = pendingReplenishments.reduce(
    (sum, r) => sum + r.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );

  return {
    totalStockUnits,
    totalInventoryValue,
    totalRetailValue,
    activeSKUCount: products.length,
    outOfStockCount,
    criticalCount,
    lowStockCount,
    healthyCount,
    reorderAlertsTotal: outOfStockCount + criticalCount + lowStockCount,
    totalSalesRevenue,
    grossProfit,
    grossMarginPercent,
    activeSuppliersCount: suppliers.filter(s => s.status === 'active').length,
    pendingPOsCount: pendingReplenishments.length,
    inboundUnits
  };
}

export interface DailySalesPoint {
  date: string;
  displayDate: string;
  revenue: number;
  units: number;
  cost: number;
}

export function aggregateSalesTimeline(sales: SalesTransaction[], daysCount: number = 14): DailySalesPoint[] {
  const timeline: Record<string, { revenue: number; units: number; cost: number }> = {};
  
  // Seed dates up to today
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    timeline[key] = { revenue: 0, units: 0, cost: 0 };
  }

  // Populate from real sales transactions
  for (const sale of sales) {
    const key = sale.date.split('T')[0];
    if (timeline[key]) {
      timeline[key].revenue += sale.total;
      timeline[key].cost += sale.totalCost;
      timeline[key].units += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  return Object.entries(timeline).map(([date, data]) => {
    const d = new Date(date + 'T12:00:00Z');
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date,
      displayDate,
      revenue: Number(data.revenue.toFixed(2)),
      units: data.units,
      cost: Number(data.cost.toFixed(2))
    };
  });
}
