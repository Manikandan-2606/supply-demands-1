import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Truck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  formatCurrency,
  getProductStatus,
  getStatusLabel,
  getStatusColors
} from '../utils/calculations';
import { exportProductsCSV } from '../utils/csvExport';
import { ProductModal } from '../components/modals/ProductModal';
import { QuickAdjustModal } from '../components/modals/QuickAdjustModal';

type SortField = 'name' | 'sku' | 'currentStock' | 'reorderPoint' | 'unitCost' | 'unitPrice' | 'valuation';
type SortOrder = 'asc' | 'desc';

export const InventoryView: React.FC = () => {
  const {
    products,
    suppliers,
    deleteProduct,
    settings,
    globalSearch,
    setPrefillPO,
    setIsNewPOModalOpen
  } = useApp();

  // Filters & Sorting state
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('currentStock');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const query = (globalSearch || localSearch).trim().toLowerCase();

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search
        if (query) {
          const matchSku = p.sku.toLowerCase().includes(query);
          const matchName = p.name.toLowerCase().includes(query);
          const matchLocation = p.location.toLowerCase().includes(query);
          const matchSupplier = (p.supplierName || '').toLowerCase().includes(query);
          if (!matchSku && !matchName && !matchLocation && !matchSupplier) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          const status = getProductStatus(p);
          if (selectedStatus !== status) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') diff = a.name.localeCompare(b.name);
        else if (sortField === 'sku') diff = a.sku.localeCompare(b.sku);
        else if (sortField === 'currentStock') diff = a.currentStock - b.currentStock;
        else if (sortField === 'reorderPoint') diff = a.reorderPoint - b.reorderPoint;
        else if (sortField === 'unitCost') diff = a.unitCost - b.unitCost;
        else if (sortField === 'unitPrice') diff = a.unitPrice - b.unitPrice;
        else if (sortField === 'valuation') diff = (a.currentStock * a.unitCost) - (b.currentStock * b.unitCost);

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [products, query, selectedCategory, selectedStatus, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleQuickReorder = (product: Product) => {
    setPrefillPO({
      productId: product.id,
      supplierId: product.supplierId,
      quantity: product.reorderQuantity
    });
    setIsNewPOModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-4">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by SKU, product, location..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Health States</option>
            <option value="healthy">Healthy Stock</option>
            <option value="low_stock">Reorder Required</option>
            <option value="critical">Critical Low</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportProductsCSV(products, suppliers)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
                <th
                  onClick={() => handleSort('sku')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    SKU {sortField === 'sku' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Product Specifications {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                <th
                  onClick={() => handleSort('currentStock')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    Stock Level {sortField === 'currentStock' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reorderPoint')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white hidden lg:table-cell whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    Reorder Point {sortField === 'reorderPoint' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitCost')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white hidden sm:table-cell whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    Unit Cost {sortField === 'unitCost' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitPrice')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white hidden sm:table-cell whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    Unit Price {sortField === 'unitPrice' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('valuation')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white hidden xl:table-cell whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    Valuation {sortField === 'valuation' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map(product => {
                  const status = getProductStatus(product);
                  const colors = getStatusColors(status);
                  const daysSupply = Math.max(0, product.currentStock / (product.dailyDemand || 1));
                  const valuation = product.currentStock * product.unitCost;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                        {product.sku}
                      </td>

                      {/* Name & Details */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{product.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.supplierName || 'Unassigned'}</span>
                          <span aria-hidden="true">·</span>
                          <span>~{product.dailyDemand} u/day</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                        {product.category}
                      </td>

                      {/* Current Stock with quantitative status */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {product.currentStock} units
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={`text-[10px] font-medium ${colors.text}`}>
                            {getStatusLabel(status)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({daysSupply.toFixed(0)}d)
                          </span>
                        </div>
                      </td>

                      {/* Reorder Point */}
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300 hidden lg:table-cell tabular-nums">
                        {product.reorderPoint}
                      </td>

                      {/* Unit Cost */}
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300 hidden sm:table-cell tabular-nums">
                        {formatCurrency(product.unitCost, settings.currency)}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white font-medium hidden sm:table-cell tabular-nums">
                        {formatCurrency(product.unitPrice, settings.currency)}
                      </td>

                      {/* Valuation */}
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 hidden xl:table-cell tabular-nums">
                        {formatCurrency(valuation, settings.currency)}
                      </td>

                      {/* Row Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Adjust */}
                          <button
                            onClick={() => setProductToAdjust(product)}
                            title="Reconcile or audit physical stock"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Reorder */}
                          <button
                            onClick={() => handleQuickReorder(product)}
                            title="Issue replenishment purchase order"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setProductToEdit(product);
                              setIsAddModalOpen(true);
                            }}
                            title="Edit product parameters"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            title="Delete product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </span>
          <span className="font-mono">
            Total Filtered Value: {formatCurrency(
              filteredAndSortedProducts.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0),
              settings.currency
            )}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Delete Product?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently remove this product from inventory? This will also clear historical reorder suggestions.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <QuickAdjustModal
        isOpen={Boolean(productToAdjust)}
        onClose={() => setProductToAdjust(null)}
        product={productToAdjust}
      />
    </div>
  );
};
