import { SubscriptionPlan, MembershipRole, FeatureAccess } from '@prisma/client';

// Plan-based permissions
export const PLAN_PERMISSIONS: Record<SubscriptionPlan, FeatureAccess[]> = {
  BASIC: [
    // Basic read/write access
    'LEADS_READ',
    'LEADS_WRITE',
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'CAMPAIGNS_READ',
    'REPORTS_VIEW_BASIC',
    'INTEGRATIONS_READ',
    'ORG_MEMBERS_READ',
  ],
  PRO: [
    // All BASIC permissions are inherited via getPlanPermissions()
    // PRO adds:
    'LEADS_DELETE',
    'LEADS_EXPORT',
    'LEADS_BULK_ACTIONS',
    'LEADS_ASSIGN',
    'PROPERTIES_DELETE',
    'PROPERTIES_PUBLISH',
    'PROPERTIES_ASSIGN_AGENT',
    'PROPERTIES_IMPORT',
    'CAMPAIGNS_WRITE',
    'CAMPAIGNS_DELETE',
    'CAMPAIGNS_ACTIVATE',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'AUTOMATIONS_READ',
    'AUTOMATIONS_WRITE',
    'AUTOMATIONS_EXECUTE',
    'INTEGRATIONS_WRITE',
    'INTEGRATIONS_SYNC',
    'REPORTS_VIEW_ADVANCED',
    'REPORTS_EXPORT',
  ],
  AGENCY: [
    // All PRO permissions are inherited
    // AGENCY adds:
    'AUTOMATIONS_DELETE',
    'INTEGRATIONS_DELETE',
    'REPORTS_SCHEDULE',
    'REPORTS_CUSTOM',
    'CAMPAIGNS_MANAGE_BUDGET',
    'ORG_SETTINGS',
    'ORG_INVITE_MEMBERS',
    'ORG_MEMBERS_WRITE',
    'API_ACCESS',
    'WHITE_LABEL',
    'BULK_OPERATIONS',
    'ADVANCED_ANALYTICS',
  ],
  ENTERPRISE: [
    // All AGENCY permissions are inherited
    // ENTERPRISE adds:
    'CUSTOM_INTEGRATIONS',
    'DEDICATED_SUPPORT',
    'ORG_MEMBERS_DELETE',
    'ORG_BILLING',
  ]
};

