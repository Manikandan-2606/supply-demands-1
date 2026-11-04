import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface LineItemDraft {
  productId: string;
  quantity: number;
}

export const NewSaleModal: React.FC = () => {
  const { isNewSaleModalOpen, setIsNewSaleModalOpen, products, createSalesTransaction, settings } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [channel, setChannel] = useState<'B2B Wholesale' | 'Direct eCommerce' | 'Distribution Partner' | 'Retail Store'>('B2B Wholesale');
  const [items, setItems] = useState<LineItemDraft[]>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isNewSaleModalOpen) return null;

  const handleAddItem = () => {
    // Pick first product that isn't already added, or default to first
    const unusedProduct = products.find(p => !items.some(i => i.productId === p.id));
    setItems(prev => [...prev, { productId: unusedProduct?.id || products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, productId: newProductId, quantity: 1 } : item))
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  // Computations
  const detailedItems = items.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const availableStock = prod ? prod.currentStock : 0;
    const unitPrice = prod ? prod.unitPrice : 0;
    const unitCost = prod ? prod.unitCost : 0;
    const lineTotal = unitPrice * item.quantity;
    const isExceedingStock = item.quantity > availableStock;

    return {
      ...item,
      product: prod,
      availableStock,
      unitPrice,
      unitCost,
      lineTotal,
      isExceedingStock
    };
  });

  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalCost = detailedItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;
  const grossMargin = subtotal - totalCost;
  const marginPct = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

  const hasStockViolations = detailedItems.some(i => i.isExceedingStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please provide customer or account name');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    if (hasStockViolations) {
      setError('One or more items exceed current on-hand warehouse inventory.');
      return;
    }

    // Prepare line items
    const payloadItems = detailedItems.map(item => ({
      productId: item.productId,
      productName: item.product?.name || 'Unknown',
      sku: item.product?.sku || 'SKU',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      total: item.lineTotal
    }));

    const result = createSalesTransaction({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'unspecified@account.local',
      channel,
      date: new Date().toISOString(),
      items: payloadItems,
      status: 'completed'
    });

    if (result.success) {
      setIsNewSaleModalOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      setItems([{ productId: products[0]?.id || '', quantity: 1 }]);
    } else {
      setError(result.error || 'Failed to record sales transaction');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Record Sales Transaction
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immediately allocates order and automatically reduces warehouse inventory
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewSaleModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer / Account Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. AeroDynamics Propulsion Corp"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sales Channel
              </label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="B2B Wholesale">B2B Wholesale</option>
                <option value="Direct eCommerce">Direct eCommerce</option>
                <option value="Distribution Partner">Distribution Partner</option>
                <option value="Retail Store">Retail Store</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Email (Optional)
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              placeholder="billing@customer.com"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {detailedItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-colors ${
                    item.isExceedingStock
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Product Selector */}
                    <div className="col-span-12 sm:col-span-6">
                      <select
                        value={item.productId}
                        onChange={e => handleProductChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.sku} — {p.name} ({p.currentStock} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock > 0 ? item.availableStock : 1}
                          value={item.quantity}
                          onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 text-xs font-mono tabular-nums text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-400">qty</span>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="col-span-6 sm:col-span-3 text-right">
                      <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(item.lineTotal, settings.currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        @{formatCurrency(item.unitPrice, settings.currency)} ea
                      </div>
                    </div>

                    {/* Delete Item */}
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock check hint */}
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className={item.isExceedingStock ? 'text-rose-600 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                      Warehouse on-hand: {item.availableStock} units
                    </span>
                    {item.isExceedingStock && (
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Exceeds stock by {item.quantity - item.availableStock}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Summary Box */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Subtotal ({detailedItems.reduce((s, i) => s + i.quantity, 0)} units)</span>
              <span className="font-mono tabular-nums">{formatCurrency(subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-mono tabular-nums">{formatCurrency(tax, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Est. Gross Margin</span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grossMargin, settings.currency)} ({marginPct.toFixed(1)}%)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span>Total Invoice Amount</span>
              <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {formatCurrency(grandTotal, settings.currency)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewSaleModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasStockViolations || items.length === 0}
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              Confirm Sale & Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
