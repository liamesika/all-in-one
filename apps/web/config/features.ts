/**
 * Feature Flags Configuration
 * Centralized configuration for enabling/disabling platform features
 */

export interface FeatureFlags {
  // Vertical features
  realEstate: boolean;
  ecommerce: boolean;
  law: boolean;
  productions: boolean; // Creative/Video Production vertical

  // Advanced features
  aiAdvisor: boolean;
  automations: boolean;
  integrations: boolean;
  campaigns: boolean;

  // Beta features
  betaFeatures: boolean;
}

export const features: FeatureFlags = {
  // Core verticals
  realEstate: true,
  ecommerce: true,
  law: true,
  productions: true, // ✅ ENABLED - Creative Productions Module

  // Advanced features
  aiAdvisor: true,
  automations: true,
  integrations: true,
  campaigns: true,

  // Beta features
  betaFeatures: false,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return features[feature] === true;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
