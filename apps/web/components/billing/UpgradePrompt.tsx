'use client';

/**
 * Upgrade prompt modal
 * Shown when user hits usage limits or lacks permissions
 */

import { X, TrendingUp, Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeatureAccess } from '@prisma/client';
import { getRequiredPlanForPermission, PERMISSION_DESCRIPTIONS } from '@/config/permissions';

interface UpgradePromptProps {
  isOpen?: boolean;
  onClose?: () => void;
  limitType?: string;
  currentUsage?: number;
  limit?: number;
  requiredPermission?: FeatureAccess | FeatureAccess[];
}

export default function UpgradePrompt({
  isOpen = true,
  onClose,
  limitType,
  currentUsage,
  limit,
  requiredPermission,
}: UpgradePromptProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Determine if this is a permission-based or usage-based prompt
  const isPermissionBased = !!requiredPermission;
  const permission = Array.isArray(requiredPermission) ? requiredPermission[0] : requiredPermission;
  const requiredPlan = permission ? getRequiredPlanForPermission(permission) : null;
  const permissionDesc = permission ? PERMISSION_DESCRIPTIONS[permission] : null;

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setLoading(true);
    router.push('/dashboard/billing');
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {isPermissionBased ? (
                <Lock className="w-6 h-6 text-blue-600" />
              ) : (
                <TrendingUp className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isPermissionBased ? 'Feature Locked' : 'Usage Limit Reached'}
            </h2>
          </div>

          {isPermissionBased ? (
            <>
              <p className="text-gray-700 mb-4">
                {permissionDesc || 'This feature requires a higher plan to access.'}
              </p>
              {requiredPlan && (
                <p className="text-sm font-medium text-gray-600 mb-4">
                  Available on <span className="text-blue-600">{requiredPlan}</span> plan and above
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-700 mb-4">
              You've reached your {limitType} limit of <strong>{limit?.toLocaleString()}</strong>.
              You're currently at <strong>{currentUsage?.toLocaleString()}</strong>.
            </p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Upgrade to continue</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Higher limits on all resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Advanced automation features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>No interruption to your workflow</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            )}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'View Plans'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Named export for permission-based usage
export { UpgradePrompt };
