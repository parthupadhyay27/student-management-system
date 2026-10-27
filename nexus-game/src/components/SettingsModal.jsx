import React from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';

export const SettingsModal = ({
  isOpen,
  soundEnabled,
  onToggleSound,
  onTriggerNewGame,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-lg border border-purple-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Settings size={18} />
            </div>
            <h3 className="text-lg font-bold text-white">Simulation Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Audio Synthesizer Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Synthesized Audio Effects</div>
                <div className="text-xs text-slate-400">
                  Real-time Web Audio chimes for purchases, rest, and rewards
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              className={`btn text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${
                soundEnabled
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* New Game / Reset Option */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <RotateCcw size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Reset Game Progress</div>
                <div className="text-xs text-slate-400">
                  Wipes character data and returns to welcome screen
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onTriggerNewGame();
              }}
              className="btn btn-danger text-xs py-1.5 px-3 rounded-lg font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Project Info & Credits */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1.5">
              <GraduationCap size={15} /> NEXUS: LIFE BEYOND CODE
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed as an immersive college student real-life simulation game. Built with React, Vite, Recharts, and Web Audio API. All state is persisted safely in browser local storage.
            </p>
            <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
              <span>Course Project Simulation</span>
              <span className="font-mono text-purple-300">v1.0.0 Stable</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary py-2 px-5 text-xs font-semibold rounded-xl"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
