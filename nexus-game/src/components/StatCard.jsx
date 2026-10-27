import React from 'react';

/**
 * StatCard displays an individual metric with icon, current value,
 * progress/max indicator, and recent delta (+/-) pill.
 */
export const StatCard = ({
  title,
  value,
  formattedValue,
  max,
  unit = '',
  icon: Icon,
  accentColor = '#8b5cf6',
  badgeClass = 'badge-purple',
  delta = null,
  subtitle,
  onClick
}) => {
  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;

  return (
    <div
      className="glass-panel stat-card glass-panel-interactive flex flex-col justify-between"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        minHeight: '135px'
      }}
      onClick={onClick}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="stat-icon-wrapper"
            style={{
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}35`
            }}
          >
            {Icon && <Icon size={22} />}
          </div>
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {title}
            </h4>
            {subtitle && (
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Delta Chip */}
        {delta !== null && delta !== undefined && delta !== 0 && (
          <div
            className={`badge ${isPositive ? 'badge-emerald' : 'badge-rose'}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            {isPositive ? `+${delta}` : delta}
            {unit}
          </div>
        )}
      </div>

      {/* Main Value Display */}
      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {formattedValue !== undefined ? formattedValue : value}
          </span>
          {max && (
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              / {max}{unit}
            </span>
          )}
        </div>

        {/* Mini progress bar if max exists */}
        {max && (
          <div
            style={{
              width: '80px',
              height: '6px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, (value / max) * 100))}%`,
                height: '100%',
                background: accentColor,
                borderRadius: '9999px',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
