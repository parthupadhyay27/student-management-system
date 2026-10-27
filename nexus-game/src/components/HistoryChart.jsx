import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          background: 'rgba(10, 14, 26, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
          fontSize: '12px',
          minWidth: '180px'
        }}
      >
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
          Day {dataPoint.day}: {dataPoint.action || 'Turn'}
        </p>
        {payload.map((entry, idx) => {
          const isMoney = entry.dataKey === 'money' || entry.dataKey === 'totalSpent';
          return (
            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
              <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
                {entry.name}:
              </span>
              <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {isMoney ? `₹${entry.value?.toLocaleString('en-IN')}` : `${entry.value}/100`}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const HistoryChart = ({ history = [] }) => {
  const [viewMode, setViewMode] = useState('combined'); // 'combined' | 'stats' | 'finances'

  // If history has fewer than 2 items, prepare dummy initial data point
  const formattedData = history.length > 0 
    ? history.slice(-20).map((h, i) => ({
        step: i + 1,
        day: h.day || 1,
        label: `D${h.day || 1}`,
        action: h.action || 'Action',
        happiness: h.happiness !== undefined ? h.happiness : (h.resultingStats?.happiness ?? 70),
        energy: h.energy !== undefined ? h.energy : (h.resultingStats?.energy ?? 80),
        attendance: h.attendance !== undefined ? h.attendance : (h.resultingStats?.attendance ?? 85),
        money: h.money !== undefined ? h.money : (h.resultingStats?.money ?? 10000),
        totalSpent: h.totalSpent !== undefined ? h.totalSpent : 0
      }))
    : [
        { step: 1, day: 1, label: 'D1 Start', action: 'Game Started', happiness: 70, energy: 80, attendance: 85, money: 10000, totalSpent: 0 }
      ];

  return (
    <div className="glass-panel p-5">
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" />
            Progression & Life History Chart
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracking stat dynamics and financial trajectories over time
          </p>
        </div>

        {/* View Mode Buttons */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            type="button"
            className={`btn text-xs py-1.5 px-3 rounded-md transition-all ${
              viewMode === 'combined'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setViewMode('combined')}
          >
            Combined (Dual Axis)
          </button>
          <button
            type="button"
            className={`btn text-xs py-1.5 px-3 rounded-md transition-all ${
              viewMode === 'stats'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setViewMode('stats')}
          >
            Stats (0-100)
          </button>
          <button
            type="button"
            className={`btn text-xs py-1.5 px-3 rounded-md transition-all ${
              viewMode === 'finances'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setViewMode('finances')}
          >
            Finances (₹)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />

            {/* Left Y-Axis for Stats (0 - 100) */}
            {(viewMode === 'combined' || viewMode === 'stats') && (
              <YAxis
                yAxisId="statsAxis"
                domain={[0, 100]}
                stroke="#a78bfa"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(167, 139, 250, 0.2)' }}
                tickFormatter={(v) => `${v}%`}
              />
            )}

            {/* Right Y-Axis for Money (₹) */}
            {(viewMode === 'combined' || viewMode === 'finances') && (
              <YAxis
                yAxisId="moneyAxis"
                orientation={viewMode === 'combined' ? 'right' : 'left'}
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(16, 185, 129, 0.2)' }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />

            {/* Render lines according to view mode */}
            {(viewMode === 'combined' || viewMode === 'stats') && (
              <>
                <Line
                  yAxisId="statsAxis"
                  type="monotone"
                  dataKey="happiness"
                  name="Happiness"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#ec4899' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="statsAxis"
                  type="monotone"
                  dataKey="energy"
                  name="Energy"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="statsAxis"
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#f59e0b' }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}

            {(viewMode === 'combined' || viewMode === 'finances') && (
              <Line
                yAxisId="moneyAxis"
                type="monotone"
                dataKey="money"
                name="Money (₹)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 7 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
