'use client';
// components/ui/skeleton.tsx - Enhanced Loading Skeleton Components
// Following Effinity Design System with 8pt grid and smooth animations

import React from 'react';

/**
 * Base Skeleton Component
 * Provides shimmer loading effect for async content
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
  ...props
}: SkeletonProps) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `.trim()}
      style={style}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
};

/**
 * Skeleton Text Component
 * Pre-configured for text loading states
 */
export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

export const SkeletonText = ({
  lines = 3,
  className = '',
  spacing = 'normal',
}: SkeletonTextProps) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`} role="status" aria-label="Loading text...">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className="h-4"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Avatar Component
 * Pre-configured for avatar/profile picture loading
 */
export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SkeletonAvatar = ({
  size = 'md',
  className = '',
}: SkeletonAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
      aria-label="Loading avatar..."
    />
  );
};

/**
 * Skeleton Card Component
 * Pre-configured for card loading states
 */
export interface SkeletonCardProps {
  className?: string;
  hasImage?: boolean;
  imageHeight?: number;
  hasAvatar?: boolean;
}

export const SkeletonCard = ({
  className = '',
  hasImage = false,
  imageHeight = 192,
  hasAvatar = false,
}: SkeletonCardProps) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}
      role="status"
      aria-label="Loading card..."
    >
      {hasImage && (
        <Skeleton
          variant="rounded"
          className="mb-4"
          height={imageHeight}
        />
      )}

      {hasAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" className="h-3" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Skeleton variant="text" className="h-6" width="80%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
};

/**
 * Skeleton Table Component
 * Pre-configured for table loading states
 */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  hasHeader?: boolean;
}

export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className = '',
  hasHeader = true,
}: SkeletonTableProps) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}
      role="status"
      aria-label="Loading table..."
    >
      {hasHeader && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant="text" className="h-4" />
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  className="h-4"
                  width={`${60 + Math.random() * 30}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton Button Component
 * Pre-configured for button loading states
 */
export interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const SkeletonButton = ({
  size = 'md',
  className = '',
  fullWidth = false,
}: SkeletonButtonProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-12',
  };

  const widthClass = fullWidth ? 'w-full' : 'w-24';

  return (
    <Skeleton
      variant="rounded"
      className={`${sizeClasses[size]} ${widthClass} ${className}`}
      aria-label="Loading button..."
    />
  );
};

/**
 * Skeleton List Component
 * Pre-configured for list item loading states
 */
export interface SkeletonListProps {
  items?: number;
  className?: string;
  hasAvatar?: boolean;
  hasAction?: boolean;
}

export const SkeletonList = ({
  items = 5,
  className = '',
  hasAvatar = false,
  hasAction = false,
}: SkeletonListProps) => {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading list...">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white"
        >
          {hasAvatar && <SkeletonAvatar size="md" />}

          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" className="h-3" />
          </div>

          {hasAction && (
            <SkeletonButton size="sm" />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Dashboard Component
 * Pre-configured for dashboard page loading
 */
export const SkeletonDashboard = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`space-y-8 ${className}`} role="status" aria-label="Loading dashboard...">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="space-y-3">
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" className="h-8" width="70%" />
              <Skeleton variant="text" className="h-3" width="60%" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard hasImage imageHeight={256} />
        </div>
        <div>
          <SkeletonList items={3} hasAvatar />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Form Component
 * Pre-configured for form loading states
 */
export interface SkeletonFormProps {
  fields?: number;
  className?: string;
  hasSubmitButton?: boolean;
}

export const SkeletonForm = ({
  fields = 4,
  className = '',
  hasSubmitButton = true,
}: SkeletonFormProps) => {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-label="Loading form...">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="30%" className="h-4" />
          <Skeleton variant="rounded" className="h-11" />
        </div>
      ))}

      {hasSubmitButton && (
        <div className="flex gap-3 pt-4">
          <SkeletonButton size="lg" />
          <SkeletonButton size="lg" />
        </div>
      )}
    </div>
  );
};

/**
 * Loading Wrapper Component
 * Conditional rendering of loading state vs content
 */
export interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}

export const LoadingWrapper = ({
  isLoading,
  children,
  skeleton,
  className = '',
}: LoadingWrapperProps) => {
  if (isLoading) {
    return <div className={className}>{skeleton || <SkeletonCard />}</div>;
  }

  return <>{children}</>;
};

/**
 * Suspense Skeleton Component
 * For use with React Suspense boundaries
 */
export const SuspenseSkeleton = ({
  variant = 'card',
  ...props
}: {
  variant?: 'card' | 'table' | 'list' | 'form' | 'dashboard';
  [key: string]: any;
}) => {
  switch (variant) {
    case 'table':
      return <SkeletonTable {...props} />;
    case 'list':
      return <SkeletonList {...props} />;
    case 'form':
      return <SkeletonForm {...props} />;
    case 'dashboard':
      return <SkeletonDashboard {...props} />;
    case 'card':
    default:
      return <SkeletonCard {...props} />;
  }
};

export default Skeleton;
