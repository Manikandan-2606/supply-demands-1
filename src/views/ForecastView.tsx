import React, { useState } from 'react';
import {
  Sliders,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ForecastDepletionChart } from '../components/charts/ForecastDepletionChart';
import { formatCurrency, getProductStatus } from '../utils/calculations';

export const ForecastView: React.FC = () => {
  const { products, suppliers, settings, setPrefillPO, setIsNewPOModalOpen } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const selectedSupplier = suppliers.find(s => s.id === selectedProduct?.supplierId);

  // Computations for selected product
  const effectiveDailyDemand = (selectedProduct?.dailyDemand || 2) * demandMultiplier;
  const currentStock = selectedProduct ? selectedProduct.currentStock : 0;
  const daysUntilStockout = Math.max(0, currentStock / (effectiveDailyDemand || 1));
  const leadTime = selectedSupplier?.leadTimeDays ?? selectedProduct?.leadTimeDays ?? 7;

  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout));
  const stockoutDateFormatted = stockoutDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isImminentRisk = daysUntilStockout <= leadTime;
  const isSafetyBreached = currentStock <= selectedProduct.minStock;

  const handleQuickReorder = (prodId: string, supId: string, qty: number) => {
    setPrefillPO({
      productId: prodId,
      supplierId: supId,
      quantity: qty
    });
    setIsNewPOModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Forecast Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* SKU Selector */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0">
            Select Product:
          </label>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="w-full max-w-md px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name} ({p.currentStock} in stock)
              </option>
            ))}
          </select>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Horizon:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              {[30, 60, 90].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizonDays(h)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    horizonDays === h
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Panel */}
      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Depletion Curve Chart (2 cols) */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Forward Stock Depletion Projection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated using burn rate, reorder thresholds, and active customer demand
                </p>
              </div>

              {/* Demand Sensitivity Slider */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Demand Stress:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={demandMultiplier}
                  onChange={e => setDemandMultiplier(parseFloat(e.target.value))}
                  className="w-20 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">
                  {(demandMultiplier * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <ForecastDepletionChart
              product={selectedProduct}
              horizonDays={horizonDays}
              demandMultiplier={demandMultiplier}
            />
          </div>

          {/* Diagnostic Signals & Risk Matrix (1 col) */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Predictive Risk Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Automated replenishment horizon analysis
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Stockout Date</span>
                  <span className={`text-base font-mono font-bold ${isImminentRisk ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                    {daysUntilStockout <= 0 ? 'Currently Out of Stock' : stockoutDateFormatted}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    ({daysUntilStockout.toFixed(1)} days of coverage remaining)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supplier Fulfillment Gap</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                      Lead Time: {leadTime}d
                    </span>
                    <span className={`text-xs font-mono font-semibold ${isImminentRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {daysUntilStockout < leadTime ? 'CRITICAL DEFICIT' : 'ADEQUATE BUFFER'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isImminentRisk
                      ? `Supplier requires ${leadTime} days to deliver, exceeding current ${daysUntilStockout.toFixed(0)}d inventory.`
                      : `Sufficient runway exists to place standard PO without stockout risk.`}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Optimal Batch Recommendation</span>
                  <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedProduct.reorderQuantity} Units
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Est. PO Commitment: {formatCurrency(selectedProduct.reorderQuantity * selectedProduct.unitCost, settings.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleQuickReorder(selectedProduct.id, selectedProduct.supplierId, selectedProduct.reorderQuantity)}
                className="w-full py-2 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Truck className="w-3.5 h-3.5" />
                Initiate Purchase Order for {selectedProduct.reorderQuantity} Units
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog-Wide Depletion Forecast Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Full Portfolio Stockout Projection & Runway
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated projected depletion dates across all active catalog products
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold text-right">Current Stock</th>
                <th className="px-4 py-3 font-semibold text-right">Burn Rate</th>
                <th className="px-4 py-3 font-semibold text-right">Runway (Days)</th>
                <th className="px-4 py-3 font-semibold">Lead Time vs Stockout</th>
                <th className="px-4 py-3 font-semibold text-right">Quick Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(prod => {
                const sup = suppliers.find(s => s.id === prod.supplierId);
                const lead = sup?.leadTimeDays ?? prod.leadTimeDays ?? 7;
                const burn = prod.dailyDemand || 1;
                const daysLeft = Math.max(0, prod.currentStock / burn);
                const isUnderLead = daysLeft <= lead;

                return (
                  <tr
                    key={prod.id}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedProductId === prod.id
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                      {prod.sku}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {prod.name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {prod.currentStock}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {burn.toFixed(1)} u/d
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                      <span className={daysLeft < lead ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                        {daysLeft.toFixed(0)} Days
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {daysLeft === 0 ? (
                        <span className="text-[10px] font-semibold text-rose-600">Stocked Out</span>
                      ) : isUnderLead ? (
                        <span className="text-[10px] font-semibold text-rose-600">
                          Stockout in {daysLeft.toFixed(0)}d &lt; {lead}d Lead Time
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600">
                          Covered ({lead}d lead time)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleQuickReorder(prod.id, prod.supplierId, prod.reorderQuantity);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        Reorder ({prod.reorderQuantity})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
