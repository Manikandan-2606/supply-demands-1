import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-500/30';
        let iconClass = 'text-emerald-500';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/30';
          iconClass = 'text-rose-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30';
          iconClass = 'text-amber-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-indigo-500/30';
          iconClass = 'text-indigo-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border ${borderClass} flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
