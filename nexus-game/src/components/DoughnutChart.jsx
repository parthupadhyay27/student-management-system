import React from 'react';

/**
 * Doughnut Progress Ring for Happiness, Energy, Attendance
 * Displays current percentage vs remaining capacity with centered value
 */
export const DoughnutChart = ({
  title,
  value,
  max = 100,
  unit = '%',
  color = '#8b5cf6',
  colorEnd = '#3b82f6',
  icon: Icon,
  size = 130,
  strokeWidth = 11,
  sublabel
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const remaining = 100 - percentage;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `doughnut-grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>

          {/* Background Ring (Remaining Capacity) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease'
            }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {Icon && (
            <div style={{ color, marginBottom: '2px', opacity: 0.85 }}>
              <Icon size={16} />
            </div>
          )}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1
            }}
          >
            {value}{unit}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '3px'
            }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Capacity breakdown footer */}
      <div
        className="mt-2 text-xs flex items-center justify-between gap-3 text-slate-400"
        style={{
          fontSize: '11px',
          marginTop: '6px',
          padding: '2px 8px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <span style={{ color }}>{percentage}% Active</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: 'var(--text-dim)' }}>{remaining}% Left</span>
      </div>
    </div>
  );
};
