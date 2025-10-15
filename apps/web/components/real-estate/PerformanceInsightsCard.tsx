'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, Target } from 'lucide-react';
import { UniversalCard } from '@/components/shared';
import { slideUp } from '@/lib/animations/variants';

interface Metric {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
}

export function PerformanceInsightsCard() {
  const metrics: Metric[] = [
    { label: 'Conversion Rate', value: '18.5%', change: 12.3, icon: Target, trend: 'up' },
    { label: 'Avg Response Time', value: '2.4h', change: -15.2, icon: Clock, trend: 'up' },
    { label: 'Active Leads', value: '147', change: 8.7, icon: Users, trend: 'up' },
    { label: 'Revenue', value: '₪1.2M', change: 22.1, icon: DollarSign, trend: 'up' }
  ];

  return (
    <UniversalCard variant="default" className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="w-5 h-5 text-[#2979FF]" />
              <div className={'flex items-center gap-1 text-sm font-medium ' + (metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>
    </UniversalCard>
  );
}
