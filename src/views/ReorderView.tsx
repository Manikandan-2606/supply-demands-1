import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  Truck,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateReorderRecommendations, formatCurrency, ReorderRecommendation } from '../utils/calculations';
import { exportReorderRecommendationsCSV } from '../utils/csvExport';

export const ReorderView: React.FC = () => {
  const {
    products,
    suppliers,
    settings,
    setPrefillPO,
    setIsNewPOModalOpen,
    createReplenishmentOrder,
    addToast
  } = useApp();

  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const recommendations = useMemo(() => {
    return calculateReorderRecommendations(products, suppliers, settings.leadTimeSafetyBufferDays);
  }, [products, suppliers, settings.leadTimeSafetyBufferDays]);

  const filteredRecommendations = useMemo(() => {
    if (urgencyFilter === 'all') return recommendations;
    return recommendations.filter(r => r.urgency === urgencyFilter);
  }, [recommendations, urgencyFilter]);

  const totalEstimatedCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
  const criticalCount = recommendations.filter(r => r.urgency === 'critical').length;

  const handleOrderSingle = (rec: ReorderRecommendation) => {
    setPrefillPO({
      supplierId: rec.product.supplierId,
      productId: rec.product.id,
      quantity: rec.suggestedQuantity
    });
    setIsNewPOModalOpen(true);
  };

  const handleBatchReorderAll = () => {
    if (recommendations.length === 0) return;

    // Group items by supplier
    const bySupplier: Record<string, ReorderRecommendation[]> = {};
    for (const rec of recommendations) {
      const supId = rec.product.supplierId || 'unknown';
      if (!bySupplier[supId]) bySupplier[supId] = [];
      bySupplier[supId].push(rec);
    }

    let poCount = 0;
    for (const [supId, recs] of Object.entries(bySupplier)) {
      const sup = suppliers.find(s => s.id === supId);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + (sup?.leadTimeDays || 7));

      createReplenishmentOrder({
        supplierId: supId,
        supplierName: sup?.name || 'Supply Partner',
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: deliveryDate.toISOString(),
        status: 'ordered',
        notes: `Automated Batch Reorder for ${recs.length} critical inventory SKUs`,
        items: recs.map(r => ({
          productId: r.product.id,
          productName: r.product.name,
          sku: r.product.sku,
          quantity: r.suggestedQuantity,
          unitCost: r.product.unitCost,
          totalCost: r.estimatedCost
        }))
      });
      poCount++;
    }

    addToast(
      'success',
      'Batch Orders Dispatched',
      `Generated ${poCount} Purchase Orders covering ${recommendations.length} recommended SKUs.`
    );
  };

  const getUrgencyBadge = (urgency: ReorderRecommendation['urgency']) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <ShieldAlert className="w-3 h-3" />
            Critical Stockout
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
            <AlertTriangle className="w-3 h-3" />
            Lead Time Breach
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Reorder Point Reached
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Automated Inventory Reorder Recommendations
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Continuously evaluated against supplier SLAs ({settings.leadTimeSafetyBufferDays}d safety buffer) and current consumption rates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportReorderRecommendationsCSV(recommendations)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export Queue CSV
            </button>
            {recommendations.length > 0 && (
              <button
                onClick={handleBatchReorderAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              >
                <Truck className="w-3.5 h-3.5" />
                Batch Reorder All ({recommendations.length} Items)
              </button>
            )}
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Queue Items</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {recommendations.length} SKUs ({criticalCount} critical)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Estimated Reorder Cost</span>
            <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatCurrency(totalEstimatedCost, settings.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Buffer Policy</span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              Lead Time + {settings.leadTimeSafetyBufferDays} Days Safety
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'critical', 'high', 'medium'] as const).map(u => (
          <button
            key={u}
            onClick={() => setUrgencyFilter(u)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              urgencyFilter === u
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {u === 'all' ? 'All Queued' : `${u} urgency`}
          </button>
        ))}
      </div>

      {/* Recommendations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                <th className="px-4 py-3 font-semibold">Priority & SKU</th>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold text-right">Current Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Runway</th>
                <th className="px-4 py-3 font-semibold">Supplier & SLA</th>
                <th className="px-4 py-3 font-semibold">Justification Reason</th>
                <th className="px-4 py-3 font-semibold text-right">Recommended PO</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    No reorder recommendations needed right now. All inventory levels are nominal.
                  </td>
                </tr>
              ) : (
                filteredRecommendations.map(rec => (
                  <tr key={rec.product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Priority & SKU */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="mb-1">{getUrgencyBadge(rec.urgency)}</div>
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
                        {rec.product.sku}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {rec.product.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rec.product.category} · Reorder Pt: {rec.reorderPoint}
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      <span className={rec.currentStock === 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}>
                        {rec.currentStock} units
                      </span>
                    </td>

                    {/* Runway */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className={rec.daysOfSupply <= rec.leadTimeDays ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {rec.daysOfSupply.toFixed(1)} Days
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {rec.supplier?.name || rec.product.supplierName || 'Unassigned'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rec.leadTimeDays}d lead time
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs">
                      {rec.reason}
                    </td>

                    {/* Suggested Batch */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        +{rec.suggestedQuantity} units
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(rec.estimatedCost, settings.currency)}
                      </div>
                    </td>

                    {/* Reorder Button */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOrderSingle(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