// Role-based permissions (within organization)
export const ROLE_PERMISSIONS: Record<MembershipRole, FeatureAccess[]> = {
  OWNER: [
    // Owner has all permissions
    'LEADS_READ',
    'LEADS_WRITE',
    'LEADS_DELETE',
    'LEADS_EXPORT',
    'LEADS_BULK_ACTIONS',
    'LEADS_ASSIGN',
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'PROPERTIES_DELETE',
    'PROPERTIES_PUBLISH',
    'PROPERTIES_ASSIGN_AGENT',
    'PROPERTIES_IMPORT',
    'CAMPAIGNS_READ',
    'CAMPAIGNS_WRITE',
    'CAMPAIGNS_DELETE',
    'CAMPAIGNS_ACTIVATE',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'CAMPAIGNS_MANAGE_BUDGET',
    'AUTOMATIONS_READ',
    'AUTOMATIONS_WRITE',
    'AUTOMATIONS_DELETE',
    'AUTOMATIONS_EXECUTE',
    'INTEGRATIONS_READ',
    'INTEGRATIONS_WRITE',
    'INTEGRATIONS_DELETE',
    'INTEGRATIONS_SYNC',
    'REPORTS_VIEW_BASIC',
    'REPORTS_VIEW_ADVANCED',
    'REPORTS_EXPORT',
    'REPORTS_SCHEDULE',
    'REPORTS_CUSTOM',
    'ORG_SETTINGS',
    'ORG_BILLING',
    'ORG_MEMBERS_READ',
    'ORG_MEMBERS_WRITE',
    'ORG_MEMBERS_DELETE',
    'ORG_INVITE_MEMBERS',
    'API_ACCESS',
    'WHITE_LABEL',
    'CUSTOM_INTEGRATIONS',
    'DEDICATED_SUPPORT',
    'BULK_OPERATIONS',
    'ADVANCED_ANALYTICS',
  ],
  ADMIN: [
    // All except billing
    'LEADS_READ',
    'LEADS_WRITE',
    'LEADS_DELETE',
    'LEADS_EXPORT',
    'LEADS_BULK_ACTIONS',
    'LEADS_ASSIGN',
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'PROPERTIES_DELETE',
    'PROPERTIES_PUBLISH',
    'PROPERTIES_ASSIGN_AGENT',
    'PROPERTIES_IMPORT',
    'CAMPAIGNS_READ',
    'CAMPAIGNS_WRITE',
    'CAMPAIGNS_DELETE',
    'CAMPAIGNS_ACTIVATE',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'CAMPAIGNS_MANAGE_BUDGET',
    'AUTOMATIONS_READ',
    'AUTOMATIONS_WRITE',
    'AUTOMATIONS_DELETE',
    'AUTOMATIONS_EXECUTE',
    'INTEGRATIONS_READ',
    'INTEGRATIONS_WRITE',
    'INTEGRATIONS_DELETE',
    'INTEGRATIONS_SYNC',
    'REPORTS_VIEW_BASIC',
    'REPORTS_VIEW_ADVANCED',
    'REPORTS_EXPORT',
    'REPORTS_SCHEDULE',
    'REPORTS_CUSTOM',
    'ORG_SETTINGS',
    'ORG_MEMBERS_READ',
    'ORG_MEMBERS_WRITE',
    'ORG_INVITE_MEMBERS',
    'API_ACCESS',
    'WHITE_LABEL',
    'CUSTOM_INTEGRATIONS',
    'BULK_OPERATIONS',
    'ADVANCED_ANALYTICS',
  ],
  MANAGER: [
    // Team management and standard operations
    'LEADS_READ',
    'LEADS_WRITE',
    'LEADS_DELETE',
    'LEADS_EXPORT',
    'LEADS_ASSIGN',
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'PROPERTIES_DELETE',
    'PROPERTIES_PUBLISH',
    'PROPERTIES_ASSIGN_AGENT',
    'CAMPAIGNS_READ',
    'CAMPAIGNS_WRITE',
    'CAMPAIGNS_DELETE',
    'CAMPAIGNS_ACTIVATE',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'AUTOMATIONS_READ',
    'AUTOMATIONS_WRITE',
    'AUTOMATIONS_EXECUTE',
    'INTEGRATIONS_READ',
    'INTEGRATIONS_WRITE',
    'INTEGRATIONS_SYNC',
    'REPORTS_VIEW_BASIC',
    'REPORTS_VIEW_ADVANCED',
    'REPORTS_EXPORT',
    'ORG_MEMBERS_READ',
  ],
  MEMBER: [
    // Standard user access
    'LEADS_READ',
    'LEADS_WRITE',
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'CAMPAIGNS_READ',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'AUTOMATIONS_READ',
    'INTEGRATIONS_READ',
    'REPORTS_VIEW_BASIC',
  ],
  VIEWER: [
    // Read-only access
    'LEADS_READ',
    'PROPERTIES_READ',
    'CAMPAIGNS_READ',
    'REPORTS_VIEW_BASIC',
  ]
};

// Permission inheritance - combines permissions from lower tiers
export function getPlanPermissions(plan: SubscriptionPlan): FeatureAccess[] {
  const permissions = new Set<FeatureAccess>();

  // Add base permissions (BASIC)
  PLAN_PERMISSIONS.BASIC.forEach(p => permissions.add(p));

  // Add plan-specific permissions
  if (plan === 'PRO' || plan === 'AGENCY' || plan === 'ENTERPRISE') {
    PLAN_PERMISSIONS.PRO.forEach(p => permissions.add(p));
  }

  if (plan === 'AGENCY' || plan === 'ENTERPRISE') {
    PLAN_PERMISSIONS.AGENCY.forEach(p => permissions.add(p));
  }

  if (plan === 'ENTERPRISE') {
    PLAN_PERMISSIONS.ENTERPRISE.forEach(p => permissions.add(p));
  }

  return Array.from(permissions);
}

