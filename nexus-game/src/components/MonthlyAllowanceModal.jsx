import React from 'react';
import { Gift, HeartHandshake, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const MonthlyAllowanceModal = ({ isOpen, day, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md border border-purple-500/40">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4 animate-float">
          <Gift size={28} />
        </div>

        <div className="text-center mb-6">
          <span className="badge badge-purple text-xs mb-2">Day {day} Monthly Milestone</span>
          <h3 className="text-xl font-black text-white">Monthly Allowance From Parents</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            A new month has arrived! Your parents sent a bank transfer of <strong className="text-emerald-400 font-mono">₹10,000</strong> to help cover your college expenses, tuition materials, and mess fees.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-white/10 mb-6 flex items-center justify-between">
          <span className="text-xs text-slate-400">Offered Allowance:</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono">+₹10,000</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="btn btn-success flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} /> Accept ₹10,000
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="btn btn-secondary flex-1 py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <HeartHandshake size={16} /> Decline (+5 Happiness)
          </button>
        </div>
      </div>
    </div>
  );
};
