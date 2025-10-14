'use client';

// apps/web/components/mobile/MobileDashboard.tsx - EFFINITY Mobile Dashboard Layout
// Single column responsive dashboard with pull-to-refresh

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/lib/gestures';

/**
 * MobileDashboard Props
 */
export interface MobileDashboardProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

/**
 * MobileDashboard Component
 * Optimized dashboard layout for mobile with pull-to-refresh
 */
export function MobileDashboard({
  children,
  onRefresh,
  className = '',
}: MobileDashboardProps) {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh(
    onRefresh || (async () => {})
  );

  return (
    <div
      {...handlers}
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      {/* Pull to Refresh Indicator */}
      {onRefresh && pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          style={{
            height: `${Math.min(pullDistance, 60)}px`,
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <RefreshCw
            className={`w-5 h-5 text-blue-700 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${pullDistance * 3}deg)`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="pb-20">{children}</div>
    </div>
  );
}

/**
 * MobileDashboardHeader
 * Sticky header for mobile dashboard
 */
export function MobileDashboardHeader({
  title,
  subtitle,
  actions,
  className = '',
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="ms-4">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * MobileDashboardSection
 * Section container for dashboard
 */
export function MobileDashboardSection({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 py-4 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/**
 * MobileDashboardGrid
 * Responsive grid for stat cards
 */
export function MobileDashboardGrid({
  children,
  columns = 2,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {children}
    </div>
  );
}

/**
 * MobileDashboardCard
 * Stat card for dashboard
 */
export function MobileDashboardCard({
  title,
  value,
  change,
  icon,
  onClick,
  className = '',
}: {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg p-4
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        transition-transform
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {icon && <div className="text-blue-700 dark:text-blue-400">{icon}</div>}
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
      {change && (
        <p
          className={`text-sm font-medium mt-1 ${
            change.trend === 'up'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
        </p>
      )}
    </div>
  );
}

export default MobileDashboard;