// Feature gates for UI - which plans have access to features
export const FEATURE_GATES = {
  automations: ['PRO', 'AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
  advancedReports: ['PRO', 'AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
  apiAccess: ['AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
  whiteLabel: ['AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
  customIntegrations: ['ENTERPRISE'] as SubscriptionPlan[],
  bulkOperations: ['AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
  advancedAnalytics: ['AGENCY', 'ENTERPRISE'] as SubscriptionPlan[],
} as const;

// Plan limits configuration
export const PLAN_LIMITS = {
  BASIC: {
    userSeats: 1,
    leadLimit: 100,
    propertyLimit: 50,
    campaignLimit: 3,
    automationLimit: 0,
    integrationLimit: 2,
  },
  PRO: {
    userSeats: 5,
    leadLimit: 1000,
    propertyLimit: 500,
    campaignLimit: 20,
    automationLimit: 10,
    integrationLimit: 10,
  },
  AGENCY: {
    userSeats: -1, // Unlimited
    leadLimit: -1, // Unlimited
    propertyLimit: -1, // Unlimited
    campaignLimit: -1, // Unlimited
    automationLimit: -1, // Unlimited
    integrationLimit: -1, // Unlimited
  },
  ENTERPRISE: {
    userSeats: -1, // Unlimited
    leadLimit: -1, // Unlimited
    propertyLimit: -1, // Unlimited
    campaignLimit: -1, // Unlimited
    automationLimit: -1, // Unlimited
    integrationLimit: -1, // Unlimited
  }
} as const;

// Helper to check if a plan has a feature
export function planHasFeature(plan: SubscriptionPlan, feature: keyof typeof FEATURE_GATES): boolean {
  return FEATURE_GATES[feature].includes(plan);
}

// Helper to get required plan for a permission
export function getRequiredPlanForPermission(permission: FeatureAccess): SubscriptionPlan | null {
  // Find the lowest plan that includes this permission
  if (PLAN_PERMISSIONS.BASIC.includes(permission)) return 'BASIC';

  const proPlan = getPlanPermissions('PRO');
  if (proPlan.includes(permission)) return 'PRO';

  const agencyPlan = getPlanPermissions('AGENCY');
  if (agencyPlan.includes(permission)) return 'AGENCY';

  const enterprisePlan = getPlanPermissions('ENTERPRISE');
  if (enterprisePlan.includes(permission)) return 'ENTERPRISE';

  return null;
}

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<FeatureAccess, string> = {
  LEADS_READ: 'View leads and their details',
  LEADS_WRITE: 'Create and edit leads',
  LEADS_DELETE: 'Delete leads',
  LEADS_EXPORT: 'Export leads to CSV/Excel',
  LEADS_BULK_ACTIONS: 'Perform bulk operations on leads',
  LEADS_ASSIGN: 'Assign leads to team members',

  PROPERTIES_READ: 'View properties and listings',
  PROPERTIES_WRITE: 'Create and edit properties',
  PROPERTIES_DELETE: 'Delete properties',
  PROPERTIES_PUBLISH: 'Publish properties to listings',
  PROPERTIES_ASSIGN_AGENT: 'Assign properties to agents',
  PROPERTIES_IMPORT: 'Import properties from external sources',

  CAMPAIGNS_READ: 'View campaigns and their performance',
  CAMPAIGNS_WRITE: 'Create and edit campaigns',
  CAMPAIGNS_DELETE: 'Delete campaigns',
  CAMPAIGNS_ACTIVATE: 'Activate and pause campaigns',
  CAMPAIGNS_VIEW_ANALYTICS: 'View detailed campaign analytics',
  CAMPAIGNS_MANAGE_BUDGET: 'Manage campaign budgets',

  AUTOMATIONS_READ: 'View automation workflows',
  AUTOMATIONS_WRITE: 'Create and edit automations',
  AUTOMATIONS_DELETE: 'Delete automations',
  AUTOMATIONS_EXECUTE: 'Manually trigger automations',

  INTEGRATIONS_READ: 'View connected integrations',
  INTEGRATIONS_WRITE: 'Connect and configure integrations',
  INTEGRATIONS_DELETE: 'Disconnect integrations',
  INTEGRATIONS_SYNC: 'Trigger manual syncs',

  REPORTS_VIEW_BASIC: 'View basic reports and dashboards',
  REPORTS_VIEW_ADVANCED: 'View advanced analytics and insights',
  REPORTS_EXPORT: 'Export reports to PDF/Excel',
  REPORTS_SCHEDULE: 'Schedule automated report delivery',
  REPORTS_CUSTOM: 'Create custom reports',

  ORG_SETTINGS: 'Manage organization settings',
  ORG_BILLING: 'Access billing and subscription management',
  ORG_MEMBERS_READ: 'View organization members',
  ORG_MEMBERS_WRITE: 'Manage member roles and permissions',
  ORG_MEMBERS_DELETE: 'Remove members from organization',
  ORG_INVITE_MEMBERS: 'Invite new members to organization',

  API_ACCESS: 'Access API keys and documentation',
  WHITE_LABEL: 'Customize branding and white-label features',
  CUSTOM_INTEGRATIONS: 'Create custom integrations and webhooks',
  DEDICATED_SUPPORT: 'Access dedicated support channels',
  BULK_OPERATIONS: 'Perform advanced bulk operations',
  ADVANCED_ANALYTICS: 'Access advanced analytics and AI insights',
};
