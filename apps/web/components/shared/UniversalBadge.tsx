'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * UniversalBadge Component
 *
 * Standardized badge component for status indicators, labels, and tags
 * Used consistently across all verticals
 *
 * @example
 * <UniversalBadge variant="success">Active</UniversalBadge>
 * <UniversalBadge variant="warning" size="lg">Pending</UniversalBadge>
 */

export interface UniversalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant of the badge
   * - default: Gray background
   * - primary: Brand blue
   * - success: Green (completed, active, success states)
   * - warning: Amber (pending, in-progress)
   * - error: Red (failed, blocked, error states)
   * - info: Blue (informational)
   * - purple: Purple (special status)
   * - outline: Transparent with border
   */
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'purple'
    | 'outline';

  /**
   * Size of the badge
   * - sm: Small (text-xs, px-2, py-0.5)
   * - md: Medium (text-sm, px-2.5, py-1) - default
   * - lg: Large (text-base, px-3, py-1.5)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether badge should have rounded pill shape
   */
  pill?: boolean;

  /**
   * Icon to display before text
   */
  icon?: React.ReactNode;

  /**
   * Whether badge should have dot indicator
   */
  dot?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Badge content
   */
  children: React.ReactNode;
}

export function UniversalBadge({
  variant = 'default',
  size = 'md',
  pill = false,
  icon,
  dot = false,
  className,
  children,
  ...props
}: UniversalBadgeProps) {
  const baseStyles = cn(
    'inline-flex items-center gap-1.5',
    'font-semibold',
    'transition-colors duration-200',
    pill ? 'rounded-full' : 'rounded-md'
  );

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-[#2979FF]/10 text-[#2979FF] dark:bg-[#2979FF]/20 dark:text-[#60A5FA]',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    outline: 'bg-transparent border-2 border-current text-gray-700 dark:text-gray-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-[#2979FF]',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    outline: 'bg-gray-500',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

/**
 * StatusBadge - Pre-configured badges for common status states
 */
interface StatusBadgeProps extends Omit<UniversalBadgeProps, 'variant'> {
  status:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'completed'
    | 'failed'
    | 'draft'
    | 'published'
    | 'archived'
    | 'in-progress'
    | 'on-hold';
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig: Record<
    StatusBadgeProps['status'],
    { variant: UniversalBadgeProps['variant']; label: string }
  > = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'error', label: 'Failed' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'primary', label: 'Published' },
    archived: { variant: 'default', label: 'Archived' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    'on-hold': { variant: 'warning', label: 'On Hold' },
  };

  const config = statusConfig[status];

  return (
    <UniversalBadge variant={config.variant} dot {...props}>
      {config.label}
    </UniversalBadge>
  );
}

/**
 * CountBadge - Badge for displaying counts/numbers
 */
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: UniversalBadgeProps['variant'];
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = 'primary',
  className,
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <UniversalBadge
      variant={variant}
      size="sm"
      pill
      className={cn('min-w-[20px] justify-center', className)}
    >
      {displayCount}
    </UniversalBadge>
  );
}

/**
 * NotificationBadge - Small badge for notification indicators
 */
interface NotificationBadgeProps {
  count?: number;
  variant?: 'primary' | 'error';
  className?: string;
}

export function NotificationBadge({
  count,
  variant = 'error',
  className,
}: NotificationBadgeProps) {
  if (count === 0 || count === undefined) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1',
        'inline-flex items-center justify-center',
        'min-w-[18px] h-[18px] px-1',
        'text-[10px] font-bold text-white',
        'rounded-full',
        variant === 'primary' ? 'bg-[#2979FF]' : 'bg-red-500',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
