'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadsOverTimeChartProps {
  data: Array<{ date: string; count: number }>;
  language: string;
}

export function LeadsOverTimeChart({ data, language }: LeadsOverTimeChartProps) {
  const title = language === 'he' ? 'לידים לאורך זמן' : 'Leads Over Time';

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
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2979FF"
            strokeWidth={2}
            dot={{ fill: '#2979FF', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
