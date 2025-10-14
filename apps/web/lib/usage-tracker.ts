/**
 * Usage tracking and limit enforcement for subscriptions
 */

import { PrismaClient } from '@prisma/client';
import { checkPlanLimit, getPlanLimits } from '@/config/pricing';
import type { SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

export class UsageLimitError extends Error {
  constructor(
    message: string,
    public resourceType: string,
    public limit: number,
    public current: number
  ) {
    super(message);
    this.name = 'UsageLimitError';
  }
}

export type ResourceType = 'leads' | 'properties' | 'automations' | 'integrations' | 'users';
export type UsageAction = 'created' | 'deleted' | 'updated';

/**
 * Get current subscription for an organization
 */
async function getSubscription(orgId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { orgId },
    include: {
      organization: true,
    },
  });

  if (!subscription) {
    throw new Error('No subscription found for organization');
  }

  return subscription;
}

/**
 * Check if organization is within usage limits for a resource
 */
export async function checkLimit(
  orgId: string,
  resourceType: ResourceType
): Promise<{ allowed: boolean; limit: number; current: number; remaining: number }> {
  const subscription = await getSubscription(orgId);

  // Get current usage
  let currentUsage = 0;
  switch (resourceType) {
    case 'leads':
      currentUsage = subscription.leadCount;
      break;
    case 'properties':
      currentUsage = subscription.propertyCount;
      break;
    case 'users':
      currentUsage = subscription.usedSeats;
      break;
    case 'automations':
    case 'integrations':
      // Count from database
      if (resourceType === 'automations') {
        currentUsage = await prisma.automation.count({
          where: { orgId },
        });
      } else {
        currentUsage = await prisma.integration.count({
          where: { orgId },
        });
      }
      break;
  }

  // Get plan limits
  const limits = getPlanLimits(subscription.plan as SubscriptionPlan);
  const limit = limits[resourceType];
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    limit,
    current: currentUsage,
    remaining,
  };
}

/**
 * Enforce usage limit - throws error if limit exceeded
 */
export async function enforceLimit(orgId: string, resourceType: ResourceType): Promise<void> {
  const check = await checkLimit(orgId, resourceType);

  if (!check.allowed) {
    throw new UsageLimitError(
      `${resourceType} limit exceeded. You've reached ${check.current} of ${check.limit} allowed ${resourceType}.`,
      resourceType,
      check.limit,
      check.current
    );
  }
}

/**
 * Track lead creation
 */
export async function trackLeadCreation(orgId: string, leadId: string, metadata?: any): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Increment lead count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      leadCount: {
        increment: 1,
      },
    },
  });

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'leads',
      action: 'created',
      quantity: 1,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

/**
 * Track property creation
 */
export async function trackPropertyCreation(orgId: string, propertyId: string, metadata?: any): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Increment property count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      propertyCount: {
        increment: 1,
      },
    },
  });

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'properties',
      action: 'created',
      quantity: 1,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

/**
 * Track automation execution
 */
export async function trackAutomationExecution(
  orgId: string,
  automationId: string,
  metadata?: any
): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'automations',
      action: 'updated',
      quantity: 1,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

/**
 * Track integration sync
 */
export async function trackIntegrationSync(
  orgId: string,
  integrationId: string,
  itemsSynced: number,
  metadata?: any
): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'integrations',
      action: 'updated',
      quantity: itemsSynced,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

/**
 * Track lead deletion
 */
export async function trackLeadDeletion(orgId: string, leadId: string): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Decrement lead count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      leadCount: {
        decrement: 1,
      },
    },
  });

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'leads',
      action: 'deleted',
      quantity: 1,
    },
  });
}

/**
 * Track property deletion
 */
export async function trackPropertyDeletion(orgId: string, propertyId: string): Promise<void> {
  const subscription = await getSubscription(orgId);

  // Decrement property count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      propertyCount: {
        decrement: 1,
      },
    },
  });

  // Record usage
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      resourceType: 'properties',
      action: 'deleted',
      quantity: 1,
    },
  });
}

/**
 * Get usage statistics for current billing period
 */
export async function getUsageStats(orgId: string) {
  const subscription = await getSubscription(orgId);
  const limits = getPlanLimits(subscription.plan as SubscriptionPlan);

  // Get usage counts
  const automationCount = await prisma.automation.count({
    where: { orgId },
  });

  const integrationCount = await prisma.integration.count({
    where: { orgId },
  });

  return {
    plan: subscription.plan,
    status: subscription.status,
    usage: {
      leads: {
        current: subscription.leadCount,
        limit: limits.leads,
        percentage: Math.round((subscription.leadCount / limits.leads) * 100),
      },
      properties: {
        current: subscription.propertyCount,
        limit: limits.properties,
        percentage: Math.round((subscription.propertyCount / limits.properties) * 100),
      },
      users: {
        current: subscription.usedSeats,
        limit: limits.users,
        percentage: Math.round((subscription.usedSeats / limits.users) * 100),
      },
      automations: {
        current: automationCount,
        limit: limits.automations,
        percentage: Math.round((automationCount / limits.automations) * 100),
      },
      integrations: {
        current: integrationCount,
        limit: limits.integrations,
        percentage: Math.round((integrationCount / limits.integrations) * 100),
      },
    },
    billingPeriod: {
      start: subscription.createdAt,
      end: subscription.stripeCurrentPeriodEnd || subscription.nextBillingDate,
    },
  };
}

/**
 * Reset monthly usage counters (called by billing webhook on period end)
 */
export async function resetMonthlyUsage(subscriptionId: string): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      leadCount: 0,
      propertyCount: 0,
      // Don't reset usedSeats - that's not monthly
    },
  });
}
