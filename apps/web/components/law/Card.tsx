import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'gradient';
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared Card component for the Law vertical
 *
 * Default styling: rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7
 *
 * Usage:
 * <Card>
 *   <CardTitle>My Title</CardTitle>
 *   <CardActions>
 *     <button>Action</button>
 *   </CardActions>
 *   Content goes here
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 */
export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseStyles = 'rounded-2xl border p-6 md:p-7 transition-all duration-300';

  const variantStyles = {
    default: 'border-white/10 bg-white/5',
    elevated: 'border-white/10 bg-gradient-to-br from-[#0f1a2c] to-[#1a2841] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
    gradient: 'border-white/10 bg-gradient-to-br from-[#1e3a5f]/30 to-[#0f1a2c]/50',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card title section - typically at the top of the card
 */
export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card actions section - typically buttons or interactive elements
 * Often used in the top-right corner with flex justify-between
 */
export function CardActions({ children, className = '' }: CardActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card footer section - typically at the bottom of the card
 */
export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}
