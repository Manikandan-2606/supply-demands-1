import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Download,
  Search,
  Truck,
  Edit2,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';
import { exportSuppliersCSV } from '../utils/csvExport';
import { SupplierModal } from '../components/modals/SupplierModal';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    products,
    deleteSupplier,
    globalSearch,
    setPrefillPO,
    setIsNewPOModalOpen
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const query = (globalSearch || localSearch).trim().toLowerCase();

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (query) {
        const matchName = s.name.toLowerCase().includes(query);
        const matchContact = s.contactPerson.toLowerCase().includes(query);
        const matchEmail = s.email.toLowerCase().includes(query);
        const matchCat = s.categoryFocus.toLowerCase().includes(query);
        if (!matchName && !matchContact && !matchEmail && !matchCat) return false;
      }
      return true;
    });
  }, [suppliers, query, statusFilter]);

  const handleOrderFromSupplier = (supplierId: string) => {
    setPrefillPO({ supplierId });
    setIsNewPOModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSupplier(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search supplier, contact, category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportSuppliersCSV(suppliers)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setSupplierToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredSuppliers.map(supplier => {
          const linkedProducts = products.filter(p => p.supplierId === supplier.id);

          return (
            <div
              key={supplier.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {supplier.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {supplier.categoryFocus} · {supplier.address || 'Facility address on file'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      supplier.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {supplier.status === 'active' ? 'Active Vendor' : 'Inactive'}
                  </span>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lead Time</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {supplier.leadTimeDays} Days
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">On-Time SLA</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {supplier.onTimeDeliveryRate}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quality Rating</span>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      ★ {supplier.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Contact & Terms */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{supplier.contactPerson}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{supplier.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Terms:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{supplier.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Catalog SKUs Supplied:</span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {linkedProducts.length} product(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSupplierToEdit(supplier);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Edit supplier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(supplier.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Delete supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOrderFromSupplier(supplier.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Create Purchase Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
          No suppliers matching your search criteria.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Delete Supplier?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this vendor? Note that suppliers with active products assigned cannot be removed until products are reassigned.
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
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      <SupplierModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};
