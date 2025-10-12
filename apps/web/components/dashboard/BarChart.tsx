'use client';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  height?: number;
}

export function BarChart({ data, title, height = 200 }: BarChartProps) {
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
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const barColor = item.color || '#2979FF';

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer group relative"
                  style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                    boxShadow: `0 0 10px ${barColor}40`,
                  }}
                >
                  {/* Value label on hover */}
                  <div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  >
                    {item.value}
                  </div>
                </div>
              </div>
              <span
                className="text-xs text-center truncate w-full"
                style={{ color: 'var(--re-steel-gray)' }}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
