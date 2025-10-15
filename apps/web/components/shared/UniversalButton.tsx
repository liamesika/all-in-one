'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * UniversalButton Component
 *
 * Standardized button component used across all verticals
 * Ensures consistent styling, hover effects, and loading states
 *
 * @example
 * <UniversalButton variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </UniversalButton>
 */

export interface UniversalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * - primary: Main brand color (blue)
   * - secondary: Dark navy background
   * - outline: Border with transparent background
   * - ghost: No background, text only
   * - danger: Red for destructive actions
   * - success: Green for positive actions
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

  /**
   * Size of the button
   * - sm: Small (44px height minimum - WCAG touch target compliance)
   * - md: Medium (48px height) - default
   * - lg: Large (56px height)
   * - xl: Extra large (64px height)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether button is in loading state
   */
  loading?: boolean;

  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether button should take full width
   */
  fullWidth?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Button content
   */
  children: React.ReactNode;
}

export function UniversalButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: UniversalButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg',
    'transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full'
  );

  const variantStyles = {
    primary: cn(
      'bg-[#2979FF] text-white',
      'hover:bg-[#1D4ED8] hover:shadow-lg hover:scale-105',
      'focus:ring-[#2979FF]',
      'active:bg-[#1E40AF]'
    ),
    secondary: cn(
      'bg-[#1A2F4B] text-white',
      'hover:bg-[#0E1A2B] hover:shadow-md',
      'focus:ring-[#1A2F4B]',
      'active:bg-[#0A0F18]'
    ),
    outline: cn(
      'border-2 border-[#2979FF] text-[#2979FF] bg-transparent',
      'hover:bg-[#2979FF] hover:text-white',
      'focus:ring-[#2979FF]',
      'dark:border-[#60A5FA] dark:text-[#60A5FA]',
      'dark:hover:bg-[#60A5FA] dark:hover:text-[#0E1A2B]'
    ),
    ghost: cn(
      'bg-transparent text-gray-700 dark:text-gray-200',
      'hover:bg-gray-100 dark:hover:bg-[#1A2F4B]',
      'focus:ring-gray-300'
    ),
    danger: cn(
      'bg-red-600 text-white',
      'hover:bg-red-700 hover:shadow-lg',
      'focus:ring-red-500',
      'active:bg-red-800'
    ),
    success: cn(
      'bg-green-600 text-white',
      'hover:bg-green-700 hover:shadow-lg',
      'focus:ring-green-500',
      'active:bg-green-800'
    ),
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[44px] min-w-[44px]', // WCAG 2.1 AA compliant touch target
    md: 'px-5 py-2.5 text-base min-h-[48px]',
    lg: 'px-6 py-3 text-lg min-h-[56px]',
    xl: 'px-8 py-4 text-xl min-h-[64px]',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {!loading && leftIcon && (
        <span className="w-5 h-5">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="w-5 h-5">{rightIcon}</span>
      )}
    </button>
  );
}

/**
 * IconButton - Button with only an icon (no text)
 */
interface IconButtonProps
  extends Omit<UniversalButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for accessibility
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: '!w-11 !h-11 !min-w-[44px] !min-h-[44px] !p-2', // WCAG 2.1 AA compliant
    md: '!w-12 !h-12 !min-w-[48px] !min-h-[48px] !p-2',
    lg: '!w-14 !h-14 !min-w-[56px] !min-h-[56px] !p-3',
    xl: '!w-16 !h-16 !min-w-[64px] !min-h-[64px] !p-4',
  };

  return (
    <UniversalButton
      variant={variant}
      className={cn(sizeStyles[size], className)}
      {...props}
    >
      <span className="w-5 h-5">{icon}</span>
    </UniversalButton>
  );
}

/**
 * ButtonGroup - Group multiple buttons together
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div className={cn('inline-flex rounded-lg shadow-sm', className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;

        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            !isFirst && 'rounded-l-none border-l-0',
            !isLast && 'rounded-r-none'
          ),
        } as any);
      })}
    </div>
  );
}
