'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle } from 'lucide-react';

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
      className="group relative w-full bg-white dark:bg-[#1A2F4B] rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-[#2979FF]/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-[#2979FF] cursor-pointer text-left min-h-[44px] sm:min-h-[140px]"
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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

      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1">
          <p className="text-base sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
            {value}
          </p>
        </div>
        <div className="ml-3 sm:ml-4 p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#2979FF]/10 dark:to-[#2979FF]/5 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-[#2979FF]/20 dark:group-hover:to-[#2979FF]/10 transition-colors flex-shrink-0">
          <div className="text-[#2979FF]">{icon}</div>
        </div>
      </div>

      {change && (
        <p
          className="text-base sm:text-sm font-medium mt-2"
          style={{ color: trendColor }}
        >
          {change}
        </p>
      )}

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2979FF] to-[#6EA8FE] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
    </button>
  );
}
