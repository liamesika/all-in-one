'use client';

/**
 * Case Status Badge Component
 * Visual indicator for case status with color coding
 */

interface CaseStatusBadgeProps {
  status: 'active' | 'pending' | 'closed' | 'archived';
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    closed: {
      label: 'Closed',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    },
    archived: {
      label: 'Archived',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
