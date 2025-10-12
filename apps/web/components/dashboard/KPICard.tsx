'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  trend?: Array<{ label: string; value: number }>;
}

export function KPICard({ title, value, delta, subtitle, icon, color = '#2979FF', onClick, trend }: KPICardProps) {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');

  return (
    <div
      onClick={onClick}
      className="group rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{
        background: '#1A2F4B',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(41, 121, 255, 0.3)';
        e.currentTarget.style.borderColor = '#2979FF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#1f2937';
      }}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon with gradient background */}
        {icon && (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}AA 100%)`,
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            <div className="text-white">{icon}</div>
          </div>
        )}

        {/* Delta badge */}
        {delta && (
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              background: isPositive ? '#10b98120' : isNegative ? '#ef444420' : '#6b728020',
              color: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#9EA7B3',
            }}
          >
            {delta}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm mb-2" style={{ color: '#9EA7B3' }}>
        {title}
      </h3>

      {/* Value with gradient */}
      <div
        className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text"
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs" style={{ color: '#9EA7B3' }}>
          {subtitle}
        </p>
      )}

      {/* Mini sparkline chart if trend data exists */}
      {trend && trend.length > 0 && (
        <div className="mt-4 flex items-end gap-1 h-8">
          {trend.map((point, index) => {
            const maxValue = Math.max(...trend.map(p => p.value));
            const height = (point.value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 rounded-t transition-all duration-300 group-hover:opacity-80"
                style={{
                  height: `${height}%`,
                  background: color,
                  opacity: 0.6,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
