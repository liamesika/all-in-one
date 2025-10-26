'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>
      <button
        onClick={() => {
          analytics.emptyStateCTAClicked(actionLabel, actionHref);
          router.push(actionHref);
        }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors min-h-[44px]"
      >
        <Plus size={20} />
        {actionLabel}
      </button>
    </div>
  );
}
