import { FeatureAccess, MembershipRole, SubscriptionPlan } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { getPlanPermissions, ROLE_PERMISSIONS } from '@/config/permissions';


export class PermissionChecker {
  /**
   * Check if a user has a specific permission in an organization
   * This is the core permission check that combines plan-based and role-based permissions
   */
  async checkPermission(
    userId: string,
    orgId: string,
    permission: FeatureAccess
  ): Promise<boolean> {
    try {
      // 1. Get user membership with organization and subscription data
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
        include: {
          organization: {
            include: {
              subscription: true
            }
          }
        }
      });

      if (!membership) {
        console.log(`[PermissionChecker] No membership found for user ${userId} in org ${orgId}`);
        return false;
      }

      // 2. Check membership status
      if (membership.status !== 'ACTIVE') {
        console.log(`[PermissionChecker] Membership not active: ${membership.status}`);
        return false;
      }

      // 3. Check subscription status
      const subscription = membership.organization.subscription;
      if (!subscription || subscription.status !== 'ACTIVE') {
        console.log(`[PermissionChecker] No active subscription found`);
        return false;
      }

      // 4. Check plan-level permissions
      const planPermissions = getPlanPermissions(subscription.plan);
      if (!planPermissions.includes(permission)) {
        console.log(`[PermissionChecker] Permission ${permission} not available in plan ${subscription.plan}`);
        return false;
      }

      // 5. Check role-level permissions
      const rolePermissions = ROLE_PERMISSIONS[membership.role];
      if (!rolePermissions.includes(permission)) {
        console.log(`[PermissionChecker] Permission ${permission} not granted to role ${membership.role}`);
        return false;
      }

      // 6. Check custom permissions (overrides)
      if (membership.customPermissions) {
        const customPerms = membership.customPermissions as string[];

        // If permission is explicitly granted in custom permissions
        if (customPerms.includes(permission)) {
          console.log(`[PermissionChecker] Permission ${permission} granted via custom permissions`);
          return true;
        }

        // If permission is explicitly denied in custom permissions (prefixed with !)
        if (customPerms.includes(`!${permission}`)) {
          console.log(`[PermissionChecker] Permission ${permission} denied via custom permissions`);
          return false;
        }
      }

      // Permission granted through plan + role
      return true;

    } catch (error) {
      console.error('[PermissionChecker] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  async checkAnyPermission(
    userId: string,
    orgId: string,
    permissions: FeatureAccess[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.checkPermission(userId, orgId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  async checkAllPermissions(
    userId: string,
    orgId: string,
    permissions: FeatureAccess[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.checkPermission(userId, orgId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all permissions a user has in an organization
   */
  async getUserPermissions(
    userId: string,
    orgId: string
  ): Promise<FeatureAccess[]> {
    try {
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
        include: {
          organization: {
            include: {
              subscription: true
            }
          }
        }
      });

      if (!membership || !membership.organization.subscription || membership.status !== 'ACTIVE') {
        return [];
      }

      const subscription = membership.organization.subscription;
      if (subscription.status !== 'ACTIVE') {
        return [];
      }

      // Get plan permissions
      const planPerms = getPlanPermissions(subscription.plan);

      // Get role permissions
      const rolePerms = ROLE_PERMISSIONS[membership.role];

      // Intersection of plan and role permissions
      let effectivePermissions = planPerms.filter(p => rolePerms.includes(p));

      // Apply custom permissions
      if (membership.customPermissions) {
        const customPerms = membership.customPermissions as string[];

        // Add explicitly granted permissions
        const grantedPerms = customPerms.filter(p => !p.startsWith('!')) as FeatureAccess[];
        effectivePermissions = [...new Set([...effectivePermissions, ...grantedPerms])];

        // Remove explicitly denied permissions
        const deniedPerms = customPerms
          .filter(p => p.startsWith('!'))
          .map(p => p.substring(1)) as FeatureAccess[];
        effectivePermissions = effectivePermissions.filter(p => !deniedPerms.includes(p));
      }

      return effectivePermissions;

    } catch (error) {
      console.error('[PermissionChecker] Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get user's membership role in an organization
   */
  async getUserRole(userId: string, orgId: string): Promise<MembershipRole | null> {
    try {
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
      });

      return membership?.role || null;
    } catch (error) {
      console.error('[PermissionChecker] Error getting user role:', error);
      return null;
    }
  }

  /**
   * Check if user is owner of an organization
   */
  async isOwner(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, orgId);
    return role === 'OWNER';
  }

  /**
   * Check if user is admin or owner
   */
  async isAdminOrOwner(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, orgId);
    return role === 'OWNER' || role === 'ADMIN';
  }

  /**
   * Get organization subscription plan
   */
  async getOrgPlan(orgId: string): Promise<SubscriptionPlan | null> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { orgId },
      });

      return subscription?.plan || null;
    } catch (error) {
      console.error('[PermissionChecker] Error getting org plan:', error);
      return null;
    }
  }

  /**
   * Check if organization has active subscription
   */
  async hasActiveSubscription(orgId: string): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { orgId },
      });

      return subscription?.status === 'ACTIVE';
    } catch (error) {
      console.error('[PermissionChecker] Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Grant custom permission to a user (adds to customPermissions array)
   */
  async grantCustomPermission(
    userId: string,
    orgId: string,
    permission: FeatureAccess
  ): Promise<boolean> {
    try {
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
      });

      if (!membership) return false;

      const currentCustomPerms = (membership.customPermissions as string[]) || [];
      const updatedPerms = [...new Set([...currentCustomPerms, permission])];

      await prisma.membership.update({
        where: { userId_orgId: { userId, orgId } },
        data: { customPermissions: updatedPerms },
      });

      return true;
    } catch (error) {
      console.error('[PermissionChecker] Error granting custom permission:', error);
      return false;
    }
  }

  /**
   * Revoke custom permission from a user
   */
  async revokeCustomPermission(
    userId: string,
    orgId: string,
    permission: FeatureAccess
  ): Promise<boolean> {
    try {
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId, orgId } },
      });

      if (!membership) return false;

      const currentCustomPerms = (membership.customPermissions as string[]) || [];
      const updatedPerms = currentCustomPerms.filter(p => p !== permission);

      await prisma.membership.update({
        where: { userId_orgId: { userId, orgId } },
        data: { customPermissions: updatedPerms },
      });

      return true;
    } catch (error) {
      console.error('[PermissionChecker] Error revoking custom permission:', error);
      return false;
    }
  }
}

// Singleton instance
export const permissionChecker = new PermissionChecker();

// Convenience functions
export async function checkPermission(userId: string, orgId: string, permission: FeatureAccess): Promise<boolean> {
  return permissionChecker.checkPermission(userId, orgId, permission);
}

export async function checkAnyPermission(userId: string, orgId: string, permissions: FeatureAccess[]): Promise<boolean> {
  return permissionChecker.checkAnyPermission(userId, orgId, permissions);
}

export async function checkAllPermissions(userId: string, orgId: string, permissions: FeatureAccess[]): Promise<boolean> {
  return permissionChecker.checkAllPermissions(userId, orgId, permissions);
}

export async function getUserPermissions(userId: string, orgId: string): Promise<FeatureAccess[]> {
  return permissionChecker.getUserPermissions(userId, orgId);
}
