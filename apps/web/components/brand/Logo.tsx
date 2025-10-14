'use client';

// apps/web/components/brand/Logo.tsx - EFFINITY Logo Component
// Flexible logo component with size variants and automatic theme switching

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Logo Size Variants
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Logo Variant Types
 */
export type LogoVariant = 'full' | 'icon' | 'white' | 'blue' | 'auto';

/**
 * Logo Props
 */
export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  href?: string;
  animated?: boolean;
  className?: string;
}

/**
 * Size mappings (in pixels)
 */
const SIZE_MAP: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
};

/**
 * Logo Component
 * Displays EFFINITY logo with various size and color variants
 * Supports linking, animations, and theme-aware color switching
 */
export function Logo({
  size = 'md',
  variant = 'auto',
  href,
  animated = false,
  className = '',
}: LogoProps) {
  const dimensions = SIZE_MAP[size];

  // Determine logo source based on variant
  const getLogoSrc = () => {
    if (variant === 'auto') {
      // Auto-detect based on theme (would need theme context in production)
      return '/logo/effinity-logo-full.svg';
    }

    const variantMap = {
      full: '/logo/effinity-logo-full.svg',
      icon: '/logo/effinity-logo-icon.svg',
      white: '/logo/effinity-logo-white.svg',
      blue: '/logo/effinity-logo-blue.svg',
    };

    return variantMap[variant] || '/logo/effinity-logo-full.svg';
  };

  const logoElement = (
    <div
      className={`
        inline-flex items-center justify-center
        ${animated ? 'transition-transform hover:scale-105' : ''}
        ${className}
      `}
      style={{ width: dimensions, height: dimensions }}
    >
      {/* Temporary SVG logo - replace with actual logo files */}
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'transition-all duration-300' : ''}
      >
        {/* E shape made of geometric elements */}
        <rect x="20" y="20" width="50" height="10" rx="2" fill="#2979FF" />
        <rect x="20" y="20" width="10" height="60" rx="2" fill="#2979FF" />
        <rect x="20" y="45" width="40" height="10" rx="2" fill="#60A5FA" />
        <rect x="20" y="70" width="50" height="10" rx="2" fill="#2979FF" />

        {/* Building/house accent on top-right */}
        <path
          d="M 75 25 L 85 25 L 85 35 L 75 35 Z"
          fill="#1A2F4B"
        />
        <path
          d="M 80 20 L 75 25 L 85 25 Z"
          fill="#2979FF"
        />
      </svg>
    </div>
  );

  // Wrap in link if href provided
  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

/**
 * LogoWithText Component
 * Logo with company name text
 */
export function LogoWithText({
  size = 'md',
  variant = 'auto',
  href = '/',
  animated = false,
  className = '',
}: LogoProps) {
  const textSize = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  };

  const content = (
    <div
      className={`
        inline-flex items-center gap-3
        ${animated ? 'transition-transform hover:scale-105' : ''}
        ${className}
      `}
    >
      <Logo size={size} variant={variant} animated={false} />
      <span
        className={`
          ${textSize[size]} font-semibold tracking-tight
          ${variant === 'white' ? 'text-white' : 'text-gray-900 dark:text-white'}
        `}
      >
        EFFINITY
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * LoadingLogo Component
 * Logo with pulsing animation for loading states
 */
export function LoadingLogo({
  size = 'md',
  className = '',
}: {
  size?: LogoSize;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <Logo size={size} animated={false} />
    </div>
  );
}

export default Logo;
