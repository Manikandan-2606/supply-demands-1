import React from 'react';
import { Product } from '../../types';
import { getProductStatus } from '../../utils/calculations';

interface InventoryHealthBarProps {
  products: Product[];
}

export const InventoryHealthBar: React.FC<InventoryHealthBarProps> = ({ products }) => {
  const total = Math.max(1, products.length);

  const counts = {
    healthy: products.filter(p => getProductStatus(p) === 'healthy').length,
    low_stock: products.filter(p => getProductStatus(p) === 'low_stock').length,
    critical: products.filter(p => getProductStatus(p) === 'critical').length,
    out_of_stock: products.filter(p => getProductStatus(p) === 'out_of_stock').length
  };

  const pcts = {
    healthy: (counts.healthy / total) * 100,
    low_stock: (counts.low_stock / total) * 100,
    critical: (counts.critical / total) * 100,
    out_of_stock: (counts.out_of_stock / total) * 100
  };

  return (
    <div className="space-y-3">
      {/* Visual Bar */}
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        {counts.healthy > 0 && (
          <div
            style={{ width: `${pcts.healthy}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Healthy: ${counts.healthy} SKUs (${pcts.healthy.toFixed(0)}%)`}
          />
        )}
        {counts.low_stock > 0 && (
          <div
            style={{ width: `${pcts.low_stock}%` }}
            className="bg-orange-400 transition-all duration-300"
            title={`Reorder Required: ${counts.low_stock} SKUs (${pcts.low_stock.toFixed(0)}%)`}
          />
        )}
        {counts.critical > 0 && (
          <div
            style={{ width: `${pcts.critical}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Critical Low: ${counts.critical} SKUs (${pcts.critical.toFixed(0)}%)`}
          />
        )}
        {counts.out_of_stock > 0 && (
          <div
            style={{ width: `${pcts.out_of_stock}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Out of Stock: ${counts.out_of_stock} SKUs (${pcts.out_of_stock.toFixed(0)}%)`}
          />
        )}
      </div>

      {/* Legend & Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Healthy:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {counts.healthy}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Reorder:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {counts.low_stock}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Critical:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {counts.critical}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Stockout:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
            {counts.out_of_stock}
          </span>
        </div>
      </div>
    </div>
  );
};
