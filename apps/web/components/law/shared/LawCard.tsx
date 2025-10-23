/**
 * LawCard - Base card component with Law theme
 * Used across all Law vertical pages
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LawCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  'aria-label'?: string;
  role?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-law-sm',
  md: 'shadow-law-md',
  lg: 'shadow-law-lg',
};

export function LawCard({
  children,
  className,
  hover = false,
  padding = 'md',
  shadow = 'sm',
  onClick,
  'aria-label': ariaLabel,
  role,
}: LawCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      className={cn(
        'law-card',
        'bg-law-surface',
        'border border-law-border',
        'rounded-law-lg',
        paddingClasses[padding],
        shadowClasses[shadow],
        'transition-all duration-law-base',
        hover && 'hover:shadow-law-md hover:-translate-y-0.5',
        isInteractive && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/**
 * LawCardHeader - Header section for LawCard
 */
interface LawCardHeaderProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function LawCardHeader({ children, className, actions }: LawCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  );
}

/**
 * LawCardTitle - Title for LawCard
 */
interface LawCardTitleProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function LawCardTitle({ children, className, level = 3 }: LawCardTitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={cn(
        'text-law-text-primary font-semibold',
        level === 1 && 'text-law-3xl',
        level === 2 && 'text-law-2xl',
        level === 3 && 'text-law-xl',
        level === 4 && 'text-law-lg',
        level === 5 && 'text-law-base',
        level === 6 && 'text-law-sm',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * LawCardDescription - Description text for LawCard
 */
interface LawCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function LawCardDescription({ children, className }: LawCardDescriptionProps) {
  return <p className={cn('text-law-text-secondary text-law-sm mt-1', className)}>{children}</p>;
}

/**
 * LawCardContent - Content area for LawCard
 */
interface LawCardContentProps {
  children: ReactNode;
  className?: string;
}

export function LawCardContent({ children, className }: LawCardContentProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

/**
 * LawCardFooter - Footer section for LawCard
 */
interface LawCardFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function LawCardFooter({ children, className, align = 'right' }: LawCardFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn('flex items-center gap-3 mt-6 pt-4 border-t border-law-border-light', alignClasses[align], className)}>
      {children}
    </div>
  );
}
