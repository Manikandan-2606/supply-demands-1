import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  'Electronics',
  'Mechanical',
  'Raw Materials',
  'Packaging',
  'Accessories',
  'Office Hardware'
] as const;

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, editProduct, suppliers, settings } = useApp();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics' as Product['category'],
    currentStock: 0,
    minStock: 20,
    reorderPoint: 50,
    reorderQuantity: 100,
    unitCost: 10.0,
    unitPrice: 20.0,
    supplierId: '',
    location: 'Warehouse A · Bay 01',
    leadTimeDays: 7,
    dailyDemand: 2.5
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        name: productToEdit.name,
        category: productToEdit.category,
        currentStock: productToEdit.currentStock,
        minStock: productToEdit.minStock,
        reorderPoint: productToEdit.reorderPoint,
        reorderQuantity: productToEdit.reorderQuantity,
        unitCost: productToEdit.unitCost,
        unitPrice: productToEdit.unitPrice,
        supplierId: productToEdit.supplierId,
        location: productToEdit.location,
        leadTimeDays: productToEdit.leadTimeDays,
        dailyDemand: productToEdit.dailyDemand
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
        name: '',
        category: 'Electronics',
        currentStock: 50,
        minStock: 15,
        reorderPoint: 35,
        reorderQuantity: 100,
        unitCost: 15.0,
        unitPrice: 30.0,
        supplierId: suppliers[0]?.id || '',
        location: 'Warehouse A · Bay 01',
        leadTimeDays: suppliers[0]?.leadTimeDays || 7,
        dailyDemand: 3.0
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, suppliers]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU identifier is required';
    if (formData.currentStock < 0) errs.currentStock = 'Stock cannot be negative';
    if (formData.reorderPoint < 0) errs.reorderPoint = 'Reorder point must be 0 or more';
    if (formData.reorderQuantity <= 0) errs.reorderQuantity = 'Reorder quantity must be > 0';
    if (formData.unitCost < 0) errs.unitCost = 'Unit cost must be 0 or more';
    if (formData.unitPrice < 0) errs.unitPrice = 'Unit price must be 0 or more';
    if (!formData.supplierId) errs.supplierId = 'Please select a supplier';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (productToEdit) {
      editProduct(productToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {productToEdit ? 'Edit Product Specifications' : 'Register New Inventory Product'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure SKU tracking, stock thresholds, supplier linkages and unit economics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Precision Servo Motor 24V"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SKU Identifier *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. MC-SRV-24"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Supplier *
              </label>
              <select
                value={formData.supplierId}
                onChange={e => {
                  const s = suppliers.find(sup => sup.id === e.target.value);
                  setFormData({
                    ...formData,
                    supplierId: e.target.value,
                    leadTimeDays: s ? s.leadTimeDays : formData.leadTimeDays
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a vendor...</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.leadTimeDays}d lead time)
                  </option>
                ))}
              </select>
              {errors.supplierId && <p className="text-xs text-rose-500 mt-1">{errors.supplierId}</p>}
            </div>
          </div>

          {/* Stock Metrics Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Inventory Controls & Reorder Thresholds
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                {errors.currentStock && <p className="text-xs text-rose-500 mt-1">{errors.currentStock}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Min Safety Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={e => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Batch Order Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reorderQuantity}
                  onChange={e => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Cost ({settings.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitCost}
                  onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price ({settings.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Est. Daily Demand
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.dailyDemand}
                onChange={e => setFormData({ ...formData, dailyDemand: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Warehouse B · Bay 04"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={e => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
