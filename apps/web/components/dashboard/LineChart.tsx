'use client';

import { useState } from 'react';

interface LineChartProps {
  data: Array<{ label: string; value: number; date?: string }>;
  title: string;
  height?: number;
  color?: string;
  secondaryColor?: string;
}

export function LineChart({
  data,
  title,
  height = 200,
  color = '#2979FF',
  secondaryColor = '#6EA8FE'
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    date?: string;
  } | null>(null);
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
    return { x, y, label: item.label, value: item.value, date: item.date };
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
          onMouseLeave={() => setHoveredPoint(null)}
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
            fill={`url(#lineGradient-${title})`}
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 0.3s ease' }}
          />

          {/* Interactive overlay areas for hover */}
          {points.map((point, index) => (
            <rect
              key={`hover-${index}`}
              x={point.x - 2}
              y="0"
              width="4"
              height="100"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(point)}
            />
          ))}

          {/* Points */}
          {points.map((point, index) => {
            const isHovered = hoveredPoint?.x === point.x;
            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? '2.5' : '1.5'}
                  fill={isHovered ? secondaryColor : color}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none',
                  }}
                />
                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id={`lineGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md pointer-events-none"
            style={{
              left: `${hoveredPoint.x}%`,
              top: `${hoveredPoint.y}%`,
              transform: 'translate(-50%, -120%)',
              background: 'rgba(14, 26, 43, 0.95)',
              borderColor: color,
              boxShadow: `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${color}40`,
              transition: 'all 0.3s ease',
            }}
          >
            <div className="text-white text-sm font-semibold mb-1">
              {hoveredPoint.label}
            </div>
            {hoveredPoint.date && (
              <div className="text-xs mb-2" style={{ color: '#9EA7B3' }}>
                {hoveredPoint.date}
              </div>
            )}
            <div className="text-2xl font-bold" style={{ color }}>
              {hoveredPoint.value.toLocaleString()}
            </div>
          </div>
        )}

        {/* Labels - Horizontal scroll on mobile */}
        <div className="overflow-x-auto mt-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="flex gap-4 min-w-max">
            {data.map((item, index) => (
              <span
                key={index}
                className="text-xs whitespace-nowrap dark:text-gray-300"
                style={{
                  color: "var(--re-steel-gray)",
                  minWidth: "60px",
                  maxWidth: "120px"
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>      </div>
    </div>
  );
}
