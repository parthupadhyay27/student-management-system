import React, { useState } from 'react';
import {
  ShoppingBag,
  Coffee,
  Pizza,
  Utensils,
  CupSoda,
  Soup,
  IceCream,
  Candy,
  Cookie,
  Sandwich,
  GlassWater,
  Film,
  Gamepad2,
  Sparkles,
  Zap,
  Smile,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SHOP_ITEMS } from '../constants/gameData';

const ICONS = {
  Coffee,
  Pizza,
  Utensils,
  CupSoda,
  Soup,
  IceCream,
  Candy,
  Cookie,
  Sandwich,
  GlassWater,
  Film,
  Gamepad2
};

export const ShopView = ({ playerMoney, onBuyItem }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'FOOD', 'DRINK', 'ENTERTAINMENT'];

  const filteredItems = SHOP_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-purple-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-purple">Campus Market & Entertainment</span>
            <span className="text-xs text-slate-400">• Immediate stat enhancement</span>
          </div>
          <h2 className="text-2xl font-bold text-white">NEXUS Student Emporium</h2>
          <p className="text-sm text-slate-400 mt-1">
            Fuel your college life with hearty snacks, caffeine boosts, and well-earned recreation.
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="p-3 px-5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
              Available Balance
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ₹{playerMoney.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            ₹
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`btn text-xs py-2 px-4 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white font-semibold shadow-md border-purple-500'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search food, drinks, games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const IconComponent = ICONS[item.icon] || ShoppingBag;
          const canAfford = playerMoney >= item.price;

          return (
            <div
              key={item.id}
              className={`glass-panel p-5 flex flex-col justify-between transition-all duration-200 border ${
                canAfford
                  ? 'hover:border-purple-500/50 hover:shadow-lg hover:-translate-y-1'
                  : 'opacity-70 border-white/5'
              }`}
            >
              <div>
                {/* Header: Icon, Category & Price */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <IconComponent size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white font-mono">
                      ₹{item.price}
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.category === 'FOOD'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : item.category === 'DRINK'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Name and Description */}
                <h4 className="text-base font-bold text-white mb-1">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>

                {/* Stat Effects Pillbox */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {item.happiness !== 0 && (
                    <span
                      className={`badge text-[11px] py-1 px-2.5 font-mono ${
                        item.happiness > 0 ? 'badge-purple' : 'badge-rose'
                      }`}
                    >
                      <Smile size={13} className="mr-0.5" />
                      {item.happiness > 0 ? `+${item.happiness}` : item.happiness} Happiness
                    </span>
                  )}
                  {item.energy !== 0 && (
                    <span
                      className={`badge text-[11px] py-1 px-2.5 font-mono ${
                        item.energy > 0 ? 'badge-blue' : 'badge-amber'
                      }`}
                    >
                      <Zap size={13} className="mr-0.5" />
                      {item.energy > 0 ? `+${item.energy}` : item.energy} Energy
                    </span>
                  )}
                  {item.energy === 0 && item.happiness === 0 && (
                    <span className="badge badge-purple text-[11px]">Neutral Effect</span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onBuyItem(item)}
                disabled={!canAfford}
                className={`btn w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                  canAfford
                    ? 'btn-primary'
                    : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                {canAfford ? (
                  <>
                    <ShoppingBag size={14} /> Buy for ₹{item.price}
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} className="text-rose-400" /> Insufficient Funds
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
