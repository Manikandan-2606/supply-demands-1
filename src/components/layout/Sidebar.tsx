import React from 'react';
import {
  LayoutDashboard,
  Package,
  Building2,
  ShoppingCart,
  Truck,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Settings as SettingsIcon,
  X,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewTab } from '../../types';

interface NavItem {
  id: ViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeType?: 'alert' | 'info';
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    products,
    replenishments
  } = useApp();

  // Dynamic alerts
  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const pendingPOCount = replenishments.filter(r => r.status === 'ordered' || r.status === 'in_transit').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Catalog', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'sales', label: 'Sales Transactions', icon: ShoppingCart },
    {
      id: 'replenishment',
      label: 'Replenishment Orders',
      icon: Truck,
      badge: pendingPOCount > 0 ? pendingPOCount : undefined,
      badgeType: 'info'
    },
    { id: 'analytics', label: 'Demand Analytics', icon: BarChart3 },
    { id: 'forecast', label: 'Predictive Forecast', icon: TrendingUp },
    {
      id: 'reorder',
      label: 'Reorder Alerts',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeType: 'alert'
    },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block">
              SupplyIQ
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">
              Supply Chain OS
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                    item.badgeType === 'alert'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Intelligence & Planning
        </div>
        {navItems.slice(5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                    item.badgeType === 'alert'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Active Warehouse</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">San Jose Central</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          <span>Inventory Health</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            {products.length > 0 ? Math.round(((products.length - lowStockCount) / products.length) * 100) : 100}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
