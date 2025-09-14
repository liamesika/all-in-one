// Lazy-loaded components with loading fallbacks
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading skeleton components
export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-t">
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="p-4">
                      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border animate-pulse">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6 space-y-6">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-100 rounded w-full"></div>
              <div className="h-10 bg-gray-100 rounded w-full"></div>
            </div>
            <div className="h-32 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
      <div className="h-32 bg-gray-100 rounded w-full"></div>
      <div className="flex justify-end gap-3">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-blue-200 rounded w-20"></div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-64 bg-gray-100 rounded w-full flex items-end justify-between px-4 pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t w-6"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Lazy loading wrapper with better error boundaries
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback = <TableSkeleton />, 
  errorFallback = <div className="p-4 text-red-600">Failed to load component</div> 
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    
    // Track error with performance monitoring
    if (typeof window !== 'undefined') {
      import('../lib/performance').then(({ trackError }) => {
        trackError(error, 'lazy-component-boundary');
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Pre-configured lazy components with optimized loading
export const LazyPropertyImport = dynamic(
  () => import('../PropertyImport').catch(() => ({ 
    default: () => <div>Failed to load PropertyImport</div> 
  })),
  {
    loading: () => <ModalSkeleton />,
    ssr: false, // Don't render on server
  }
);

export const LazyShopifyCsvTool = dynamic(
  () => import('../ShopifyCsvTool').catch(() => ({ 
    default: () => <div>Failed to load ShopifyCsvTool</div> 
  })),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
);

export const LazyJobsTable = dynamic(
  () => import('../JobsTable').catch(() => ({ 
    default: () => <div>Failed to load JobsTable</div> 
  })),
  {
    loading: () => <TableSkeleton />,
    ssr: false,
  }
);

export const LazyLeadsForm = dynamic(
  () => import('../leads/Form').catch(() => ({ 
    default: () => <div>Failed to load LeadsForm</div> 
  })),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
);

// Higher-order component for lazy loading any component
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFn, {
    loading: () => fallback || <div className="p-4">Loading...</div>,
    ssr: false,
  });
}