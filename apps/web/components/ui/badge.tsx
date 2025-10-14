'use client';
// components/ui/badge.tsx - Enhanced Badge Component
// Following Effinity Design System with semantic colors and animations

import React from 'react';

/**
 * Badge Variants
 * Semantic color options following Effinity design system
 */
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'accent'
  | 'outline';

/**
 * Badge Sizes
 * Following 8pt grid system
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Enhanced Badge Component
 * Features: Multiple variants, sizes, dot indicator, removable, with icon
 */
export const Badge = ({
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) => {
  // Variant styles following 60/30/10 Effinity color rule
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-900 text-white',
    primary: 'bg-blue-700 text-white',
    secondary: 'bg-gray-200 text-gray-900',
    success: 'bg-green-700 text-white',
    warning: 'bg-amber-700 text-white',
    error: 'bg-red-700 text-white',
    info: 'bg-blue-600 text-white',
    accent: 'bg-blue-500 text-white',
    outline: 'border-2 border-gray-400 bg-white text-gray-900',
  };

  // Size styles following 8pt grid
  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',      // 8px x 4px padding, 12px text
    md: 'px-2.5 py-1 text-sm',      // 10px x 8px padding, 14px text
    lg: 'px-3 py-1.5 text-sm',      // 12px x 12px padding, 14px text
  };

  // Icon size based on badge size
  const iconSizes: Record<BadgeSize, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      role="status"
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={`
            inline-block rounded-full
            ${size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'}
            ${variant === 'outline' ? 'bg-gray-900' : 'bg-white'}
          `}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && (
        <span className={iconSizes[size]} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Content */}
      <span>{children}</span>

      {/* Remove button */}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`
            inline-flex items-center justify-center rounded-full
            hover:bg-black/10 transition-colors
            ${size === 'sm' ? 'h-3 w-3 -mr-1' : 'h-4 w-4 -mr-1'}
          `}
          aria-label="Remove"
          type="button"
        >
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Status Badge Component
 * Pre-configured for status indicators
 */
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
  size?: BadgeSize;
  className?: string;
}

export const StatusBadge = ({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) => {
  const statusConfig = {
    active: { variant: 'success' as BadgeVariant, label: 'Active' },
    inactive: { variant: 'secondary' as BadgeVariant, label: 'Inactive' },
    pending: { variant: 'warning' as BadgeVariant, label: 'Pending' },
    completed: { variant: 'success' as BadgeVariant, label: 'Completed' },
    failed: { variant: 'error' as BadgeVariant, label: 'Failed' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
};

/**
 * Count Badge Component
 * For notification counts
 */
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const CountBadge = ({
  count,
  max = 99,
  variant = 'error',
  size = 'sm',
  className = '',
}: CountBadgeProps) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  return (
    <Badge variant={variant} size={size} className={className}>
      {displayCount}
    </Badge>
  );
};

/**
 * Badge Group Component
 * For displaying multiple badges together
 */
export interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

export const BadgeGroup = ({
  children,
  className = '',
  spacing = 'normal',
}: BadgeGroupProps) => {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    relaxed: 'gap-3',
  };

  return (
    <div className={`inline-flex flex-wrap items-center ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default Badge;
