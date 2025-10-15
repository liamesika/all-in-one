'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * UniversalCard Component
 *
 * Standardized card component used across all verticals (Real Estate, E-Commerce, Law, Productions)
 * Ensures visual consistency with proper spacing, shadows, and hover effects
 *
 * @example
 * <UniversalCard variant="elevated" className="p-6">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </UniversalCard>
 */

export interface UniversalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   * - default: Standard card with subtle shadow
   * - elevated: Card with prominent shadow and glow effect
   * - outlined: Card with border, no shadow
   * - flat: Minimal card with no shadow or border
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';

  /**
   * Whether card should have hover effect
   */
  hoverable?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Card content
   */
  children: React.ReactNode;
}

export function UniversalCard({
  variant = 'default',
  hoverable = false,
  className,
  children,
  ...props
}: UniversalCardProps) {
  const baseStyles = 'rounded-lg transition-all duration-300';

  const variantStyles = {
    default: 'bg-white dark:bg-[#1A2F4B] border border-gray-200 dark:border-[#2979FF]/20 shadow-sm',
    elevated: 'bg-white dark:bg-[#1A2F4B] border border-[#2979FF]/30 shadow-lg',
    outlined: 'bg-white dark:bg-[#1A2F4B] border-2 border-gray-300 dark:border-[#2979FF]/40',
    flat: 'bg-white dark:bg-[#1A2F4B]',
  };

  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer'
    : '';

  const elevatedHoverStyles = variant === 'elevated' && hoverable
    ? 'hover:shadow-[0_0_30px_rgba(41,121,255,0.3)]'
    : '';

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        hoverStyles,
        elevatedHoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function UniversalCardHeader({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between pb-4 border-b border-gray-200 dark:border-[#2979FF]/20',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

/**
 * Card Body Component
 */
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function UniversalCardBody({
  children,
  className,
  ...props
}: CardBodyProps) {
  return (
    <div
      className={cn('py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Footer Component
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function UniversalCardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'pt-4 border-t border-gray-200 dark:border-[#2979FF]/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * KPI Card - Specialized card for displaying metrics
 */
interface KPICardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function KPICard({ icon, label, value, change, className }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <UniversalCard variant="default" hoverable className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p className={cn('mt-2 text-sm font-medium', trendColors[change.trend])}>
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-[#2979FF]/10 rounded-lg">
            <div className="text-[#2979FF] w-6 h-6">
              {icon}
            </div>
          </div>
        )}
      </div>
    </UniversalCard>
  );
}
