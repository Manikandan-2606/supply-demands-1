import React, { useState } from 'react';
import {
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';

export const AnalyticsView: React.FC = () => {
  const { products, sales, settings } = useApp();
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);

  // 1. Demand by Category
  const categoryStats: Record<string, { unitsSold: number; revenue: number; margin: number; inventoryValue: number }> = {};

  // Initialize from products
  for (const p of products) {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { unitsSold: 0, revenue: 0, margin: 0, inventoryValue: 0 };
    }
    categoryStats[p.category].inventoryValue += p.currentStock * p.unitCost;
  }

  // Aggregate from sales
  for (const s of sales) {
    for (const item of s.items) {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { unitsSold: 0, revenue: 0, margin: 0, inventoryValue: 0 };
      }
      categoryStats[cat].unitsSold += item.quantity;
      categoryStats[cat].revenue += item.total;
      categoryStats[cat].margin += (item.unitPrice - item.unitCost) * item.quantity;
    }
  }

  const categoryEntries = Object.entries(categoryStats).sort((a, b) => b[1].revenue - a[1].revenue);
  const maxCatRevenue = Math.max(...categoryEntries.map(e => e[1].revenue), 100);

  // 2. Fast-Moving vs Slow-Moving
  const productPerformance = products.map(p => {
    const unitsSoldInSales = sales.reduce((sum, s) => {
      const match = s.items.find(i => i.productId === p.id);
      return sum + (match ? match.quantity : 0);
    }, 0);

    const burnRate = p.dailyDemand || 1;
    const daysOfSupply = p.currentStock / burnRate;
    const turnoverScore = unitsSoldInSales / Math.max(1, p.currentStock);

    return {
      product: p,
      unitsSold: unitsSoldInSales,
      dailyBurnRate: burnRate,
      daysOfSupply,
      turnoverScore
    };
  });

  const fastMovers = [...productPerformance].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  const slowMovers = [...productPerformance]
    .filter(p => p.product.currentStock > 20)
    .sort((a, b) => a.turnoverScore - b.turnoverScore)
    .slice(0, 5);

  // Channel Breakdown
  const channelStats: Record<string, { count: number; total: number }> = {};
  for (const s of sales) {
    if (!channelStats[s.channel]) {
      channelStats[s.channel] = { count: 0, total: 0 };
    }
    channelStats[s.channel].count += 1;
    channelStats[s.channel].total += s.total;
  }
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Demand Velocity Section */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Recorded Sales Demand History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily revenue trajectory and units fulfilled across all accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Time Horizon:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              {[14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedHorizon(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedHorizon === d
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>
        </div>
        <SalesTrendChart sales={sales} currency={settings.currency} days={selectedHorizon} />
      </div>

      {/* 2-Column: Category Demand Velocity & Sales Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Demand breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Category Demand & Revenue Contribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Aggregated units sold and revenue share by product vertical
          </p>

          <div className="space-y-4">
            {categoryEntries.map(([category, stats]) => {
              const pct = totalSalesRevenue > 0 ? (stats.revenue / totalSalesRevenue) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {category}
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white font-medium">
                      {formatCurrency(stats.revenue, settings.currency)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(5, (stats.revenue / maxCatRevenue) * 100))}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{stats.unitsSold} units fulfilled</span>
                    <span>Inventory Value: {formatCurrency(stats.inventoryValue, settings.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Sales Channels & Distribution Channels
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Transaction volume by order dispatch origin
          </p>

          <div className="space-y-3">
            {Object.entries(channelStats).map(([channel, data]) => {
              const share = totalSalesRevenue > 0 ? (data.total / totalSalesRevenue) * 100 : 0;
              return (
                <div
                  key={channel}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {channel}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {data.count} transaction(s) recorded
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(data.total, settings.currency)}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                      {share.toFixed(1)}% share
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fast Movers vs High Days of Supply */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            Top Velocity SKUs (Fast Moving)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Highest turnover items requiring priority supply chain replenishment
          </p>

          <div className="space-y-2">
            {fastMovers.map(item => (
              <div
                key={item.product.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {item.product.sku} · {item.product.category}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {item.unitsSold} units sold
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.daysOfSupply.toFixed(0)}d supply remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-amber-500" />
            Extended Holding Period (High Days of Supply)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Products with substantial warehouse coverage
          </p>

          <div className="space-y-2">
            {slowMovers.map(item => (
              <div
                key={item.product.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {item.product.sku} · On-hand: {item.product.currentStock}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {item.daysOfSupply.toFixed(0)} Days Supply
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Capital: {formatCurrency(item.product.currentStock * item.product.unitCost, settings.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
