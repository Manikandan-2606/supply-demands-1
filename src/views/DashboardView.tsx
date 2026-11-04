import React from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Truck,
  ShoppingCart,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDashboardKPIs, formatCurrency, formatNumber, getProductStatus, getStatusLabel, getStatusColors } from '../utils/calculations';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { InventoryHealthBar } from '../components/charts/InventoryHealthBar';

export const DashboardView: React.FC = () => {
  const {
    products,
    suppliers,
    sales,
    replenishments,
    settings,
    setActiveTab,
    setIsNewSaleModalOpen,
    setIsNewPOModalOpen,
    setPrefillPO
  } = useApp();

  const kpis = calculateDashboardKPIs(products, suppliers, sales, replenishments);

  // Products needing attention
  const urgentProducts = products
    .filter(p => p.currentStock <= p.reorderPoint)
    .sort((a, b) => a.currentStock / (a.dailyDemand || 1) - b.currentStock / (b.dailyDemand || 1))
    .slice(0, 5);

  const handleQuickReorder = (productId: string, supplierId: string, qty: number) => {
    setPrefillPO({ productId, supplierId, quantity: qty });
    setIsNewPOModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Top-line KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inventory Valuation */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(kpis.totalInventoryValue, settings.currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {formatNumber(kpis.totalStockUnits)}
              </span>
              <span>total units on-hand</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active SKUs & Stock Health */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Catalog SKUs Managed
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {kpis.activeSKUCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-emerald-600 font-mono font-medium">
                {kpis.healthyCount} optimal
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-amber-600 font-mono font-medium">
                {kpis.reorderAlertsTotal} low
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Sales Revenue & Margin */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Recorded Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(kpis.totalSalesRevenue, settings.currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 font-mono font-semibold">
                {kpis.grossMarginPercent.toFixed(1)}% margin
              </span>
              <span>({formatCurrency(kpis.grossProfit, settings.currency)})</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Reorder Alerts */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Reorder Action Required
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              kpis.reorderAlertsTotal > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums flex items-baseline gap-2">
              <span>{kpis.reorderAlertsTotal}</span>
              {kpis.outOfStockCount > 0 && (
                <span className="text-xs text-rose-600 font-sans font-medium">
                  ({kpis.outOfStockCount} out of stock)
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {kpis.pendingPOsCount} POs in transit
              </span>
              <button
                onClick={() => setActiveTab('reorder')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center"
              >
                Inspect Queue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Trend Chart + Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Demand Velocity */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Fulfillment & Sales Demand Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time transaction volume derived from recorded sales
              </p>
            </div>
            <button
              onClick={() => setIsNewSaleModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              + Record Sale
            </button>
          </div>
          <SalesTrendChart sales={sales} currency={settings.currency} days={14} />
        </div>

        {/* Right 1 Col: Inventory Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Inventory Stock Health
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {products.length} Items Total
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time classification based on reorder thresholds and safety stocks
            </p>
            <InventoryHealthBar products={products} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Inbound Shipments</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {formatNumber(kpis.inboundUnits)} units ({kpis.pendingPOsCount} POs)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Active Supply Partners</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {kpis.activeSuppliersCount} vendors
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Potential Retail Gross</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(kpis.totalRetailValue, settings.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Split: Urgent Reorder Actions & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Reorder Queue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Reorder Attention
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Products nearing or past stockout thresholds
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reorder')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All ({kpis.reorderAlertsTotal})
            </button>
          </div>

          {urgentProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              All inventory levels are currently in optimal healthy status!
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentProducts.map(product => {
                const status = getProductStatus(product);
                const colors = getStatusColors(status);
                const daysSupply = Math.max(0, product.currentStock / (product.dailyDemand || 1));

                return (
                  <div
                    key={product.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {product.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {product.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>Stock: <strong className="font-mono text-slate-900 dark:text-white">{product.currentStock}</strong> / {product.reorderPoint}</span>
                        <span>·</span>
                        <span>Supply: <strong className="font-mono">{daysSupply.toFixed(1)}d</strong></span>
                        <span>·</span>
                        <span className={colors.text}>{getStatusLabel(status)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickReorder(product.id, product.supplierId, product.reorderQuantity)}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors shrink-0"
                    >
                      Reorder ({product.reorderQuantity})
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sales Activity */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                Latest Sales Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Most recent sales orders with automatic stock deduction
              </p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Ledger ({sales.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {sales.slice(0, 5).map(sale => {
              const dateStr = new Date(sale.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              const totalItems = sale.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={sale.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                        {sale.reference}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {sale.customerName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{dateStr}</span>
                      <span className="mx-1.5">·</span>
                      <span>{totalItems} units sold</span>
                      <span className="mx-1.5">·</span>
                      <span className="text-emerald-600 font-medium">+{sale.marginPercent.toFixed(0)}% margin</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(sale.total, settings.currency)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {sale.channel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
