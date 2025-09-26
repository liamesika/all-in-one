'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { ApiUtils } from './api';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  seatLimit: number;
  usedSeats: number;
  ownerUserId: string;
}

export interface Membership {
  id: string;
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  userId: string;
  organization: Organization;
}

interface OrganizationContextType {
  activeOrg: Organization | null;
  membership: Membership | null;
  memberships: Membership[];
  loading: boolean;
  error: string | null;
  switchOrg: (orgId: string) => Promise<void>;
  refreshMemberships: () => Promise<void>;
  hasRole: (minRole: string) => boolean;
  canPerform: (action: string, resource?: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
} as const;

// Permission matrix
const PERMISSIONS = {
  // Member management
  'member.invite': ['OWNER', 'ADMIN'],
  'member.remove': ['OWNER', 'ADMIN'],
  'member.role.change': ['OWNER', 'ADMIN'],
  'member.view': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],

  // Organization management
  'org.update': ['OWNER', 'ADMIN'],
  'org.delete': ['OWNER'],
  'org.view': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],

  // Domain management
  'domain.add': ['OWNER', 'ADMIN'],
  'domain.verify': ['OWNER', 'ADMIN'],
  'domain.remove': ['OWNER', 'ADMIN'],

  // Billing management
  'billing.view': ['OWNER', 'ADMIN'],
  'billing.update': ['OWNER'],

  // Audit logs
  'audit.view': ['OWNER', 'ADMIN', 'MANAGER'],
  'audit.export': ['OWNER', 'ADMIN'],
} as const;

const fetcher = (url: string) => ApiUtils.getCached(url, 30000); // 30s cache

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch memberships using SWR
  const {
    data: memberships = [],
    error: membershipsError,
    mutate: mutateMemberships,
    isLoading: membershipsLoading
  } = useSWR<Membership[]>(
    user ? '/organizations/me/memberships' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  // Initialize active organization from localStorage or first membership
  useEffect(() => {
    if (!user || membershipsLoading || !memberships.length) return;

    const stored = localStorage.getItem('activeOrgId');
    let targetMembership: Membership | undefined;

    if (stored) {
      targetMembership = memberships.find(m => m.orgId === stored);
    }

    // Fallback to first membership if stored org not found
    if (!targetMembership) {
      targetMembership = memberships[0];
    }

    if (targetMembership && targetMembership.orgId !== activeOrg?.id) {
      setActiveOrg(targetMembership.organization);
      setMembership(targetMembership);
      localStorage.setItem('activeOrgId', targetMembership.orgId);
    }
  }, [user, memberships, membershipsLoading, activeOrg?.id]);

  // Handle errors
  useEffect(() => {
    if (membershipsError) {
      setError('Failed to load organization data');
      toast.error('Failed to load organization data');
    } else {
      setError(null);
    }
  }, [membershipsError]);

  const switchOrg = useCallback(async (orgId: string) => {
    try {
      const targetMembership = memberships.find(m => m.orgId === orgId);
      if (!targetMembership) {
        throw new Error('Organization not found');
      }

      // Update local state immediately
      setActiveOrg(targetMembership.organization);
      setMembership(targetMembership);
      localStorage.setItem('activeOrgId', orgId);

      // Notify server about the change
      try {
        await ApiUtils.post('/organizations/me/active-org', { orgId });
      } catch (error) {
        console.warn('Failed to update active org on server:', error);
      }

      // Invalidate all organization-dependent caches
      await mutate(key => typeof key === 'string' && key.includes('/organizations/'));

      toast.success('Organization switched successfully');
    } catch (error) {
      console.error('Failed to switch organization:', error);
      toast.error('Failed to switch organization');
      throw error;
    }
  }, [memberships]);

  const refreshMemberships = useCallback(async () => {
    try {
      await mutateMemberships();
    } catch (error) {
      console.error('Failed to refresh memberships:', error);
      toast.error('Failed to refresh organization data');
    }
  }, [mutateMemberships]);

  const hasRole = useCallback((minRole: string) => {
    if (!membership) return false;
    const currentRoleLevel = ROLE_HIERARCHY[membership.role];
    const minRoleLevel = ROLE_HIERARCHY[minRole as keyof typeof ROLE_HIERARCHY];
    return currentRoleLevel >= minRoleLevel;
  }, [membership]);

  const canPerform = useCallback((action: string, resource?: string) => {
    if (!membership) return false;

    const permissionKey = resource ? `${resource}.${action}` : action;
    const allowedRoles = PERMISSIONS[permissionKey as keyof typeof PERMISSIONS];

    if (!allowedRoles) {
      console.warn(`Permission not defined for action: ${permissionKey}`);
      return false;
    }

    return allowedRoles.includes(membership.role);
  }, [membership]);

  const loading = authLoading || membershipsLoading;

  return (
    <OrganizationContext.Provider
      value={{
        activeOrg,
        membership,
        memberships,
        loading,
        error,
        switchOrg,
        refreshMemberships,
        hasRole,
        canPerform,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// Convenience hooks
export function useActiveOrg() {
  const { activeOrg, loading } = useOrganization();
  return { activeOrg, loading };
}

export function useRole() {
  const { membership, hasRole, canPerform } = useOrganization();
  return {
    role: membership?.role || null,
    hasRole,
    canPerform,
    isOwner: membership?.role === 'OWNER',
    isAdmin: membership?.role === 'ADMIN' || membership?.role === 'OWNER',
    isMember: membership?.role !== 'VIEWER',
  };
}