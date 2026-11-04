import React from 'react';
import { Menu, Search, Plus, ShoppingCart, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewTab } from '../../types';

const TAB_TITLES: Record<ViewTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Overview', subtitle: 'Live supply metrics, stock health, and performance signals' },
  inventory: { title: 'Inventory Catalog', subtitle: 'SKU specifications, real-time balances, and threshold alerts' },
  suppliers: { title: 'Supplier Directory', subtitle: 'Vendor SLAs, lead times, and fulfillment reliability metrics' },
  sales: { title: 'Sales Transactions', subtitle: 'Order logs with automated stock deductions and margin tracking' },
  replenishment: { title: 'Replenishment Orders', subtitle: 'Purchase orders, delivery tracking, and automated stock receipt' },
  analytics: { title: 'Demand Analytics', subtitle: 'Historical velocity, category distribution, and turnover rates' },
  forecast: { title: 'Predictive Forecasting', subtitle: 'Demand projections, stockout dates, and safety stock requirements' },
  reorder: { title: 'Reorder Recommendations', subtitle: 'Automated replenishment queue based on lead times and burn rate' },
  settings: { title: 'System & Company Settings', subtitle: 'Currency, safety buffers, theme preferences, and data backup' }
};

export const Header: React.FC = () => {
  const {
    activeTab,
    setIsMobileMenuOpen,
    globalSearch,
    setGlobalSearch,
    setIsNewSaleModalOpen,
    setIsNewPOModalOpen,
    setPrefillPO
  } = useApp();

  const currentMeta = TAB_TITLES[activeTab] || { title: 'SupplyIQ', subtitle: '' };

  const handleOpenPO = () => {
    setPrefillPO(null);
    setIsNewPOModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>SupplyIQ</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize truncate">
              {activeTab}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Middle/Right: Global Search & Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search SKU, product, vendor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Quick Action: New Sale */}
        <button
          onClick={() => setIsNewSaleModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          title="Create sales order with automatic stock reduction"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">New Sale</span>
        </button>

        {/* Quick Action: Replenish PO */}
        <button
          onClick={handleOpenPO}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
          title="Create replenishment purchase order"
        >
          <Truck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Replenish PO</span>
        </button>
      </div>
    </header>
  );
};
