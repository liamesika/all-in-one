import { auth } from './firebase';
import { PrismaClient, RealEstateRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface RealEstateAuthContext {
  uid: string;
  email: string | null;
  tenantId: string;
  role: RealEstateRole;
  isManager: boolean;
  isAgent: boolean;
}

/**
 * Get current tenant ID from authenticated user
 * Uses ownerUid pattern for backward compatibility
 */
export async function getCurrentTenant(uid: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        take: 1
      }
    }
  });

  if (!user) throw new Error('User not found');

  // Use first active membership's ownerUid as tenantId
  const tenantId = user.memberships[0]?.ownerUid || uid;
  return tenantId;
}

/**
 * Get current user's Real Estate role
 */
export async function getCurrentUserRole(uid: string): Promise<RealEstateRole> {
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { realEstateRole: true }
  });

  return user?.realEstateRole || RealEstateRole.AGENT;
}

/**
 * Get full Real Estate auth context for a user
 */
export async function getRealEstateAuthContext(uid: string, email: string | null = null): Promise<RealEstateAuthContext> {
  const [tenantId, role] = await Promise.all([
    getCurrentTenant(uid),
    getCurrentUserRole(uid)
  ]);

  return {
    uid,
    email,
    tenantId,
    role,
    isManager: role === RealEstateRole.OFFICE_MANAGER || role === RealEstateRole.ADMIN,
    isAgent: role === RealEstateRole.AGENT || role === RealEstateRole.ASSISTANT
  };
}

/**
 * Enforce manager-only access
 * Throws error if user is not a manager
 */
export function enforceManager(context: RealEstateAuthContext): void {
  if (!context.isManager) {
    throw new Error('Access denied: Manager role required');
  }
}

/**
 * Enforce agent or manager access
 * Throws error if user has no role
 */
export function enforceAgentOrManager(context: RealEstateAuthContext): void {
  if (!context.isAgent && !context.isManager) {
    throw new Error('Access denied: Agent or Manager role required');
  }
}

/**
 * Build tenant-scoped where clause for Prisma queries
 */
export function getTenantWhere(tenantId: string) {
  return { tenantId };
}

/**
 * Build role-aware where clause for leads
 * Managers see all, agents see only assigned
 */
export function getLeadsWhere(context: RealEstateAuthContext) {
  const base = { ownerUid: context.tenantId };

  if (context.isManager) {
    return base;
  }

  // Agent: only assigned leads
  return {
    ...base,
    assignedToId: context.uid
  };
}

/**
 * Build role-aware where clause for clients
 * Managers see all, agents see only assigned
 */
export function getClientsWhere(context: RealEstateAuthContext) {
  const base = { tenantId: context.tenantId };

  if (context.isManager) {
    return base;
  }

  // Agent: only assigned clients
  return {
    ...base,
    assignedAgentId: context.uid
  };
}

/**
 * Build role-aware where clause for properties
 * Managers see all, agents see only assigned
 */
export function getPropertiesWhere(context: RealEstateAuthContext) {
  const base = { ownerUid: context.tenantId };

  if (context.isManager) {
    return base;
  }

  // Agent: only assigned properties
  return {
    ...base,
    assignedAgentId: context.uid
  };
}

/**
 * Build role-aware where clause for tasks
 * Managers see all, agents see only assigned
 */
export function getTasksWhere(context: RealEstateAuthContext) {
  const base = { tenantId: context.tenantId };

  if (context.isManager) {
    return base;
  }

  // Agent: only assigned tasks
  return {
    ...base,
    assignees: {
      some: {
        agentId: context.uid
      }
    }
  };
}

/**
 * Build role-aware where clause for meetings
 * Managers see all, agents see only where they're participants
 */
export function getMeetingsWhere(context: RealEstateAuthContext) {
  const base = { tenantId: context.tenantId };

  if (context.isManager) {
    return base;
  }

  // Agent: only meetings they're part of
  return {
    ...base,
    agentParticipants: {
      some: {
        userId: context.uid
      }
    }
  };
}

/**
 * Check if user can access a specific lead
 */
export async function canAccessLead(context: RealEstateAuthContext, leadId: string): Promise<boolean> {
  if (context.isManager) return true;

  const lead = await prisma.realEstateLead.findFirst({
    where: {
      id: leadId,
      ownerUid: context.tenantId,
      assignedToId: context.uid
    }
  });

  return !!lead;
}

/**
 * Check if user can access a specific client
 */
export async function canAccessClient(context: RealEstateAuthContext, clientId: string): Promise<boolean> {
  if (context.isManager) return true;

  const client = await prisma.realEstateClient.findFirst({
    where: {
      id: clientId,
      tenantId: context.tenantId,
      assignedAgentId: context.uid
    }
  });

  return !!client;
}

/**
 * Check if user can access a specific property
 */
export async function canAccessProperty(context: RealEstateAuthContext, propertyId: string): Promise<boolean> {
  if (context.isManager) return true;

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerUid: context.tenantId,
      assignedAgentId: context.uid
    }
  });

  return !!property;
}

/**
 * Check if user can access a specific task
 */
export async function canAccessTask(context: RealEstateAuthContext, taskId: string): Promise<boolean> {
  if (context.isManager) return true;

  const task = await prisma.agentTask.findFirst({
    where: {
      id: taskId,
      tenantId: context.tenantId,
      assignees: {
        some: {
          agentId: context.uid
        }
      }
    }
  });

  return !!task;
}

/**
 * Check if user can access a specific meeting
 */
export async function canAccessMeeting(context: RealEstateAuthContext, meetingId: string): Promise<boolean> {
  if (context.isManager) return true;

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      tenantId: context.tenantId,
      agentParticipants: {
        some: {
          userId: context.uid
        }
      }
    }
  });

  return !!meeting;
}
