import React, { useState } from 'react';
import { Sparkles, Gamepad2, ArrowRight, User, Calendar, ShieldCheck, Heart, Zap, GraduationCap, Coins } from 'lucide-react';
import { Avatar } from './Avatar';

export const WelcomeScreen = ({ onStartGame }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(19);
  const [error, setError] = useState('');

  const numAge = parseInt(age, 10);
  const lifeStage = !isNaN(numAge) && numAge < 18 ? 'CHILD' : 'STUDENT';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your character name.');
      return;
    }

    if (isNaN(numAge) || numAge < 1 || numAge > 100) {
      setError('Please enter a valid age between 1 and 100.');
      return;
    }

    setError('');
    onStartGame({
      name: trimmedName,
      age: numAge,
      lifeStage
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background cyber ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel max-w-xl w-full p-8 md:p-10 relative z-10 border border-purple-500/30 shadow-2xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={13} className="text-purple-400" /> College Simulation Game
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
            NEXUS
          </h1>
          <p className="text-sm md:text-base font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 uppercase">
            LIFE BEYOND CODE
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Step into the shoes of a college student. Balance finances, manage energy and happiness, attend lectures, and navigate unpredictable campus life.
          </p>
        </div>

        {/* Character Preview Avatar */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Avatar happiness={70} energy={80} lifeStage={lifeStage} size={140} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Life Stage:</span>
            <span className={`badge ${lifeStage === 'CHILD' ? 'badge-blue' : 'badge-purple'}`}>
              {lifeStage === 'CHILD' ? 'Childhood (Under 18)' : 'College Student (18+)'}
            </span>
          </div>
        </div>

        {/* Initial Stat Badges Preview */}
        <div className="grid grid-cols-4 gap-2 mb-8 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-center">
          <div className="p-1.5">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Coins size={15} />
            </div>
            <div className="text-xs font-bold font-mono text-white">₹10,000</div>
            <div className="text-[10px] text-slate-400">Money</div>
          </div>
          <div className="p-1.5">
            <div className="flex items-center justify-center text-pink-400 mb-1">
              <Heart size={15} />
            </div>
            <div className="text-xs font-bold font-mono text-white">70/100</div>
            <div className="text-[10px] text-slate-400">Happy</div>
          </div>
          <div className="p-1.5">
            <div className="flex items-center justify-center text-sky-400 mb-1">
              <Zap size={15} />
            </div>
            <div className="text-xs font-bold font-mono text-white">80/100</div>
            <div className="text-[10px] text-slate-400">Energy</div>
          </div>
          <div className="p-1.5">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <GraduationCap size={15} />
            </div>
            <div className="text-xs font-bold font-mono text-white">85%</div>
            <div className="text-[10px] text-slate-400">Attend</div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <ShieldCheck size={16} className="text-rose-400 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Character Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma, Maya..."
                maxLength={30}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Starting Age (1 - 100)
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">
                {age} Years Old
              </span>
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Age determines your life stage: Below 18 is Child; 18–21 is Student; 22–59 is Working; 60+ is Retired.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3.5 text-sm font-bold rounded-xl mt-6 flex items-center justify-center gap-2 group shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50"
          >
            <Gamepad2 size={18} /> Begin Your Life Simulation <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
