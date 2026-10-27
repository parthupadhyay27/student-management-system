import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Cake, Sparkles, Trophy, ArrowRight, Heart } from 'lucide-react';

export const BirthdayModal = ({ isOpen, newAge, newLifeStage, oldLifeStage, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      try {
        // Fire confetti blast
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stageChanged = oldLifeStage && newLifeStage !== oldLifeStage;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md border border-pink-500/50 text-center">
        {/* Animated Cake Icon */}
        <div className="w-16 h-16 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto mb-4 animate-bounce">
          <Cake size={32} />
        </div>

        <span className="badge badge-rose text-xs mb-2">
          <Sparkles size={12} className="mr-1" /> Happy Birthday Celebration!
        </span>

        <h3 className="text-2xl font-black text-white mt-1">
          You Turned {newAge}!
        </h3>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Another year of life milestones, academic wisdom, and cherished memories. You received a birthday joy bonus of <strong className="text-pink-400 font-mono">+10 Happiness</strong>!
        </p>

        {/* Life Stage Promotion Card if transitioned */}
        {stageChanged && (
          <div className="mt-4 p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1">
              <Trophy size={14} className="text-amber-400" /> New Life Stage Unlocked: {newLifeStage}
            </div>
            <p className="text-[11px] text-slate-300">
              {newLifeStage === 'WORKING' && 'You graduated into the working workforce! Time for professional career achievements.'}
              {newLifeStage === 'RETIRED' && 'You have reached the golden retirement chapter! Enjoy the fruits of your lifelong efforts.'}
              {newLifeStage === 'STUDENT' && 'You have stepped into college adulthood as an active student!'}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary py-3 px-8 text-xs font-bold rounded-xl flex items-center gap-2"
          >
            Blow Out Candles & Continue <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
