'use client';

/**
 * Usage statistics component
 * Displays current usage vs limits with progress bars
 */

import { AlertCircle } from 'lucide-react';

interface UsageResource {
  current: number;
  limit: number;
  percentage: number;
}

interface UsageStatsProps {
  usage: {
    leads: UsageResource;
    properties: UsageResource;
    users: UsageResource;
    automations: UsageResource;
    integrations: UsageResource;
  };
}

export default function UsageStats({ usage }: UsageStatsProps) {
  const resources = [
    { name: 'Leads', key: 'leads', icon: '📊' },
    { name: 'Properties', key: 'properties', icon: '🏢' },
    { name: 'Users', key: 'users', icon: '👥' },
    { name: 'Automations', key: 'automations', icon: '⚡' },
    { name: 'Integrations', key: 'integrations', icon: '🔌' },
  ] as const;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-700';
    if (percentage >= 75) return 'text-yellow-700';
    return 'text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Usage This Month</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource) => {
          const stats = usage[resource.key];
          const isUnlimited = stats.limit > 900000;
          const isNearLimit = stats.percentage >= 75;

          return (
            <div key={resource.key} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{resource.icon}</span>
                  <span className="font-medium text-gray-900">{resource.name}</span>
                </div>
                {isNearLimit && !isUnlimited && (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold ${getTextColor(stats.percentage)}`}>
                    {stats.current.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {isUnlimited ? 'Unlimited' : `of ${stats.limit.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {!isUnlimited && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(stats.percentage)} transition-all duration-300`}
                    style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                  />
                </div>
              )}

              {!isUnlimited && stats.percentage >= 90 && (
                <p className="text-xs text-red-600 mt-2">
                  You're approaching your limit. Consider upgrading your plan.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
