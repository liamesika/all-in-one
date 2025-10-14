'use client';

// apps/web/components/brand/LogoSpinner.tsx - EFFINITY Logo Spinner
// Small loading spinner with logo for inline use

import React from 'react';
import { Logo, LogoSize } from './Logo';

/**
 * LogoSpinner Props
 */
export interface LogoSpinnerProps {
  size?: LogoSize;
  speed?: 'slow' | 'normal' | 'fast';
  variant?: 'spin' | 'pulse' | 'bounce';
  className?: string;
}

/**
 * LogoSpinner Component
 * Animated logo spinner for buttons, cards, and inline loading states
 */
export function LogoSpinner({
  size = 'sm',
  speed = 'normal',
  variant = 'spin',
  className = '',
}: LogoSpinnerProps) {
  const speedMap = {
    slow: '3s',
    normal: '2s',
    fast: '1s',
  };

  const animationMap = {
    spin: `spin ${speedMap[speed]} linear infinite`,
    pulse: `pulse ${speedMap[speed]} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
    bounce: `bounce ${speedMap[speed]} infinite`,
  };

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        animation: animationMap[variant],
      }}
      aria-label="Loading"
      role="status"
    >
      <Logo size={size} animated={false} />
    </div>
  );
}

/**
 * ButtonSpinner Component
 * Optimized spinner for button loading states
 */
export function ButtonSpinner({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <LogoSpinner size="xs" speed="fast" variant="spin" />
      <span>Loading...</span>
    </div>
  );
}

/**
 * CardSpinner Component
 * Centered spinner for card loading states
 */
export function CardSpinner({
  message,
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LogoSpinner size="md" speed="normal" variant="spin" />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * InlineSpinner Component
 * Tiny spinner for inline text
 */
export function InlineSpinner({
  className = '',
}: {
  className?: string;
}) {
  return (
    <LogoSpinner
      size="xs"
      speed="fast"
      variant="spin"
      className={`inline-block align-middle ${className}`}
    />
  );
}

export default LogoSpinner;
