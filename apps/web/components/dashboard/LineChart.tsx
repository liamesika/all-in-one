'use client';

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  height?: number;
}

export function LineChart({ data, title, height = 200 }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-xl p-6 flex items-center justify-center"
        style={{
          background: 'var(--re-midnight-blue)',
          height: `${height}px`,
        }}
      >
        <p style={{ color: 'var(--re-steel-gray)' }}>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 80; // Leave 10% padding top and bottom
    return { x, y, label: item.label, value: item.value };
  });

  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--re-midnight-blue)',
        boxShadow: 'var(--re-shadow-sm)',
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--re-white)' }}
      >
        {title}
      </h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaD}
            fill="url(#lineGradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2979FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#2979FF"
              className="hover:r-2 transition-all"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}

          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2979FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2979FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span
              key={index}
              className="text-xs"
              style={{ color: 'var(--re-steel-gray)' }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
