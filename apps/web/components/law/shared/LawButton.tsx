/**
 * LawButton - Button component with Law theme
 * Supports primary, secondary, ghost, and destructive variants
 */

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LawButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'law-button-primary bg-law-primary text-law-text-inverse hover:bg-law-primary-hover active:bg-law-primary-pressed',
  secondary: 'law-button-secondary bg-transparent text-law-primary border border-law-border hover:bg-law-primary-subtle hover:border-law-primary',
  ghost: 'bg-transparent text-law-secondary hover:bg-law-secondary-light hover:text-law-primary',
  destructive: 'bg-law-error text-white hover:bg-red-700 active:bg-red-800',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-law-sm',
  md: 'px-4 py-2.5 text-law-base',
  lg: 'px-6 py-3 text-law-lg',
};

export const LawButton = forwardRef<HTMLButtonElement, LawButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-semibold',
          'rounded-law-md',
          'transition-all duration-law-fast',
          'focus:outline-none focus:ring-2 focus:ring-law-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          // Mobile: minimum 44px tap target
          size === 'sm' && 'min-h-[44px] md:min-h-[36px]',
          size === 'md' && 'min-h-[44px]',
          size === 'lg' && 'min-h-[48px]',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

LawButton.displayName = 'LawButton';
