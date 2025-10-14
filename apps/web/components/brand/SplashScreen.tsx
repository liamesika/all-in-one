'use client';

// apps/web/components/brand/SplashScreen.tsx - EFFINITY Splash Screen
// Full-screen splash with logo animation for app initialization

import React from 'react';
import { Logo } from './Logo';

/**
 * SplashScreen Props
 */
export interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
  message?: string;
  className?: string;
}

/**
 * SplashScreen Component
 * Full-screen branded splash screen with fade animations
 * Auto-dismisses after duration or when onComplete is called
 */
export function SplashScreen({
  onComplete,
  duration = 2000,
  showProgress = false,
  message,
  className = '',
}: SplashScreenProps) {
  const [progress, setProgress] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    // Progress animation
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + (100 / (duration / 50));
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [duration, showProgress]);

  React.useEffect(() => {
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[9999]
        flex flex-col items-center justify-center
        bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF]
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{
        animation: 'fadeIn 300ms ease-in-out',
      }}
    >
      {/* Logo with pulse animation */}
      <div
        className="mb-8"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <Logo size="2xl" variant="white" animated />
      </div>

      {/* Company Name */}
      <h1 className="text-4xl font-semibold text-white tracking-tight mb-4">
        EFFINITY
      </h1>

      {/* Message */}
      {message && (
        <p className="text-lg text-white/80 mb-8">
          {message}
        </p>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Loading Dots */}
      {!showProgress && (
        <div className="flex gap-2">
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}

      {/* Safe Area Insets */}
      <div className="absolute bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export default SplashScreen;
