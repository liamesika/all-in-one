'use client';

import React from 'react';

// Skeleton loader for text content
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
  animate?: boolean;
}> = ({ lines = 3, className = '', animate = true }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded-md ${animate ? 'animate-shimmer' : ''}`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton: React.FC<{ className?: string; animate?: boolean }> = ({
  className = '',
  animate = true
}) => {
  return (
    <div className={`card p-6 ${className}`}>
      <div className={`h-6 bg-gray-200 rounded-md mb-4 ${animate ? 'animate-shimmer' : ''}`} style={{ width: '60%' }} />
      <div className="space-y-3">
        <div className={`h-4 bg-gray-200 rounded-md ${animate ? 'animate-shimmer' : ''}`} />
        <div className={`h-4 bg-gray-200 rounded-md ${animate ? 'animate-shimmer' : ''}`} style={{ width: '80%' }} />
        <div className={`h-4 bg-gray-200 rounded-md ${animate ? 'animate-shimmer' : ''}`} style={{ width: '70%' }} />
      </div>
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
  animate?: boolean;
}> = ({ rows = 5, cols = 4, className = '', animate = true }) => {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-300 rounded-md ${animate ? 'animate-shimmer' : ''}`}
              style={{ width: '70%' }}
            />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-gray-200 rounded-md ${animate ? 'animate-shimmer' : ''}`}
                  style={{ width: `${Math.random() * 30 + 50}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Spinner component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}> = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className} animate-spin`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Button loading state
export const ButtonLoading: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ children, loading = false, disabled = false, className = '', onClick }) => {
  return (
    <button
      className={`btn-primary relative ${className} ${
        loading || disabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      onClick={loading || disabled ? undefined : onClick}
      disabled={loading || disabled}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Page loading overlay
export const PageLoading: React.FC<{
  message?: string;
  overlay?: boolean;
}> = ({ message = 'Loading...', overlay = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Spinner size="lg" />
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
      </div>
      {message && (
        <p className="text-gray-600 font-medium animate-pulse-slow">{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};

// Progress bar
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  className?: string;
  animated?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}> = ({ progress, className = '', animated = true, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full ${colorClasses[color]} ${
          animated ? 'transition-all duration-500 ease-out' : ''
        }`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

// Dots loading indicator
export const DotsLoading: React.FC<{
  className?: string;
  color?: 'blue' | 'gray';
}> = ({ className = '', color = 'blue' }) => {
  const colorClass = color === 'blue' ? 'bg-blue-600' : 'bg-gray-400';

  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${colorClass} rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
};

// Modern card with loading state
export const LoadingCard: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
}> = ({ loading = false, children, className = '', loadingMessage }) => {
  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Spinner size="md" />
          {loadingMessage && (
            <p className="text-gray-500 text-sm animate-pulse-slow">{loadingMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

// Pulse loading effect for content blocks
export const PulseLoader: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded-md animate-pulse ${className}`} />
  );
};