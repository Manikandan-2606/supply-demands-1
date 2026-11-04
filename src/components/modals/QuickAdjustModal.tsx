import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface QuickAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({ isOpen, onClose, product }) => {
  const { quickAdjustStock } = useApp();
  const [adjustment, setAdjustment] = useState<number>(0);
  const [reason, setReason] = useState('Cycle count physical inventory audit');

  if (!isOpen || !product) return null;

  const newStock = Math.max(0, product.currentStock + adjustment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustment === 0) {
      onClose();
      return;
    }
    quickAdjustStock(product.id, adjustment, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Adjust Physical Stock
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">{product.sku} · {product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current On-Hand</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{product.currentStock}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Resulting Stock</span>
              <span className={`text-xl font-bold font-mono ${newStock < product.currentStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                {newStock}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity Delta (+ to increase, - to decrease)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev - 10)}
                className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev - 1)}
                className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                -1
              </button>
              <input
                type="number"
                value={adjustment}
                onChange={e => setAdjustment(parseInt(e.target.value) || 0)}
                className="w-full text-center px-3 py-1.5 text-sm font-mono font-semibold tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev + 1)}
                className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev + 10)}
                className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                +10
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audit Justification / Reference
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Broken packaging write-off or cycle audit"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
