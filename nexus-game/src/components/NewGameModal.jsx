import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

export const NewGameModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md border border-rose-500/40 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <AlertTriangle size={28} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Reset & Start New Game?</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Are you sure you want to begin a new character? Your current game stats, day progression, inventory, and activity history will be reset to defaults.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold rounded-xl"
          >
            Cancel & Keep Playing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} /> Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
};
