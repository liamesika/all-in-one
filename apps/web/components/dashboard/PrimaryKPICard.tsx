'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface PrimaryKPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  tooltip: string;
  onClick?: () => void;
  href?: string;
}

export function PrimaryKPICard({
  icon,
  label,
  value,
  change,
  trend = 'neutral',
  tooltip,
  onClick,
  href,
}: PrimaryKPICardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      analytics.kpiCardClicked(label, href);
    }

    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const trendColor =
    trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280';

  return (
    <button
      onClick={handleClick}
      className="group relative w-full bg-white dark:bg-[#1A2F4B] rounded-2xl p-6 sm:p-7 border-2 border-gray-100 dark:border-[#2979FF]/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-[#2979FF] hover:-translate-y-1 cursor-pointer text-left min-h-[44px] sm:min-h-[160px]"
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }}
      title={tooltip}
      aria-label={`${label}: ${value}. ${tooltip}`}
    >
      {/* Tooltip Icon */}
      <div className="absolute top-4 right-4">
        <div className="relative group/tooltip">
          <HelpCircle
            size={16}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          />
          <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
            {tooltip}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            {label}
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">
            {value}
          </p>
        </div>
        <div className="ml-4 sm:ml-5 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#2979FF]/10 dark:to-[#2979FF]/5 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-[#2979FF]/20 dark:group-hover:to-[#2979FF]/10 group-hover:scale-110 transition-all duration-300 flex-shrink-0 shadow-sm">
          <div className="text-[#2979FF]">{icon}</div>
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-1 mt-3">
          <p
            className="text-sm font-semibold"
            style={{ color: trendColor }}
          >
            {change}
          </p>
        </div>
      )}

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2979FF] to-[#6EA8FE] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
    </button>
  );
}
