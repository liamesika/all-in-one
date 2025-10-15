'use client';

interface PieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
}

const DEFAULT_COLORS = [
  '#2979FF',
  '#6EA8FE',
  '#4A90E2',
  '#7B68EE',
  '#20B2AA',
  '#FFB347',
  '#FF6B6B',
  '#4ECDC4',
];

export function PieChart({ data, title }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-xl p-6 flex items-center justify-center"
        style={{
          background: 'var(--re-midnight-blue)',
          height: '280px',
        }}
      >
        <p style={{ color: 'var(--re-steel-gray)' }}>No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate pie slices
  let currentAngle = -90; // Start at top
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Calculate arc path
    const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;

    const pathD =
      angle === 360
        ? `M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0`
        : `M 50,50 L ${startX},${startY} A 40,40 0 ${largeArc},1 ${endX},${endY} Z`;

    currentAngle = endAngle;

    return {
      path: pathD,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    };
  });

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
        style={{ color: "var(--re-white)", maxWidth: "150px" }}
      >
        {title}
      </h3>
      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-48 h-48">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={slice.path}
                  fill={slice.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    filter: `drop-shadow(0 0 8px ${slice.color}40)`,
                  }}
                >
                  <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
                </path>
              </g>
            ))}
            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="var(--re-midnight-blue)" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{
                    background: slice.color,
                    boxShadow: `0 0 8px ${slice.color}40`,
                  }}
                />
                <span
                  className="text-sm truncate dark:text-white"
                  style={{ color: "var(--re-white)", maxWidth: "150px" }}
                  title={slice.label}
                >
                  {slice.label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-sm font-semibold dark:text-white"
                  style={{ color: "var(--re-white)", maxWidth: "150px" }}
                >
                  {slice.value}
                </span>
                <span
                  className="text-xs dark:text-gray-300"
                  style={{ color: 'var(--re-steel-gray)' }}
                >
                  ({slice.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
