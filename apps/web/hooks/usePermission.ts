'use client';

import { useEffect, useState } from 'react';
import { FeatureAccess, MembershipRole, SubscriptionPlan } from '@prisma/client';

interface PermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface UserPermissionsState {
  permissions: FeatureAccess[];
  role: MembershipRole | null;
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check if the current user has specific permissions
 * @param permission - Single permission or array of permissions to check
 * @param requireAll - If true, requires ALL permissions. If false, requires ANY permission
 */
export function usePermission(
  permission: FeatureAccess | FeatureAccess[],
  requireAll: boolean = true
): PermissionState {
  const [state, setState] = useState<PermissionState>({
    hasPermission: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function checkPermissions() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch('/api/permissions/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: permission }),
        });

        if (!response.ok) {
          throw new Error(`Permission check failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (isMounted) {
          setState({
            hasPermission: data.hasPermission,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: error as Error,
          });
        }
      }
    }

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, [permission, requireAll]);

  return state;
}

/**
 * Hook to get all permissions for the current user
 */
export function useUserPermissions(): UserPermissionsState {
  const [state, setState] = useState<UserPermissionsState>({
    permissions: [],
    role: null,
    plan: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchPermissions() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch('/api/permissions/me');

        if (!response.ok) {
          throw new Error(`Failed to fetch permissions: ${response.statusText}`);
        }

        const data = await response.json();

        if (isMounted) {
          setState({
            permissions: data.permissions,
            role: data.role,
            plan: data.plan,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            permissions: [],
            role: null,
            plan: null,
            isLoading: false,
            error: error as Error,
          });
        }
      }
    }

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(): {
  role: MembershipRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  isViewer: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserPermissions();

  return {
    role,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN',
    isManager: role === 'MANAGER',
    isMember: role === 'MEMBER',
    isViewer: role === 'VIEWER',
    isLoading,
  };
}

/**
 * Hook to check if current plan includes a feature
 */
export function usePlanFeature(feature: string): {
  hasFeature: boolean;
  currentPlan: SubscriptionPlan | null;
  isLoading: boolean;
} {
  const { plan, isLoading } = useUserPermissions();

  // This would need to be enhanced with actual feature gate logic
  // For now, just return basic info
  return {
    hasFeature: plan ? ['PRO', 'AGENCY', 'ENTERPRISE'].includes(plan) : false,
    currentPlan: plan,
    isLoading,
  };
}
