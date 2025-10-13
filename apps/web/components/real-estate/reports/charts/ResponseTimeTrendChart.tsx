'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ResponseTimeTrendChartProps {
  data: Array<{ date: string; avgHours: number }>;
  language: string;
}

export function ResponseTimeTrendChart({ data, language }: ResponseTimeTrendChartProps) {
  const title = language === 'he' ? 'מגמת זמן תגובה' : 'Response Time Trend';
  const targetLabel = language === 'he' ? 'יעד: 24 שעות' : 'Target: 24h';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}h`, language === 'he' ? 'ממוצע' : 'Avg']}
          />
          <ReferenceLine y={24} stroke="#ef4444" strokeDasharray="3 3" label={{ value: targetLabel, fill: '#ef4444' }} />
          <Line
            type="monotone"
            dataKey="avgHours"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ fill: '#34d399', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
