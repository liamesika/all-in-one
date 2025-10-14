'use client';

import { ReactNode } from 'react';
import { FeatureAccess } from '@prisma/client';
import { usePermission } from '@/hooks/usePermission';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';

interface PermissionGateProps {
  permission: FeatureAccess | FeatureAccess[];
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  requireAll?: boolean;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user has required permissions
 * Can show upgrade prompt if permission is denied due to plan limits
 */
export function PermissionGate({
  permission,
  children,
  fallback,
  showUpgradePrompt = true,
  requireAll = true,
  loadingFallback,
}: PermissionGateProps) {
  const { hasPermission, isLoading, error } = usePermission(permission, requireAll);

  if (isLoading) {
    return <>{loadingFallback || <div>Loading...</div>}</>;
  }

  if (error) {
    console.error('[PermissionGate] Error checking permissions:', error);
    return <>{fallback || null}</>;
  }

  if (!hasPermission) {
    if (showUpgradePrompt) {
      return <UpgradePrompt requiredPermission={permission} />;
    }
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

/**
 * Inline component that only shows children if permission is granted
 * No loading state or upgrade prompts - just hide/show
 */
export function IfHasPermission({
  permission,
  children,
}: {
  permission: FeatureAccess | FeatureAccess[];
  children: ReactNode;
}) {
  const { hasPermission, isLoading } = usePermission(permission);

  if (isLoading || !hasPermission) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Conditional rendering based on permission
 */
export function PermissionSwitch({
  permission,
  granted,
  denied,
}: {
  permission: FeatureAccess | FeatureAccess[];
  granted: ReactNode;
  denied?: ReactNode;
}) {
  const { hasPermission, isLoading } = usePermission(permission);

  if (isLoading) {
    return null;
  }

  return <>{hasPermission ? granted : denied || null}</>;
}
