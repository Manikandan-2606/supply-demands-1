import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Download,
  Upload,
  Database,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Settings } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    exportDatabaseJSON,
    importDatabaseJSON,
    products,
    suppliers,
    sales,
    replenishments,
    stockLogs
  } = useApp();

  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [resetConfirm, setResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* General Settings Card */}
      <form onSubmit={handleSave} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-indigo-600" />
              Operational Parameters & Financial Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure currencies, inventory safety buffers and user interface theme
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company / Operating Entity
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency Unit
            </label>
            <select
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value as Settings['currency'] })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            >
              <option value="$">$ (USD - United States Dollar)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="£">£ (GBP - British Pound)</option>
              <option value="¥">¥ (JPY / CNY - Yen / Yuan)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lead Time Safety Buffer (Days)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={formData.leadTimeSafetyBufferDays}
              onChange={e => setFormData({ ...formData, leadTimeSafetyBufferDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Additional cushion added to vendor lead times
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Low Stock Sensitivity (% threshold)
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={formData.lowStockThresholdPct}
              onChange={e => setFormData({ ...formData, lowStockThresholdPct: parseInt(e.target.value) || 20 })}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Triggers visual low-stock warnings
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  formData.theme === 'light'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  formData.theme === 'dark'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* LocalStorage & Data Persistence Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Local Data Persistence & Database Backups
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SupplyIQ stores state persistently in browser localStorage (<code className="font-mono text-indigo-600 dark:text-indigo-400">supplyiq_state_v1</code>). Data survives page reloads.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Products</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">{products.length}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Suppliers</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">{suppliers.length}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sales Orders</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">{sales.length}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Inbound POs</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">{replenishments.length}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stock Audit Logs</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">{stockLogs.length}</span>
          </div>
        </div>

        {/* Backup & Restore Controls */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportDatabaseJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Database Backup (JSON)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore Database from JSON
          </button>

          <button
            type="button"
            onClick={() => setResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Factory Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Reset Demo Data?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will overwrite any modified products, sales, and suppliers and restore the original high-fidelity sample dataset.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
