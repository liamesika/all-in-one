'use client';
// components/ui/progress.tsx - Enhanced Progress Components
// Following Effinity Design System with smooth animations

import React from 'react';

/**
 * Progress Variants
 */
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';

/**
 * Progress Sizes
 * Following 8pt grid system
 */
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

/**
 * Enhanced Progress Component
 * Features: Multiple variants, sizes, labels, animations, striped pattern
 */
export const Progress = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className = '',
}: ProgressProps) => {
  // Clamp value between 0 and max
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;

  // Variant colors following Effinity design system
  const variantColors: Record<ProgressVariant, string> = {
    default: 'bg-blue-700',
    success: 'bg-green-700',
    warning: 'bg-amber-600',
    error: 'bg-red-700',
    accent: 'bg-blue-500',
  };

  // Size styles following 8pt grid
  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1',    // 4px height
    md: 'h-2',    // 8px height
    lg: 'h-3',    // 12px height
  };

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">{displayLabel}</span>
          <span className="text-sm font-normal text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}

      <div
        className={`
          relative w-full overflow-hidden rounded-full bg-gray-200
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel}
      >
        <div
          className={`
            h-full transition-all duration-300 ease-out
            ${variantColors[variant]}
            ${striped ? 'bg-stripes' : ''}
            ${animated ? 'animate-progress' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular Progress Component
 * For circular/radial progress indicators
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const CircularProgress = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  label,
  className = '',
}: CircularProgressProps) => {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Variant colors
  const variantColors: Record<ProgressVariant, string> = {
    default: '#1D4ED8',   // blue-700
    success: '#15803D',   // green-700
    warning: '#D97706',   // amber-600
    error: '#B91C1C',     // red-700
    accent: '#3B82F6',    // blue-500
  };

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900">
            {displayLabel}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Multi-Step Progress Component
 * For wizards and multi-step processes
 */
export interface Step {
  label: string;
  description?: string;
  completed?: boolean;
}

export interface MultiStepProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const MultiStepProgress = ({
  steps,
  currentStep,
  className = '',
}: MultiStepProgressProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    border-2 transition-all duration-200 font-semibold text-sm
                    ${
                      isCompleted
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : isCurrent
                        ? 'bg-white border-blue-700 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-semibold ${
                      isCurrent ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 mt-[-24px]
                    transition-colors duration-200
                    ${isCompleted ? 'bg-blue-700' : 'bg-gray-300'}
                  `}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Indeterminate Progress Component
 * For unknown duration operations
 */
export interface IndeterminateProgressProps {
  variant?: ProgressVariant;
  size?: ProgressSize;
  className?: string;
}

export const IndeterminateProgress = ({
  variant = 'default',
  size = 'md',
  className = '',
}: IndeterminateProgressProps) => {
  const variantColors: Record<ProgressVariant, string> = {
    default: 'bg-blue-700',
    success: 'bg-green-700',
    warning: 'bg-amber-600',
    error: 'bg-red-700',
    accent: 'bg-blue-500',
  };

  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div
      className={`
        relative w-full overflow-hidden rounded-full bg-gray-200
        ${sizeStyles[size]}
        ${className}
      `}
      role="progressbar"
      aria-label="Loading..."
      aria-busy="true"
    >
      <div
        className={`
          absolute h-full w-1/3
          ${variantColors[variant]}
          animate-indeterminate-progress
        `}
      />
    </div>
  );
};

/**
 * Progress Ring Component
 * Compact circular progress for small spaces
 */
export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: ProgressVariant;
  className?: string;
}

export const ProgressRing = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  className = '',
}: ProgressRingProps) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const strokeWidths = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  return (
    <CircularProgress
      value={value}
      max={max}
      size={sizes[size]}
      strokeWidth={strokeWidths[size]}
      variant={variant}
      showLabel={false}
      className={className}
    />
  );
};

// Add custom animations to globals.css
export const progressAnimations = `
@keyframes indeterminate-progress {
  0% { left: -33%; }
  100% { left: 100%; }
}

.animate-indeterminate-progress {
  animation: indeterminate-progress 1.5s ease-in-out infinite;
}

.bg-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.animate-progress {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { background-position: 0 0; }
  100% { background-position: 1rem 0; }
}
`;

export default Progress;
