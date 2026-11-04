import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { exportSalesCSV } from '../utils/csvExport';

export const SalesView: React.FC = () => {
  const { sales, settings, globalSearch, setIsNewSaleModalOpen } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const query = (globalSearch || localSearch).trim().toLowerCase();

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (selectedChannel !== 'all' && s.channel !== selectedChannel) return false;
      if (query) {
        const matchRef = s.reference.toLowerCase().includes(query);
        const matchCust = s.customerName.toLowerCase().includes(query);
        const matchEmail = s.customerEmail.toLowerCase().includes(query);
        const matchItems = s.items.some(
          i => i.productName.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query)
        );
        if (!matchRef && !matchCust && !matchEmail && !matchItems) return false;
      }
      return true;
    });
  }, [sales, query, selectedChannel]);

  // Aggregate stats
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalUnitsSold = sales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
  const totalMargin = sales.reduce((sum, s) => sum + s.marginAmount, 0);

  const channels = ['all', 'B2B Wholesale', 'Direct eCommerce', 'Distribution Partner', 'Retail Store'];

  return (
    <div className="space-y-4">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Revenue</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalRevenue, settings.currency)}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Average Order</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(avgOrderValue, settings.currency)}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Units Fulfilled</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalUnitsSold} units
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Realized Gross Margin</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalMargin, settings.currency)}
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search reference, customer, product..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {channels.map(ch => (
              <option key={ch} value={ch}>
                {ch === 'all' ? 'All Channels' : ch}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportSalesCSV(sales)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsNewSaleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Sales Order
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Date & Time</th>
                <th className="px-4 py-3 font-semibold">Customer Account</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Channel</th>
                <th className="px-4 py-3 font-semibold text-center">Items</th>
                <th className="px-4 py-3 font-semibold text-right">Invoice Total</th>
                <th className="px-4 py-3 font-semibold text-right hidden sm:table-cell">Gross Margin</th>
                <th className="px-4 py-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No sales transactions found matching query.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const isExpanded = expandedSaleId === sale.id;
                  const dateObj = new Date(sale.date);
                  const dateFormatted = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {sale.reference}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div>{dateFormatted}</div>
                          <div className="text-[10px] text-slate-400">{timeFormatted}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {sale.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sale.customerEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                          {sale.channel}
                        </td>
                        <td className="px-4 py-3 text-center font-mono tabular-nums">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                            {itemCount} units ({sale.items.length} SKUs)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                          {formatCurrency(sale.total, settings.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 hidden sm:table-cell tabular-nums whitespace-nowrap">
                          +{formatCurrency(sale.marginAmount, settings.currency)} ({sale.marginPercent.toFixed(0)}%)
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {isExpanded ? 'Hide' : 'Lines'}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Line Items Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                          <td colSpan={8} className="p-4">
                            <div className="text-xs space-y-2">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                                Deducted Inventory Line Items & Unit Economics
                              </div>
                              <div className="space-y-1.5 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                                {sale.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] text-slate-400">{item.sku}</span>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</span>
                                    </div>
                                    <div className="flex items-center gap-4 font-mono text-slate-600 dark:text-slate-300">
                                      <span>Qty: {item.quantity}</span>
                                      <span>@ {formatCurrency(item.unitPrice, settings.currency)}</span>
                                      <span className="font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(item.total, settings.currency)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                <span>Subtotal: {formatCurrency(sale.subtotal, settings.currency)} · Tax: {formatCurrency(sale.tax, settings.currency)}</span>
                                <span>Automatic stock deduction applied upon order commit</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Showing {filteredSales.length} of {sales.length} sales orders
        </div>
      </div>
    </div>
  );
};
