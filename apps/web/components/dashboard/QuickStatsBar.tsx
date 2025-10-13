'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: string;
}

interface QuickStatsBarProps {
  stats: QuickStat[];
}

export function QuickStatsBar({ stats }: QuickStatsBarProps) {
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4" />;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return '#9EA7B3';
    if (change > 0) return '#10B981';
    return '#EF4444';
  };

  return (
    <div
      className="rounded-xl p-4 mb-6 shadow-xl border border-gray-800"
      style={{ background: '#1A2F4B' }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const trendColor = getTrendColor(stat.change);

          return (
            <div
              key={index}
              className="flex flex-col items-center md:items-start p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              {/* Label */}
              <div className="text-xs font-medium mb-1" style={{ color: '#9EA7B3' }}>
                {stat.label}
              </div>

              {/* Value */}
              <div className="text-2xl font-bold text-white mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>

              {/* Change Indicator */}
              {stat.change !== undefined && (
                <div className="flex items-center gap-1">
                  <div style={{ color: trendColor }}>
                    {getTrendIcon(stat.change)}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: trendColor }}
                  >
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                    {stat.changeLabel && (
                      <span className="ml-1 font-normal" style={{ color: '#9EA7B3' }}>
                        {stat.changeLabel}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
