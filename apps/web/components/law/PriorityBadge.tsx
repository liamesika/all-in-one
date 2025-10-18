'use client';

/**
 * Priority Badge Component
 * Visual indicator for priority level with color coding
 */

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    },
    medium: {
      label: 'Medium',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    high: {
      label: 'High',
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    },
    urgent: {
      label: 'Urgent',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
