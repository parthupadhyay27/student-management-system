import React from 'react';
import {
  Package,
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
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Tag
} from 'lucide-react';

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

export const InventoryView = ({ inventory = [], totalSpent = 0, onNavigateToShop }) => {
  // Aggregate inventory by item id
  const groupedInventory = inventory.reduce((acc, current) => {
    if (!acc[current.id]) {
      acc[current.id] = {
        ...current,
        count: 0,
        totalItemCost: 0,
        purchases: []
      };
    }
    acc[current.id].count += 1;
    acc[current.id].totalItemCost += current.price;
    acc[current.id].purchases.push(current);
    return acc;
  }, {});

  const itemsList = Object.values(groupedInventory);
  const totalItemCount = inventory.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-indigo-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue">Possessions & Purchase Ledger</span>
            <span className="text-xs text-slate-400">• Permanent audit trail</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Student Inventory & Acquisitions</h2>
          <p className="text-sm text-slate-400 mt-1">
            Review all goods, beverages, and entertainment you have acquired throughout your college journey.
          </p>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-center">
            <div className="text-[10px] font-semibold uppercase text-slate-400">Total Items</div>
            <div className="text-xl font-bold text-white font-mono">{totalItemCount}</div>
          </div>
          <div className="p-3 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-center">
            <div className="text-[10px] font-semibold uppercase text-slate-400">Total Spent</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">₹{totalSpent.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {itemsList.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-float">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Your Backpack is Empty</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            You haven't bought anything from the campus market yet. Grab some coffee for energy or pizza for happiness!
          </p>
          <button
            type="button"
            onClick={onNavigateToShop}
            className="btn btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2"
          >
            <ShoppingBag size={16} /> Visit the Shop Now <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {itemsList.map((item) => {
            const IconComponent = ICONS[item.icon] || Package;

            return (
              <div
                key={item.id}
                className="glass-panel p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar: Icon & Quantity Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <IconComponent size={24} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                        x{item.count} Owned
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Title and Cost Breakdown */}
                  <h4 className="text-base font-bold text-white mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Effect details (applied on purchase) */}
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5 space-y-1 mb-3">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                      Applied Effects
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      {item.happiness !== 0 && (
                        <span className="text-pink-300 font-mono">
                          {item.happiness > 0 ? `+${item.happiness}` : item.happiness} Happiness
                        </span>
                      )}
                      {item.energy !== 0 && (
                        <span className="text-sky-300 font-mono">
                          {item.energy > 0 ? `+${item.energy}` : item.energy} Energy
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Price info */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Unit: ₹{item.price}</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    Total: ₹{item.totalItemCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
