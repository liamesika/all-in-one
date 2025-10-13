'use client';

import { useState } from 'react';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string; date?: string }>;
  title: string;
  height?: number;
}

export function BarChart({ data, title, height = 200 }: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
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
      <div className="relative">
        <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const barColor = item.color || '#2979FF';
            const isHovered = hoveredBar === index;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 cursor-pointer relative"
                    style={{
                      height: `${barHeight}%`,
                      background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                      boxShadow: isHovered
                        ? `0 0 20px ${barColor}80, 0 4px 12px rgba(0, 0, 0, 0.3)`
                        : `0 0 10px ${barColor}40`,
                      transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                      opacity: isHovered ? 1 : 0.9,
                    }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Hover indicator line */}
                    {isHovered && (
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                        style={{
                          background: '#6EA8FE',
                          boxShadow: '0 0 10px #6EA8FE',
                        }}
                      />
                    )}
                  </div>
                </div>
                <span
                  className="text-xs text-center truncate w-full transition-colors duration-300"
                  style={{ color: isHovered ? '#FFFFFF' : 'var(--re-steel-gray)' }}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Enhanced Tooltip */}
        {hoveredBar !== null && (
          <div
            className="absolute z-10 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md pointer-events-none"
            style={{
              left: `${((hoveredBar + 0.5) / data.length) * 100}%`,
              top: '-80px',
              transform: 'translateX(-50%)',
              background: 'rgba(14, 26, 43, 0.95)',
              borderColor: data[hoveredBar].color || '#2979FF',
              boxShadow: `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${data[hoveredBar].color || '#2979FF'}40`,
              transition: 'all 0.3s ease',
            }}
          >
            <div className="text-white text-sm font-semibold mb-1">
              {data[hoveredBar].label}
            </div>
            {data[hoveredBar].date && (
              <div className="text-xs mb-2" style={{ color: '#9EA7B3' }}>
                {data[hoveredBar].date}
              </div>
            )}
            <div
              className="text-2xl font-bold"
              style={{ color: data[hoveredBar].color || '#2979FF' }}
            >
              {data[hoveredBar].value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
