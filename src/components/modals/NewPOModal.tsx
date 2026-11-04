import React, { useState, useEffect } from 'react';
import { X, Truck, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface POLineDraft {
  productId: string;
  quantity: number;
  unitCost: number;
}

export const NewPOModal: React.FC = () => {
  const {
    isNewPOModalOpen,
    setIsNewPOModalOpen,
    suppliers,
    products,
    createReplenishmentOrder,
    settings,
    prefillPO,
    setPrefillPO
  } = useApp();

  const [supplierId, setSupplierId] = useState('');
  const [expectedDays, setExpectedDays] = useState(7);
  const [autoReceiveNow, setAutoReceiveNow] = useState(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<POLineDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNewPOModalOpen) {
      if (prefillPO?.supplierId) {
        setSupplierId(prefillPO.supplierId);
        const s = suppliers.find(sup => sup.id === prefillPO.supplierId);
        if (s) setExpectedDays(s.leadTimeDays);

        if (prefillPO.productId) {
          const p = products.find(prod => prod.id === prefillPO.productId);
          setItems([
            {
              productId: prefillPO.productId,
              quantity: prefillPO.quantity || p?.reorderQuantity || 100,
              unitCost: p?.unitCost || 10
            }
          ]);
        }
      } else {
        const defaultSupplier = suppliers[0];
        setSupplierId(defaultSupplier?.id || '');
        setExpectedDays(defaultSupplier?.leadTimeDays || 7);

        // Filter products for default supplier
        const supProducts = products.filter(p => p.supplierId === defaultSupplier?.id);
        const initialProd = supProducts[0] || products[0];

        if (initialProd) {
          setItems([
            {
              productId: initialProd.id,
              quantity: initialProd.reorderQuantity || 50,
              unitCost: initialProd.unitCost
            }
          ]);
        }
      }
      setError(null);
    }
  }, [isNewPOModalOpen, prefillPO, suppliers, products]);

  if (!isNewPOModalOpen) return null;

  const currentSupplier = suppliers.find(s => s.id === supplierId);
  const availableProducts = products.filter(p => !supplierId || p.supplierId === supplierId);

  const handleSupplierChange = (newSupId: string) => {
    setSupplierId(newSupId);
    const sup = suppliers.find(s => s.id === newSupId);
    if (sup) setExpectedDays(sup.leadTimeDays);

    const supProds = products.filter(p => p.supplierId === newSupId);
    if (supProds.length > 0) {
      setItems([
        {
          productId: supProds[0].id,
          quantity: supProds[0].reorderQuantity,
          unitCost: supProds[0].unitCost
        }
      ]);
    }
  };

  const handleAddItem = () => {
    const candidateList = availableProducts.length > 0 ? availableProducts : products;
    const unused = candidateList.find(p => !items.some(i => i.productId === p.id)) || candidateList[0];
    if (unused) {
      setItems(prev => [
        ...prev,
        {
          productId: unused.id,
          quantity: unused.reorderQuantity || 50,
          unitCost: unused.unitCost
        }
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find(p => p.id === newProductId);
    setItems(prev =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: newProductId,
              unitCost: prod ? prod.unitCost : item.unitCost,
              quantity: prod ? prod.reorderQuantity : item.quantity
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleCostChange = (index: number, cost: number) => {
    setItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, unitCost: Math.max(0, cost) } : item))
    );
  };

  const detailedItems = items.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const totalCost = item.quantity * item.unitCost;
    return {
      ...item,
      product: prod,
      totalCost
    };
  });

  const grandTotal = detailedItems.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + expectedDays);

    const payloadItems = detailedItems.map(item => ({
      productId: item.productId,
      productName: item.product?.name || 'Item',
      sku: item.product?.sku || 'SKU',
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.totalCost
    }));

    createReplenishmentOrder(
      {
        supplierId,
        supplierName: currentSupplier?.name || 'Vendor',
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: deliveryDate.toISOString(),
        status: autoReceiveNow ? 'received' : 'ordered',
        items: payloadItems,
        notes: notes.trim() || (autoReceiveNow ? 'Immediate stock receipt' : 'Regular replenishment order')
      },
      autoReceiveNow
    );

    setPrefillPO(null);
    setIsNewPOModalOpen(false);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Create Replenishment Purchase Order
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Replenish inventory batches with automated stock increase tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNewPOModalOpen(false);
              setPrefillPO(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Supplier *
              </label>
              <select
                value={supplierId}
                onChange={e => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTimeDays}d lead time · {s.rating}★)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={expectedDays}
                onChange={e => setExpectedDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {detailedItems.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <select
                        value={item.productId}
                        onChange={e => handleProductChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.sku} — {p.name} (Current: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 text-xs font-mono tabular-nums text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Cost:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleCostChange(index, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs font-mono tabular-nums text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

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

                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Current stock: {item.product?.currentStock || 0} units
                      {autoReceiveNow && ` ➔ will become ${(item.product?.currentStock || 0) + item.quantity}`}
                    </span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      Total: {formatCurrency(item.totalCost, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fulfillment Mode Toggle */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReceiveNow}
                onChange={e => setAutoReceiveNow(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">
                  Immediate Delivery Receipt (Instant Automatic Stock Increase)
                </span>
                <span className="text-emerald-700/90 dark:text-emerald-400/90 block mt-0.5">
                  Check this if the shipment has already arrived on dock. Will immediately increment warehouse inventory for all items.
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Procurement Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Expedited freight via air cargo, dock bay 4"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Purchase Order Commitment
            </span>
            <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(grandTotal, settings.currency)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsNewPOModalOpen(false);
                setPrefillPO(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              {autoReceiveNow ? 'Receive & Increment Inventory' : 'Dispatch Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
