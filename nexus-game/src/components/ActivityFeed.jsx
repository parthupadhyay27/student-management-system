import React from 'react';
import { 
  History, 
  Sparkles, 
  ShoppingBag, 
  GraduationCap, 
  Moon, 
  Coffee, 
  Gift, 
  AlertCircle,
  Clock
} from 'lucide-react';

const getActionIcon = (action = '') => {
  const act = action.toLowerCase();
  if (act.includes('sleep') || act.includes('rest')) return <Moon size={15} className="text-indigo-400" />;
  if (act.includes('class') || act.includes('attend') || act.includes('skip')) return <GraduationCap size={15} className="text-amber-400" />;
  if (act.includes('buy') || act.includes('shop') || act.includes('purchased')) return <ShoppingBag size={15} className="text-emerald-400" />;
  if (act.includes('birthday')) return <Gift size={15} className="text-pink-400" />;
  if (act.includes('event') || act.includes('surprise') || act.includes('pocket') || act.includes('allowance')) return <Sparkles size={15} className="text-purple-400" />;
  return <Clock size={15} className="text-slate-400" />;
};

export const ActivityFeed = ({ history = [], limit = 15 }) => {
  const recentActivities = [...history].reverse().slice(0, limit);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History size={16} className="text-purple-400" />
          Recent Activity & Log
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {history.length} logged events
        </span>
      </div>

      {recentActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center flex-1 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 text-slate-500">
            <Clock size={20} />
          </div>
          <p className="text-xs font-medium text-slate-300">No actions recorded yet</p>
          <p className="text-[11px] text-slate-500 max-w-[200px] mt-1">
            Attend class, rest, or buy items in the shop to see your journey recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 max-h-[380px]">
          {recentActivities.map((entry) => (
            <div
              key={entry.id || `${entry.day}-${entry.timestamp}`}
              className="p-2.5 rounded-lg transition-all hover:bg-white/[0.03] border border-white/[0.04] flex items-start gap-3"
            >
              {/* Icon Container */}
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getActionIcon(entry.action)}
              </div>

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {entry.action}
                  </span>
                  <span className="text-[10px] text-purple-300/80 font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                    Day {entry.day}
                  </span>
                </div>

                {entry.details && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {entry.details}
                  </p>
                )}

                {/* Stat Delta chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {entry.moneyChange !== undefined && entry.moneyChange !== 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        entry.moneyChange > 0
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {entry.moneyChange > 0 ? `+₹${entry.moneyChange}` : `-₹${Math.abs(entry.moneyChange)}`}
                    </span>
                  )}

                  {entry.happinessChange !== undefined && entry.happinessChange !== 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        entry.happinessChange > 0
                          ? 'text-pink-400 bg-pink-500/10 border border-pink-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {entry.happinessChange > 0 ? `+${entry.happinessChange}` : entry.happinessChange} Happy
                    </span>
                  )}

                  {entry.energyChange !== undefined && entry.energyChange !== 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        entry.energyChange > 0
                          ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20'
                          : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {entry.energyChange > 0 ? `+${entry.energyChange}` : entry.energyChange} Energy
                    </span>
                  )}

                  {entry.attendanceChange !== undefined && entry.attendanceChange !== 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        entry.attendanceChange > 0
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {entry.attendanceChange > 0 ? `+${entry.attendanceChange}` : entry.attendanceChange}% Attnd
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
