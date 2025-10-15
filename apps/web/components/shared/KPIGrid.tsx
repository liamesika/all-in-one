'use client';

import React from 'react';

/**
 * KPIGrid Component
 *
 * Responsive grid layout for KPI cards with mobile-optimized breakpoints.
 * Automatically adjusts columns based on screen size:
 * - Mobile (<640px): 1 column
 * - Tablet (640-1024px): 2 columns
 * - Desktop (>1024px): 4 columns
 *
 * This component ensures KPI cards never overflow on mobile devices.
 */

export interface KPIGridProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Number of columns on desktop (default: 4)
   * Mobile: always 1, Tablet: always 2
   */
  desktopColumns?: 2 | 3 | 4 | 5 | 6;
  /**
   * Gap between grid items (default: 4 = 1rem)
   */
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
}

const columnClasses = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

const gapClasses = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
};

export function KPIGrid({
  children,
  className = '',
  desktopColumns = 4,
  gap = 4,
}: KPIGridProps) {
  return (
    <div
      className={`
        grid
        grid-cols-1
        sm:grid-cols-2
        ${columnClasses[desktopColumns]}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * CompactKPIGrid - For 2-column layouts on mobile
 * Best for simple KPIs that can fit side-by-side on small screens
 */
export function CompactKPIGrid({
  children,
  className = '',
  desktopColumns = 4,
  gap = 4,
}: KPIGridProps) {
  return (
    <div
      className={`
        grid
        grid-cols-2
        sm:grid-cols-2
        ${columnClasses[desktopColumns]}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * StatsGrid - For stat bars with minimal content
 * Uses 2 columns on mobile for better space utilization
 */
export function StatsGrid({
  children,
  className = '',
  gap = 3,
}: Omit<KPIGridProps, 'desktopColumns'>) {
  return (
    <div
      className={`
        grid
        grid-cols-2
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default KPIGrid;
