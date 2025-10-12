'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export function KPICard({ title, value, delta, subtitle, icon, color = '#2979FF', onClick }: KPICardProps) {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-5 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{
        background: 'var(--re-midnight-blue)',
        boxShadow: 'var(--re-shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--re-shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--re-shadow-md)';
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: `${color}20`,
                color: color,
              }}
            >
              {icon}
            </div>
          )}
        </div>
        {delta && (
          <div
            className="px-2.5 py-1 rounded-md text-xs font-semibold"
            style={{
              background: isPositive ? '#10b98120' : isNegative ? '#ef444420' : '#6b728020',
              color: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#9EA7B3',
            }}
          >
            {delta}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--re-steel-gray)' }}
        >
          {title}
        </h3>
        <div
          className="text-3xl font-bold"
          style={{ color: 'var(--re-white)' }}
        >
          {value}
        </div>
        {subtitle && (
          <p
            className="text-xs"
            style={{ color: 'var(--re-steel-gray)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
