/**
 * LawSkeleton - Loading skeleton components
 * Used to show loading states across Law vertical
 */

import { cn } from '@/lib/utils';

interface LawSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function LawSkeleton({ className, width, height, circle = false }: LawSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        circle ? 'rounded-full' : 'rounded-law-md',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

/**
 * Pre-built skeleton patterns
 */
export function LawCardSkeleton() {
  return (
    <div className="law-card bg-law-surface border border-law-border rounded-law-lg p-6">
      <div className="space-y-4">
        <LawSkeleton height={24} width="60%" />
        <LawSkeleton height={16} width="40%" />
        <div className="space-y-2 mt-4">
          <LawSkeleton height={12} width="100%" />
          <LawSkeleton height={12} width="90%" />
          <LawSkeleton height={12} width="80%" />
        </div>
      </div>
    </div>
  );
}

export function LawTableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-law-border-light">
      {Array.from({ length: columns }).map((_, i) => (
        <LawSkeleton key={i} height={16} className="flex-1" />
      ))}
    </div>
  );
}

export function LawListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-law-border-light">
      <LawSkeleton width={40} height={40} circle />
      <div className="flex-1 space-y-2">
        <LawSkeleton height={16} width="60%" />
        <LawSkeleton height={12} width="40%" />
      </div>
      <LawSkeleton height={24} width={80} />
    </div>
  );
}

export function LawDashboardKPISkeleton() {
  return (
    <div className="law-card bg-law-surface border border-law-border rounded-law-lg p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <LawSkeleton height={14} width="40%" />
          <LawSkeleton height={32} width="60%" />
          <LawSkeleton height={12} width="30%" />
        </div>
        <LawSkeleton width={48} height={48} circle />
      </div>
    </div>
  );
}
