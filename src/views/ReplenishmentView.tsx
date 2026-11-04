import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Download,
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { exportReplenishmentsCSV } from '../utils/csvExport';

export const ReplenishmentView: React.FC = () => {
  const {
    replenishments,
    receiveReplenishmentOrder,
    cancelReplenishmentOrder,
    settings,
    globalSearch,
    setIsNewPOModalOpen,
    setPrefillPO
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedPOId, setExpandedPOId] = useState<string | null>(null);

  const query = (globalSearch || localSearch).trim().toLowerCase();

  const filteredPOs = useMemo(() => {
    return replenishments.filter(r => {
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      if (query) {
        const matchPO = r.orderNumber.toLowerCase().includes(query);
        const matchSup = r.supplierName.toLowerCase().includes(query);
        const matchItems = r.items.some(
          i => i.productName.toLowerCase().includes(query) || i.sku.toLowerCase().includes(query)
        );
        if (!matchPO && !matchSup && !matchItems) return false;
      }
      return true;
    });
  }, [replenishments, query, selectedStatus]);

  const pendingCount = replenishments.filter(r => r.status === 'ordered' || r.status === 'in_transit').length;
  const receivedCount = replenishments.filter(r => r.status === 'received').length;
  const totalReplenishedValue = replenishments
    .filter(r => r.status === 'received')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Received & Added to Stock
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <Truck className="w-3 h-3" />
            In Transit (Air / Sea)
          </span>
        );
      case 'ordered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Ordered / Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Pending Inbound POs</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {pendingCount} active shipments
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Completed Inbound Batches</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {receivedCount} fulfilled
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Replenished Capital</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalReplenishedValue, settings.currency)}
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
              placeholder="Search PO#, supplier, line item..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="in_transit">In Transit</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportReplenishmentsCSV(replenishments)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setPrefillPO(null);
              setIsNewPOModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                <th className="px-4 py-3 font-semibold">PO Number</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Dates</th>
                <th className="px-4 py-3 font-semibold">Delivery Status</th>
                <th className="px-4 py-3 font-semibold text-center">Batch Items</th>
                <th className="px-4 py-3 font-semibold text-right">Commitment Cost</th>
                <th className="px-4 py-3 font-semibold text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No purchase orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const isExpanded = expandedPOId === po.id;
                  const totalUnits = po.items.reduce((s, i) => s + i.quantity, 0);
                  const isPending = po.status === 'ordered' || po.status === 'in_transit';

                  const orderDateFormatted = new Date(po.orderDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                  const deliveryDateFormatted = new Date(po.expectedDeliveryDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <React.Fragment key={po.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {po.orderNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {po.supplierName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                          <div>Ordered: {orderDateFormatted}</div>
                          <div className="text-[10px] text-slate-400">ETA: {deliveryDateFormatted}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(po.status)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono tabular-nums whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                            {totalUnits} units ({po.items.length} SKUs)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                          {formatCurrency(po.totalAmount, settings.currency)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => receiveReplenishmentOrder(po.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-2xs"
                                title="Confirm delivery and automatically increment inventory stock"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                Receive Stock
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedPOId(isExpanded ? null : po.id)}
                              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white px-1.5 py-1 rounded"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Line Items Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                          <td colSpan={7} className="p-4">
                            <div className="text-xs space-y-2">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                                Purchase Order Line Specifications
                              </div>
                              <div className="space-y-1.5 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                                {po.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] text-slate-400">{item.sku}</span>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</span>
                                    </div>
                                    <div className="flex items-center gap-4 font-mono text-slate-600 dark:text-slate-300">
                                      <span>Replenish Qty: {item.quantity}</span>
                                      <span>@ {formatCurrency(item.unitCost, settings.currency)}</span>
                                      <span className="font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(item.totalCost, settings.currency)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                                <span>Notes: {po.notes || 'None provided'}</span>
                                {isPending && (
                                  <button
                                    onClick={() => cancelReplenishmentOrder(po.id)}
                                    className="text-rose-600 hover:underline"
                                  >
                                    Cancel Order
                                  </button>
                                )}
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
          Showing {filteredPOs.length} of {replenishments.length} purchase orders
        </div>
      </div>
    </div>
  );
};
