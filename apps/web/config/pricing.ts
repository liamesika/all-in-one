/**
 * Pricing configuration for EFFINITY subscription plans
 */

export type PricingPlan = 'BASIC' | 'PRO' | 'AGENCY' | 'ENTERPRISE';

export interface PlanLimits {
  users: number;
  leads: number;
  properties: number;
  automations: number;
  integrations: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface PlanConfig {
  name: string;
  price: number | null;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  limits: PlanLimits;
  highlighted?: boolean;
  ctaText: string;
}

export const PRICING: Record<PricingPlan, PlanConfig> = {
  BASIC: {
    name: 'Basic',
    price: 29,
    currency: 'USD',
    interval: 'month',
    description: 'Perfect for individual agents and small teams getting started',
    features: [
      '1 user seat',
      '100 leads per month',
      '50 properties',
      '5 automations',
      '3 integrations',
      'Basic reports',
      'Email support',
      'Mobile app access',
    ],
    limits: {
      users: 1,
      leads: 100,
      properties: 50,
      automations: 5,
      integrations: 3,
    },
    ctaText: 'Start Free Trial',
  },
  PRO: {
    name: 'Pro',
    price: 99,
    currency: 'USD',
    interval: 'month',
    description: 'For growing teams with advanced automation needs',
    features: [
      '5 user seats',
      '1,000 leads per month',
      '500 properties',
      '50 automations',
      'Unlimited integrations',
      'Advanced automations',
      'Custom reports',
      'Priority support',
      'API access (basic)',
      'Team collaboration tools',
    ],
    limits: {
      users: 5,
      leads: 1000,
      properties: 500,
      automations: 50,
      integrations: 999,
    },
    highlighted: true,
    ctaText: 'Start Free Trial',
  },
  AGENCY: {
    name: 'Agency',
    price: 299,
    currency: 'USD',
    interval: 'month',
    description: 'For agencies managing multiple properties and clients',
    features: [
      'Unlimited users',
      'Unlimited leads',
      'Unlimited properties',
      'Unlimited automations',
      'Unlimited integrations',
      'White-label options',
      'Full API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'Multi-language support',
      'Custom training',
    ],
    limits: {
      users: 999999,
      leads: 999999,
      properties: 999999,
      automations: 999999,
      integrations: 999999,
    },
    ctaText: 'Start Free Trial',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null, // Custom pricing
    currency: 'USD',
    interval: 'month',
    description: 'Custom solution for large organizations with specific needs',
    features: [
      'Everything in Agency',
      'Custom features development',
      'On-premise deployment option',
      'SLA guarantees',
      'Custom training & onboarding',
      '24/7 premium support',
      'Dedicated account manager',
      'Custom contract terms',
      'Advanced security features',
      'Compliance support',
    ],
    limits: {
      users: 999999,
      leads: 999999,
      properties: 999999,
      automations: 999999,
      integrations: 999999,
    },
    ctaText: 'Contact Sales',
  },
};

/**
 * Get plan configuration by name
 */
export function getPlanConfig(plan: PricingPlan): PlanConfig {
  return PRICING[plan];
}

/**
 * Get plan limits by name
 */
export function getPlanLimits(plan: PricingPlan): PlanLimits {
  return PRICING[plan].limits;
}

/**
 * Check if a plan allows a specific limit
 */
export function checkPlanLimit(
  plan: PricingPlan,
  resource: keyof PlanLimits,
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(plan);
  const limit = limits[resource];
  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    limit,
    remaining,
  };
}

/**
 * Get the next upgrade plan
 */
export function getNextUpgradePlan(currentPlan: PricingPlan): PricingPlan | null {
  const planOrder: PricingPlan[] = ['BASIC', 'PRO', 'AGENCY', 'ENTERPRISE'];
  const currentIndex = planOrder.indexOf(currentPlan);

  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null;
  }

  return planOrder[currentIndex + 1];
}

/**
 * Compare two plans to determine if one is an upgrade
 */
export function isUpgrade(fromPlan: PricingPlan, toPlan: PricingPlan): boolean {
  const planOrder: PricingPlan[] = ['BASIC', 'PRO', 'AGENCY', 'ENTERPRISE'];
  const fromIndex = planOrder.indexOf(fromPlan);
  const toIndex = planOrder.indexOf(toPlan);

  return toIndex > fromIndex;
}

/**
 * Get formatted price string
 */
export function formatPrice(plan: PricingPlan): string {
  const config = getPlanConfig(plan);

  if (config.price === null) {
    return 'Custom';
  }

  return `$${config.price}/${config.interval}`;
}
