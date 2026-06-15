import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  icon?: ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, delta, deltaUp, icon, highlight }: StatCardProps) {
  const cardStyle = highlight
    ? { background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', border: 'none', boxShadow: '0 4px 16px oklch(50% 0.26 354 / 0.25)' }
    : undefined;

  const labelColor = highlight ? 'rgba(255,255,255,0.7)' : undefined;
  const valueColor = highlight ? '#fff' : undefined;
  const deltaColor = highlight ? 'rgba(255,255,255,0.65)' : undefined;

  return (
    <div className="card stat-card" style={cardStyle}>
      <div className="stat-label" style={{ color: labelColor }}>
        {icon}
        {label}
      </div>
      <div className="stat-value money" style={{ color: valueColor }}>
        {value}
      </div>
      {delta && (
        <div
          className={`stat-delta ${!highlight && deltaUp ? 'up' : ''}`}
          style={{ color: deltaColor }}
        >
          {deltaUp && !highlight && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {delta}
        </div>
      )}
    </div>
  );
}
