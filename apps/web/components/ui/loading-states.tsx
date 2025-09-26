import React from 'react';
import { useLanguage } from '@/lib/language-context';

// Generic loading skeleton
export function Skeleton({ className = '', children }: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({
  columns = 5,
  rows = 5,
  className = ''
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Statistics card skeleton
export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// Dashboard overview skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick actions */}
      <CardSkeleton />

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-12 h-12 mx-auto text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

// Error state component
export function ErrorState({
  title,
  message,
  retry,
  className = ''
}: {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}) {
  const { language } = useLanguage();

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-12 h-12 mx-auto text-red-400 mb-4">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || (language === 'he' ? 'שגיאה' : 'Error')}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {language === 'he' ? 'נסה שוב' : 'Try Again'}
        </button>
      )}
    </div>
  );
}

// Loading overlay
export function LoadingOverlay({
  loading = true,
  children,
  className = ''
}: {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!loading) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
      <div className="opacity-50">{children}</div>
    </div>
  );
}

// Inline loading spinner
export function LoadingSpinner({
  size = 'sm',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]} ${className}`} />
  );
}

// Page loading component
export function PageLoading() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-500">
          {language === 'he' ? 'טוען...' : 'Loading...'}
        </p>
      </div>
    </div>
  );
}