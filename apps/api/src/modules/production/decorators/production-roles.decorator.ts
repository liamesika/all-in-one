import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '../../auth/guards/role.guard';

// Production-specific permission definitions
export const PRODUCTION_PERMISSIONS = {
  // Project management
  PROJECT_CREATE: 'production:project:create',
  PROJECT_READ: 'production:project:read',
  PROJECT_UPDATE: 'production:project:update',
  PROJECT_DELETE: 'production:project:delete',
  PROJECT_MANAGE: 'production:project:manage',

  // Task management
  TASK_CREATE: 'production:task:create',
  TASK_READ: 'production:task:read',
  TASK_UPDATE: 'production:task:update',
  TASK_DELETE: 'production:task:delete',
  TASK_ASSIGN: 'production:task:assign',
  TASK_UPDATE_ASSIGNED: 'production:task:update_assigned', // Can update tasks assigned to you

  // Budget management
  BUDGET_CREATE: 'production:budget:create',
  BUDGET_READ: 'production:budget:read',
  BUDGET_UPDATE: 'production:budget:update',
  BUDGET_DELETE: 'production:budget:delete',
  BUDGET_VIEW_ACTUAL: 'production:budget:view_actual', // View actual costs

  // Supplier management
  SUPPLIER_CREATE: 'production:supplier:create',
  SUPPLIER_READ: 'production:supplier:read',
  SUPPLIER_UPDATE: 'production:supplier:update',
  SUPPLIER_DELETE: 'production:supplier:delete',

  // File management
  FILE_UPLOAD: 'production:file:upload',
  FILE_READ: 'production:file:read',
  FILE_DELETE: 'production:file:delete',

  // Analytics and reporting
  ANALYTICS_VIEW: 'production:analytics:view',

  // Team management
  TEAM_VIEW: 'production:team:view',
  TEAM_MANAGE: 'production:team:manage'
} as const;

// Role-based permissions for Production vertical
export const PRODUCTION_ROLE_PERMISSIONS: Record<MembershipRole, string[]> = {
  [MembershipRole.OWNER]: [
    ...Object.values(PRODUCTION_PERMISSIONS)
  ],
  [MembershipRole.ADMIN]: [
    ...Object.values(PRODUCTION_PERMISSIONS).filter(p => !p.includes('team:manage'))
  ],
  [MembershipRole.MANAGER]: [
    PRODUCTION_PERMISSIONS.PROJECT_CREATE,
    PRODUCTION_PERMISSIONS.PROJECT_READ,
    PRODUCTION_PERMISSIONS.PROJECT_UPDATE,
    PRODUCTION_PERMISSIONS.PROJECT_MANAGE,
    PRODUCTION_PERMISSIONS.TASK_CREATE,
    PRODUCTION_PERMISSIONS.TASK_READ,
    PRODUCTION_PERMISSIONS.TASK_UPDATE,
    PRODUCTION_PERMISSIONS.TASK_DELETE,
    PRODUCTION_PERMISSIONS.TASK_ASSIGN,
    PRODUCTION_PERMISSIONS.BUDGET_CREATE,
    PRODUCTION_PERMISSIONS.BUDGET_READ,
    PRODUCTION_PERMISSIONS.BUDGET_UPDATE,
    PRODUCTION_PERMISSIONS.BUDGET_VIEW_ACTUAL,
    PRODUCTION_PERMISSIONS.SUPPLIER_CREATE,
    PRODUCTION_PERMISSIONS.SUPPLIER_READ,
    PRODUCTION_PERMISSIONS.SUPPLIER_UPDATE,
    PRODUCTION_PERMISSIONS.FILE_UPLOAD,
    PRODUCTION_PERMISSIONS.FILE_READ,
    PRODUCTION_PERMISSIONS.ANALYTICS_VIEW,
    PRODUCTION_PERMISSIONS.TEAM_VIEW
  ],
  [MembershipRole.MEMBER]: [
    PRODUCTION_PERMISSIONS.PROJECT_READ,
    PRODUCTION_PERMISSIONS.TASK_READ,
    PRODUCTION_PERMISSIONS.TASK_UPDATE_ASSIGNED,
    PRODUCTION_PERMISSIONS.BUDGET_READ,
    PRODUCTION_PERMISSIONS.SUPPLIER_READ,
    PRODUCTION_PERMISSIONS.FILE_UPLOAD,
    PRODUCTION_PERMISSIONS.FILE_READ,
    PRODUCTION_PERMISSIONS.TEAM_VIEW
  ],
  [MembershipRole.VIEWER]: [
    PRODUCTION_PERMISSIONS.PROJECT_READ,
    PRODUCTION_PERMISSIONS.TASK_READ,
    PRODUCTION_PERMISSIONS.BUDGET_READ,
    PRODUCTION_PERMISSIONS.SUPPLIER_READ,
    PRODUCTION_PERMISSIONS.FILE_READ,
    PRODUCTION_PERMISSIONS.TEAM_VIEW
  ]
};

// Convenient decorators for common production operations
export const RequireProductionPermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Project-specific decorators
export const CanCreateProject = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.PROJECT_CREATE);

export const CanManageProject = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.PROJECT_MANAGE);

export const CanReadProject = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.PROJECT_READ);

export const CanUpdateProject = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.PROJECT_UPDATE);

export const CanDeleteProject = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.PROJECT_DELETE);

// Task-specific decorators
export const CanCreateTask = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.TASK_CREATE);

export const CanAssignTask = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.TASK_ASSIGN);

export const CanUpdateTask = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.TASK_UPDATE);

export const CanUpdateAssignedTask = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.TASK_UPDATE_ASSIGNED);

// Budget-specific decorators
export const CanViewBudgetActuals = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_VIEW_ACTUAL);

export const CanManageBudget = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.BUDGET_CREATE, PRODUCTION_PERMISSIONS.BUDGET_UPDATE);

// Analytics decorator
export const CanViewAnalytics = () =>
  RequireProductionPermission(PRODUCTION_PERMISSIONS.ANALYTICS_VIEW);

// Combined decorators for common patterns
export const ProductionManagerAccess = () =>
  SetMetadata('roles', [MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER]);

export const ProductionWriteAccess = () =>
  SetMetadata('roles', [MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER]);

export const ProductionReadAccess = () =>
  SetMetadata('roles', [MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER, MembershipRole.MEMBER, MembershipRole.VIEWER]);