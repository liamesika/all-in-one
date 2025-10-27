import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

export type FeatureKey =
  | 'ai_descriptions'
  | 'ai_images'
  | 'ai_images_bulk' // Batch generation >2 images
  | 'campaigns'
  | 'advanced_analytics'
  | 'csv_builder'
  | 'csv_export' // PSI PDF export
  | 'api_access'
  | 'white_label'
  | 'unlimited_leads'
  | 'unlimited_properties'
  | 'ai_property_scoring' // AI property scoring >10/day
  | 'video_renders' // Video renders >3
  | 'document_generation'; // Document generation >3/day

export interface Subscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialEndsAt?: Date | null;
}

export interface FeatureLimits {
  aiDescriptions: number | 'unlimited';
  aiImages: number | 'unlimited';
  campaigns: number | 'unlimited';
  leads: number | 'unlimited';
  properties: number | 'unlimited';
}

export function hasAccess(
  subscription: Subscription | null,
  featureKey: FeatureKey
): boolean {
  if (!subscription) return false;

  const { status, plan, trialEndsAt } = subscription;

  // Check if subscription is active
  const isActive =
    status === 'ACTIVE' ||
    status === 'TRIALING' ||
    (status === 'TRIAL' && trialEndsAt && new Date(trialEndsAt) > new Date());

  if (!isActive) return false;

  // Feature access by plan
  const featureAccess: Record<SubscriptionPlan, Set<FeatureKey>> = {
    BASIC: new Set([
      // Limited features
    ]),
    PRO: new Set([
      'ai_descriptions',
      'ai_images',
      'ai_images_bulk',
      'campaigns',
      'advanced_analytics',
      'csv_builder',
      'csv_export',
      'unlimited_leads',
      'unlimited_properties',
      'ai_property_scoring',
      'video_renders',
      'document_generation',
    ]),
    AGENCY: new Set([
      'ai_descriptions',
      'ai_images',
      'ai_images_bulk',
      'campaigns',
      'advanced_analytics',
      'csv_builder',
      'csv_export',
      'api_access',
      'white_label',
      'unlimited_leads',
      'unlimited_properties',
      'ai_property_scoring',
      'video_renders',
      'document_generation',
    ]),
    ENTERPRISE: new Set([
      'ai_descriptions',
      'ai_images',
      'ai_images_bulk',
      'campaigns',
      'advanced_analytics',
      'csv_builder',
      'csv_export',
      'api_access',
      'white_label',
      'unlimited_leads',
      'unlimited_properties',
      'ai_property_scoring',
      'video_renders',
      'document_generation',
    ]),
  };

  return featureAccess[plan]?.has(featureKey) || false;
}

export function getFeatureLimits(subscription: Subscription | null): FeatureLimits {
  if (!subscription) {
    return {
      aiDescriptions: 0,
      aiImages: 0,
      campaigns: 0,
      leads: 0,
      properties: 0,
    };
  }

  const { status, plan, trialEndsAt } = subscription;

  // Check if subscription is active
  const isActive =
    status === 'ACTIVE' ||
    status === 'TRIALING' ||
    (status === 'TRIAL' && trialEndsAt && new Date(trialEndsAt) > new Date());

  if (!isActive) {
    return {
      aiDescriptions: 0,
      aiImages: 0,
      campaigns: 0,
      leads: 0,
      properties: 0,
    };
  }

  // Limits by plan
  const limits: Record<SubscriptionPlan, FeatureLimits> = {
    BASIC: {
      aiDescriptions: 10,
      aiImages: 50,
      campaigns: 5,
      leads: 100,
      properties: 50,
    },
    PRO: {
      aiDescriptions: 'unlimited',
      aiImages: 'unlimited',
      campaigns: 'unlimited',
      leads: 'unlimited',
      properties: 'unlimited',
    },
    AGENCY: {
      aiDescriptions: 'unlimited',
      aiImages: 'unlimited',
      campaigns: 'unlimited',
      leads: 'unlimited',
      properties: 'unlimited',
    },
    ENTERPRISE: {
      aiDescriptions: 'unlimited',
      aiImages: 'unlimited',
      campaigns: 'unlimited',
      leads: 'unlimited',
      properties: 'unlimited',
    },
  };

  return limits[plan];
}

export function getTrialDaysRemaining(subscription: Subscription | null): number | null {
  if (!subscription || !subscription.trialEndsAt) return null;

  const now = new Date();
  const endsAt = new Date(subscription.trialEndsAt);

  if (endsAt <= now) return 0;

  return Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isTrialExpired(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  const { status, trialEndsAt } = subscription;

  if (status === 'EXPIRED') return true;

  if ((status === 'TRIAL' || status === 'TRIALING') && trialEndsAt) {
    return new Date(trialEndsAt) <= new Date();
  }

  return false;
}
