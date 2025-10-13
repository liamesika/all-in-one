'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadStatusChartProps {
  data: Array<{ status: string; count: number }>;
  language: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: '#2979FF',
  CONTACTED: '#60a5fa',
  QUALIFIED: '#34d399',
  WON: '#10b981',
  LOST: '#ef4444',
};

export function LeadStatusChart({ data, language }: LeadStatusChartProps) {
  const title = language === 'he' ? 'התפלגות סטטוס לידים' : 'Lead Status Distribution';

  const translateStatus = (status: string) => {
    if (language === 'he') {
      const translations: Record<string, string> = {
        NEW: 'חדש',
        CONTACTED: 'ביצע קשר',
        QUALIFIED: 'מוסמך',
        WON: 'זכה',
        LOST: 'אבד',
      };
      return translations[status] || status;
    }
    return status;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="status"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={translateStatus}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            labelFormatter={translateStatus}
          />
          <Bar dataKey="count" fill="#2979FF">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#2979FF'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
