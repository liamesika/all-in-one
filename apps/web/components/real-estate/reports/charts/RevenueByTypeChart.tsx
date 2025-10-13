'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RevenueByTypeChartProps {
  data: Array<{ type: 'SALE' | 'RENT'; amount: number }>;
  language: string;
}

const COLORS = {
  SALE: '#2979FF',
  RENT: '#34d399',
};

export function RevenueByTypeChart({ data, language }: RevenueByTypeChartProps) {
  const title = language === 'he' ? 'הכנסות לפי סוג עסקה' : 'Revenue by Transaction Type';

  const translateType = (type: string) => {
    if (language === 'he') {
      return type === 'SALE' ? 'מכירה' : 'השכרה';
    }
    return type === 'SALE' ? 'Sale' : 'Rent';
  };

  const formattedData = data.map(item => ({
    ...item,
    displayType: translateType(item.type),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.displayType}: ${formatCurrency(entry.amount)}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="amount"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0E1A2B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend
            wrapperStyle={{ color: '#9CA3AF' }}
            formatter={(value, entry: any) => entry.payload.displayType}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
