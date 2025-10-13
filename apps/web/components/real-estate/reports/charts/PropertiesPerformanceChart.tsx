'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PropertiesPerformanceChartProps {
  data: Array<{ name: string; views: number; leads: number }>;
  language: string;
}

export function PropertiesPerformanceChart({ data, language }: PropertiesPerformanceChartProps) {
  const title = language === 'he' ? 'ביצועי נכסים' : 'Properties Performance';
  const viewsLabel = language === 'he' ? 'צפיות' : 'Views';
  const leadsLabel = language === 'he' ? 'לידים' : 'Leads';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            width={120}
            tickFormatter={(value) => {
              return value.length > 15 ? value.substring(0, 15) + '...' : value;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="views" fill="#60a5fa" name={viewsLabel} />
          <Bar dataKey="leads" fill="#2979FF" name={leadsLabel} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
