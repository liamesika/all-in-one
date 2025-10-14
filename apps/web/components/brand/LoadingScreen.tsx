'use client';

// apps/web/components/brand/LoadingScreen.tsx - EFFINITY Loading Screen
// Full-page loading overlay with branded spinner

import React from 'react';
import { Logo } from './Logo';

/**
 * LoadingScreen Props
 */
export interface LoadingScreenProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  overlay?: boolean;
  className?: string;
}

/**
 * LoadingScreen Component
 * Full-page or overlay loading screen with EFFINITY branding
 */
export function LoadingScreen({
  message = 'Loading...',
  progress,
  showProgress = false,
  overlay = true,
  className = '',
}: LoadingScreenProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        ${overlay ? 'bg-black/50 backdrop-blur-sm' : 'bg-white dark:bg-gray-900'}
        ${className}
      `}
    >
      {/* Logo with spin animation */}
      <div
        className="mb-6"
        style={{
          animation: 'spin 2s linear infinite',
        }}
      >
        <Logo size="lg" variant={overlay ? 'white' : 'auto'} />
      </div>

      {/* Message */}
      {message && (
        <p
          className={`
            text-lg font-medium mb-4
            ${overlay ? 'text-white' : 'text-gray-900 dark:text-white'}
          `}
        >
          {message}
        </p>
      )}

      {/* Progress Bar */}
      {showProgress && progress !== undefined && (
        <div className="w-64">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p
            className={`
              text-sm text-center
              ${overlay ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}
            `}
          >
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Loading Spinner (if no progress) */}
      {!showProgress && (
        <div className="flex gap-2">
          <div
            className={`
              w-2 h-2 rounded-full animate-bounce
              ${overlay ? 'bg-white' : 'bg-blue-700'}
            `}
            style={{ animationDelay: '0ms' }}
          />
          <div
            className={`
              w-2 h-2 rounded-full animate-bounce
              ${overlay ? 'bg-white' : 'bg-blue-700'}
            `}
            style={{ animationDelay: '150ms' }}
          />
          <div
            className={`
              w-2 h-2 rounded-full animate-bounce
              ${overlay ? 'bg-white' : 'bg-blue-700'}
            `}
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
