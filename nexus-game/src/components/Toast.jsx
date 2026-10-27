import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        let borderClass = 'border-purple-500/50';
        let bgGrad = 'linear-gradient(135deg, rgba(20, 27, 48, 0.95) 0%, rgba(13, 18, 33, 0.95) 100%)';
        let IconComponent = Info;
        let iconColor = 'text-purple-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/60 shadow-emerald-950/40';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/60 shadow-rose-950/40';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/60 shadow-amber-950/40';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bgGrad,
              backdropFilter: 'blur(12px)',
              pointerEvents: 'auto',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)'
            }}
            className={`p-3.5 rounded-xl border ${borderClass} flex items-start gap-3 transition-all animate-fadeIn`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
              <IconComponent size={18} />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <div className="text-xs font-bold text-white mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-xs text-slate-300 leading-snug">
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
