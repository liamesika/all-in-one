import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for when there's no data
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={UserGroupIcon}
 *   title="No clients yet"
 *   description="Get started by creating your first client"
 *   action={{
 *     label: "Create Client",
 *     onClick: () => setShowCreateModal(true)
 *   }}
 * />
 * ```
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0e1a2b] font-semibold rounded-xl transition-all min-h-[40px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
