'use client';
import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent } from '@/components/ui';

interface ProductionKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: number[];
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

// Mini sparkline component
function Sparkline({ points }: { points: number[] }) {
  const W = 60, H = 20;
  const max = Math.max(...points), min = Math.min(...points);
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * (W - 4) + 2;
      const y = H - 2 - ((v - min) / (max - min || 1)) * (H - 6);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70" />
    </svg>
  );
}

export function ProductionKPICard({
  title,
  value,
  change,
  trend,
  icon,
  color = 'blue',
  size = 'md'
}: ProductionKPICardProps) {
  const { language } = useLanguage();

  const colorClasses = {
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      trend: 'text-blue-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    },
    green: {
      icon: 'bg-green-100 text-green-600',
      trend: 'text-green-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    },
    purple: {
      icon: 'bg-purple-100 text-purple-600',
      trend: 'text-purple-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    },
    orange: {
      icon: 'bg-orange-100 text-orange-600',
      trend: 'text-orange-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    },
    red: {
      icon: 'bg-red-100 text-red-600',
      trend: 'text-red-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    },
    gray: {
      icon: 'bg-gray-100 text-gray-600',
      trend: 'text-gray-600',
      change: {
        positive: 'text-green-600',
        negative: 'text-red-600'
      }
    }
  };

  const sizeClasses = {
    sm: {
      card: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-xs',
      value: 'text-lg'
    },
    md: {
      card: 'p-6',
      icon: 'w-10 h-10',
      title: 'text-sm',
      value: 'text-2xl'
    },
    lg: {
      card: 'p-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      value: 'text-3xl'
    }
  };

  const currentColor = colorClasses[color];
  const currentSize = sizeClasses[size];

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className={currentSize.card}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`${currentSize.title} text-gray-600 mb-2`}>{title}</p>
            <div className="flex items-center gap-3 mb-2">
              <p className={`${currentSize.value} font-semibold text-gray-900`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change !== undefined && (
                <div className={`flex items-center text-sm font-medium ${
                  change > 0 ? currentColor.change.positive : currentColor.change.negative
                }`}>
                  {change > 0 ? (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 8v9h-9" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-9.2-9.2M8 8v9h9" />
                    </svg>
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            {trend && (
              <div className={currentColor.trend}>
                <Sparkline points={trend} />
              </div>
            )}
          </div>
          <div className={`${currentSize.icon} ${currentColor.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built KPI cards for common production metrics
export function ActiveProjectsKPI({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  const { language } = useLanguage();
  return (
    <ProductionKPICard
      title={language === 'he' ? 'פרויקטים פעילים' : 'Active Projects'}
      value={value}
      change={change}
      trend={trend}
      color="blue"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      }
    />
  );
}

export function BudgetUsageKPI({ value, change, trend }: { value: string; change?: number; trend?: number[] }) {
  const { language } = useLanguage();
  return (
    <ProductionKPICard
      title={language === 'he' ? 'תקציב בשימוש' : 'Budget Usage'}
      value={value}
      change={change}
      trend={trend}
      color="green"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      }
    />
  );
}

export function TeamMembersKPI({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  const { language } = useLanguage();
  return (
    <ProductionKPICard
      title={language === 'he' ? 'חברי צוות' : 'Team Members'}
      value={value}
      change={change}
      trend={trend}
      color="purple"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      }
    />
  );
}

export function UpcomingDeadlinesKPI({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  const { language } = useLanguage();
  return (
    <ProductionKPICard
      title={language === 'he' ? 'דדליינים קרובים' : 'Upcoming Deadlines'}
      value={value}
      change={change}
      trend={trend}
      color="orange"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}