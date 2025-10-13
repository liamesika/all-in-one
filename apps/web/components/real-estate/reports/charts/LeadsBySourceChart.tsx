'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LeadsBySourceChartProps {
  data: Array<{ source: string; count: number; percentage: number }>;
  language: string;
}

const COLORS = ['#2979FF', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function LeadsBySourceChart({ data, language }: LeadsBySourceChartProps) {
  const title = language === 'he' ? 'לידים לפי מקור' : 'Leads by Source';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.source}: ${entry.count}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} (${props.payload.percentage.toFixed(1)}%)`,
              props.payload.source,
            ]}
          />
          <Legend
            wrapperStyle={{ color: '#9CA3AF' }}
            formatter={(value, entry: any) => entry.payload.source}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
