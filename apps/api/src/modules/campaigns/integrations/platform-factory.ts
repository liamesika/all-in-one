import { AdsPlatform } from './ads-platform.interface';
import { MetaAdsAdapter, createMetaAdsAdapter } from './meta-ads.adapter';
import { GoogleAdsAdapter, createGoogleAdsAdapter } from './google-ads.adapter';

/**
 * Supported advertising platforms
 */
export type SupportedPlatform = 'meta' | 'google' | 'facebook' | 'instagram';

/**
 * Platform Factory
 * 
 * Creates and manages advertising platform adapter instances.
 * Handles platform-specific configuration and authentication.
 */
export class PlatformFactory {
  private static instances: Map<string, AdsPlatform> = new Map();

  /**
   * Get a platform adapter instance
   * Reuses existing instances for efficiency
   */
  static getPlatform(platform: SupportedPlatform, userId?: string): AdsPlatform {
    const cacheKey = `${platform}-${userId || 'default'}`;
    
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    const adapter = this.createPlatform(platform, userId);
    this.instances.set(cacheKey, adapter);
    return adapter;
  }

  /**
   * Create a new platform adapter instance
   */
  private static createPlatform(platform: SupportedPlatform, userId?: string): AdsPlatform {
    switch (platform) {
      case 'meta':
      case 'facebook':
      case 'instagram':
        return createMetaAdsAdapter();
      
      case 'google':
        return createGoogleAdsAdapter();
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Clear cached instances (useful for testing or credential updates)
   */
  static clearCache(platform?: SupportedPlatform, userId?: string): void {
    if (platform && userId) {
      const cacheKey = `${platform}-${userId}`;
      this.instances.delete(cacheKey);
    } else if (platform) {
      // Clear all instances for a platform
      const keysToDelete = Array.from(this.instances.keys())
        .filter(key => key.startsWith(`${platform}-`));
      keysToDelete.forEach(key => this.instances.delete(key));
    } else {
      // Clear all instances
      this.instances.clear();
    }
  }

  /**
   * Check if a platform is supported
   */
  static isSupported(platform: string): platform is SupportedPlatform {
    return ['meta', 'google', 'facebook', 'instagram'].includes(platform as SupportedPlatform);
  }

  /**
   * Get list of supported platforms
   */
  static getSupportedPlatforms(): SupportedPlatform[] {
    return ['meta', 'google', 'facebook', 'instagram'];
  }

  /**
   * Validate platform connections (health check)
   */
  static async validateConnections(): Promise<Record<SupportedPlatform, boolean>> {
    const platforms = this.getSupportedPlatforms();
    const results: Record<SupportedPlatform, boolean> = {} as any;

    await Promise.all(
      platforms.map(async (platform) => {
        try {
          const adapter = this.getPlatform(platform);
          results[platform] = await adapter.validateConnection();
        } catch (error) {
          results[platform] = false;
        }
      })
    );

    return results;
  }
}

/**
 * Campaign Mapping Utilities
 * 
 * Maps between internal campaign structure and platform-specific formats
 */
export class CampaignMapper {
  /**
   * Map internal campaign to platform-specific payload
   */
  static mapToCreatePayload(
    campaign: InternalCampaign, 
    platform: SupportedPlatform
  ): import('./ads-platform.interface').CreateCampaignPayload {
    const basePayload = {
      name: campaign.goal || 'Untitled Campaign',
      objective: this.mapGoalToObjective(campaign.goal),
      budget: {
        type: 'DAILY' as const,
        amount: 10.00, // Default budget
        currency: 'USD'
      },
      targeting: this.mapAudience(campaign.audience),
      creative: this.mapCreative(campaign),
      schedule: campaign.schedule ? {
        start_date: campaign.schedule.start_date,
        end_date: campaign.schedule.end_date,
        timezone: 'America/New_York'
      } : undefined
    };

    // Add platform-specific modifications
    switch (platform) {
      case 'meta':
      case 'facebook':
      case 'instagram':
        return {
          ...basePayload,
          platform_specific: {
            special_ad_categories: [],
            instagram_actor_id: platform === 'instagram' ? process.env.META_INSTAGRAM_ACCOUNT_ID : undefined
          }
        };
      
      case 'google':
        return {
          ...basePayload,
          platform_specific: {
            advertising_channel_type: this.mapObjectiveToGoogleChannel(basePayload.objective),
            network_settings: {
              target_google_search: true,
              target_search_network: true,
              target_content_network: false,
              target_partner_search_network: false
            }
          }
        };
      
      default:
        return basePayload;
    }
  }

  /**
   * Map campaign goal to standard objective
   */
  private static mapGoalToObjective(goal: string): import('./ads-platform.interface').CampaignObjective {
    const goalMap: Record<string, import('./ads-platform.interface').CampaignObjective> = {
      'sales': 'CONVERSIONS',
      'leads': 'LEAD_GENERATION',
      'awareness': 'BRAND_AWARENESS',
      'traffic': 'TRAFFIC',
      'engagement': 'ENGAGEMENT',
      'video': 'VIDEO_VIEWS',
      'reach': 'REACH',
      'app': 'APP_INSTALLS'
    };

    return goalMap[goal?.toLowerCase()] || 'TRAFFIC';
  }

  /**
   * Map audience data to targeting structure
   */
  private static mapAudience(audience: any): import('./ads-platform.interface').Targeting {
    if (!audience) {
      return {
        demographics: {
          age_min: 18,
          age_max: 65,
          genders: ['all']
        },
        geography: {
          countries: ['US']
        }
      };
    }

    return {
      demographics: {
        age_min: audience.ageMin || 18,
        age_max: audience.ageMax || 65,
        genders: audience.genders || ['all'],
        languages: audience.languages || ['en']
      },
      geography: {
        countries: audience.locations || ['US']
      },
      interests: audience.interests || [],
      behaviors: audience.behaviors || []
    };
  }

  /**
   * Map creative data to standard format
   */
  private static mapCreative(campaign: InternalCampaign): import('./ads-platform.interface').Creative {
    return {
      primary_text: campaign.copy || '',
      headline: this.generateHeadline(campaign.goal, campaign.copy),
      description: this.generateDescription(campaign.copy),
      images: campaign.image ? [{
        url: campaign.image,
        alt_text: `${campaign.goal} campaign image`
      }] : undefined,
      website_url: campaign.website_url || process.env.DEFAULT_WEBSITE_URL || 'https://example.com',
      display_url: this.generateDisplayUrl(campaign.website_url)
    };
  }

  /**
   * Generate headline from goal and copy
   */
  private static generateHeadline(goal: string, copy: string): string {
    // Extract first sentence or first 30 characters as headline
    const firstSentence = copy?.split('.')[0] || '';
    if (firstSentence.length <= 30) {
      return firstSentence;
    }

    const headlineMap: Record<string, string> = {
      'sales': 'Shop Now & Save',
      'leads': 'Get Started Today',
      'awareness': 'Discover Our Brand',
      'traffic': 'Learn More',
      'engagement': 'Join Us Today',
      'video': 'Watch Now',
      'reach': 'Don\'t Miss Out',
      'app': 'Download Now'
    };

    return headlineMap[goal?.toLowerCase()] || 'Learn More';
  }

  /**
   * Generate description from copy
   */
  private static generateDescription(copy: string): string {
    if (!copy) return 'Discover amazing products and services.';
    
    // Take second sentence or truncate to 90 chars
    const sentences = copy.split('.');
    if (sentences.length > 1 && sentences[1].trim().length <= 90) {
      return sentences[1].trim();
    }

    return copy.length <= 90 ? copy : `${copy.substring(0, 87)}...`;
  }

  /**
   * Generate display URL from website URL
   */
  private static generateDisplayUrl(websiteUrl?: string): string {
    if (!websiteUrl) return 'example.com';
    
    try {
      const url = new URL(websiteUrl);
      return url.hostname.replace('www.', '');
    } catch {
      return 'example.com';
    }
  }

  /**
   * Map objective to Google Ads channel type
   */
  private static mapObjectiveToGoogleChannel(objective: import('./ads-platform.interface').CampaignObjective): string {
    const channelMap: Record<import('./ads-platform.interface').CampaignObjective, string> = {
      'BRAND_AWARENESS': 'DISPLAY',
      'LEAD_GENERATION': 'SEARCH',
      'CONVERSIONS': 'SEARCH',
      'TRAFFIC': 'SEARCH',
      'ENGAGEMENT': 'DISPLAY',
      'VIDEO_VIEWS': 'VIDEO',
      'REACH': 'DISPLAY',
      'APP_INSTALLS': 'APP'
    };

    return channelMap[objective] || 'SEARCH';
  }

  /**
   * Map platform result back to internal format
   */
  static mapFromPlatformResult(
    result: import('./ads-platform.interface').PlatformCampaignResult,
    platform: SupportedPlatform
  ): InternalCampaignResult {
    return {
      internal_id: '', // Will be set by the service
      platform_id: result.platform_campaign_id,
      platform_name: platform,
      name: result.name,
      status: this.mapPlatformStatus(result.status),
      objective: result.objective,
      created_at: result.created_time,
      updated_at: result.updated_time,
      platform_data: result.platform_specific || {}
    };
  }

  /**
   * Map platform status to internal status
   */
  private static mapPlatformStatus(status: import('./ads-platform.interface').CampaignStatus): string {
    const statusMap: Record<import('./ads-platform.interface').CampaignStatus, string> = {
      'DRAFT': 'DRAFT',
      'ACTIVE': 'ACTIVE',
      'PAUSED': 'PAUSED',
      'DELETED': 'ARCHIVED',
      'ARCHIVED': 'ARCHIVED'
    };

    return statusMap[status] || 'DRAFT';
  }
}

/**
 * Platform Connection Manager
 * 
 * Manages authentication and connection state for platforms
 */
export class ConnectionManager {
  /**
   * Test connection to a platform
   */
  static async testConnection(
    platform: SupportedPlatform, 
    userId?: string
  ): Promise<ConnectionResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      const isConnected = await adapter.validateConnection();
      
      if (isConnected) {
        const accountInfo = await adapter.getAccountInfo();
        return {
          platform,
          connected: true,
          account: accountInfo
        };
      } else {
        return {
          platform,
          connected: false,
          error: 'Authentication failed'
        };
      }
    } catch (error) {
      return {
        platform,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test all platform connections
   */
  static async testAllConnections(userId?: string): Promise<ConnectionResult[]> {
    const platforms = PlatformFactory.getSupportedPlatforms();
    
    return await Promise.all(
      platforms.map(platform => this.testConnection(platform, userId))
    );
  }
}

// ==================== Type Definitions ====================

/**
 * Internal campaign representation (from our database)
 */
export interface InternalCampaign {
  id: string;
  goal: string;
  copy: string;
  image?: string | null;
  platform?: string | null;
  status: string;
  audience?: {
    ageMin?: number;
    ageMax?: number;
    locations?: string[];
    interests?: string[];
    genders?: string[];
    languages?: string[];
  } | null;
  schedule?: {
    start_date: string;
    end_date?: string;
  };
  website_url?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Internal campaign result after platform sync
 */
export interface InternalCampaignResult {
  internal_id: string;
  platform_id: string;
  platform_name: SupportedPlatform;
  name: string;
  status: string;
  objective: import('./ads-platform.interface').CampaignObjective;
  created_at: string;
  updated_at: string;
  platform_data: Record<string, any>;
}

/**
 * Connection test result
 */
export interface ConnectionResult {
  platform: SupportedPlatform;
  connected: boolean;
  account?: import('./ads-platform.interface').AccountInfo;
  error?: string;
}