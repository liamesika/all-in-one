'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ className = '', variant = 'rectangular', animation = 'pulse' }: SkeletonProps) {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationVariants = {
    pulse: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    wave: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    },
    none: {}
  };

  if (animation === 'wave') {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={{
          background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
          backgroundSize: '200% 100%',
          animation: 'wave 1.5s linear infinite'
        }}
      />
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      animate={animationVariants[animation]}
    />
  );
}

// Project Card Skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex -space-x-2">
          <Skeleton variant="circular" className="w-8 h-8" />
          <Skeleton variant="circular" className="w-8 h-8" />
          <Skeleton variant="circular" className="w-8 h-8" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

// Task Card Skeleton
export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton variant="circular" className="w-5 h-5" />
        <div className="flex-1">
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton variant="circular" className="w-6 h-6" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// Client Card Skeleton
export function ClientCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="w-16 h-16" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="flex justify-between">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard Grid Skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: 5 }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRowSkeleton key={index} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Projects Grid Skeleton
export function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Tasks Board Skeleton
export function TasksBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((columnIndex) => (
        <div key={columnIndex} className="bg-gray-50 rounded-xl p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, taskIndex) => (
              <TaskCardSkeleton key={taskIndex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Clients Grid Skeleton
export function ClientsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ClientCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content */}
      <div className="p-8">
        <DashboardSkeleton />
      </div>
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
