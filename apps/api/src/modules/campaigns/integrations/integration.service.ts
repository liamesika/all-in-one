import { Injectable, Logger } from '@nestjs/common';
import { 
  PlatformFactory, 
  CampaignMapper, 
  ConnectionManager,
  InternalCampaign,
  SupportedPlatform 
} from './platform-factory';
import { 
  AdsPlatform, 
  CreateCampaignPayload,
  ValidationResult,
  PreviewResult,
  AdsPlatformError 
} from './ads-platform.interface';

/**
 * Campaign Integration Service
 * 
 * Handles integration between internal campaign management and external
 * advertising platforms (Meta, Google Ads, etc.)
 */
@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  /**
   * Validate campaign for a specific platform
   */
  async validateCampaign(
    campaign: InternalCampaign,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<ValidationResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      const payload = CampaignMapper.mapToCreatePayload(campaign, platform);
      
      this.logger.debug(`Validating campaign ${campaign.id} for platform ${platform}`);
      return await adapter.validateCampaign(payload);
    } catch (error) {
      this.logger.error(`Campaign validation failed for platform ${platform}:`, error);
      
      return {
        valid: false,
        errors: [{
          field: 'platform',
          message: error instanceof Error ? error.message : 'Validation failed',
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  /**
   * Generate campaign preview for a platform
   */
  async previewCampaign(
    campaign: InternalCampaign,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<PreviewResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      const payload = CampaignMapper.mapToCreatePayload(campaign, platform);
      
      this.logger.debug(`Generating preview for campaign ${campaign.id} on platform ${platform}`);
      return await adapter.previewCampaign(payload);
    } catch (error) {
      this.logger.error(`Preview generation failed for platform ${platform}:`, error);
      throw new Error(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create campaign on external platform
   */
  async createCampaignOnPlatform(
    campaign: InternalCampaign,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<PlatformCampaignResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      const payload = CampaignMapper.mapToCreatePayload(campaign, platform);
      
      // Validate before creating
      const validation = await adapter.validateCampaign(payload);
      if (!validation.valid) {
        throw new AdsPlatformError(
          `Campaign validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          platform,
          'VALIDATION_FAILED',
          validation.errors
        );
      }

      this.logger.log(`Creating campaign ${campaign.id} on platform ${platform}`);
      const result = await adapter.createCampaign(payload);
      
      this.logger.log(`Successfully created campaign ${result.platform_campaign_id} on ${platform}`);
      return {
        internal_id: campaign.id,
        platform_campaign_id: result.platform_campaign_id,
        platform_name: platform,
        status: result.status,
        created_at: result.created_time,
        platform_data: result.platform_specific || {}
      };
    } catch (error) {
      this.logger.error(`Campaign creation failed on platform ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Sync campaign status from platform back to internal system
   */
  async syncCampaignStatus(
    platformCampaignId: string,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<CampaignSyncResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      const campaignData = await adapter.getCampaign(platformCampaignId);
      
      if (!campaignData) {
        return {
          success: false,
          error: 'Campaign not found on platform'
        };
      }

      return {
        success: true,
        status: campaignData.status,
        updated_at: campaignData.updated_time,
        platform_data: campaignData.platform_specific || {}
      };
    } catch (error) {
      this.logger.error(`Campaign sync failed for platform ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }

  /**
   * Publish campaign on platform (set to active)
   */
  async publishCampaign(
    platformCampaignId: string,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<boolean> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      
      this.logger.log(`Publishing campaign ${platformCampaignId} on ${platform}`);
      const success = await adapter.publishCampaign(platformCampaignId);
      
      if (success) {
        this.logger.log(`Successfully published campaign ${platformCampaignId} on ${platform}`);
      } else {
        this.logger.warn(`Failed to publish campaign ${platformCampaignId} on ${platform}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Campaign publishing failed on platform ${platform}:`, error);
      return false;
    }
  }

  /**
   * Pause campaign on platform
   */
  async pauseCampaign(
    platformCampaignId: string,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<boolean> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      
      this.logger.log(`Pausing campaign ${platformCampaignId} on ${platform}`);
      const success = await adapter.pauseCampaign(platformCampaignId);
      
      return success;
    } catch (error) {
      this.logger.error(`Campaign pausing failed on platform ${platform}:`, error);
      return false;
    }
  }

  /**
   * Get campaign metrics from platform
   */
  async getCampaignMetrics(
    platformCampaignId: string,
    platform: SupportedPlatform,
    dateRange: { start_date: string; end_date: string },
    userId?: string
  ): Promise<CampaignMetricsResult> {
    try {
      const adapter = PlatformFactory.getPlatform(platform, userId);
      
      this.logger.debug(`Fetching metrics for campaign ${platformCampaignId} on ${platform}`);
      const metrics = await adapter.getCampaignMetrics(platformCampaignId, dateRange);
      
      return {
        success: true,
        metrics,
        fetched_at: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Metrics fetching failed for platform ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Metrics fetch failed'
      };
    }
  }

  /**
   * Test connections to all platforms
   */
  async testConnections(userId?: string): Promise<Record<SupportedPlatform, boolean>> {
    this.logger.debug('Testing platform connections');
    
    const results = await PlatformFactory.validateConnections();
    
    this.logger.log(`Platform connection results:`, results);
    return results;
  }

  /**
   * Get detailed connection info for all platforms
   */
  async getConnectionDetails(userId?: string): Promise<ConnectionDetails[]> {
    const connections = await ConnectionManager.testAllConnections(userId);
    
    return connections.map(conn => ({
      platform: conn.platform,
      connected: conn.connected,
      account_name: conn.account?.account_name,
      account_id: conn.account?.account_id,
      currency: conn.account?.currency,
      status: conn.account?.account_status,
      error: conn.error,
      last_checked: new Date().toISOString()
    }));
  }

  /**
   * Bulk validate campaigns for multiple platforms
   */
  async bulkValidateCampaign(
    campaign: InternalCampaign,
    platforms: SupportedPlatform[],
    userId?: string
  ): Promise<BulkValidationResult> {
    const results: Record<SupportedPlatform, ValidationResult> = {} as any;
    
    await Promise.all(
      platforms.map(async (platform) => {
        try {
          results[platform] = await this.validateCampaign(campaign, platform, userId);
        } catch (error) {
          results[platform] = {
            valid: false,
            errors: [{
              field: 'platform',
              message: error instanceof Error ? error.message : 'Validation failed',
              code: 'PLATFORM_ERROR'
            }],
            warnings: []
          };
        }
      })
    );

    const validPlatforms = Object.entries(results)
      .filter(([_, result]) => result.valid)
      .map(([platform, _]) => platform as SupportedPlatform);

    const invalidPlatforms = Object.entries(results)
      .filter(([_, result]) => !result.valid)
      .map(([platform, _]) => platform as SupportedPlatform);

    return {
      campaign_id: campaign.id,
      valid_platforms: validPlatforms,
      invalid_platforms: invalidPlatforms,
      results,
      validated_at: new Date().toISOString()
    };
  }

  /**
   * Generate campaign preview for multiple platforms
   */
  async bulkPreviewCampaign(
    campaign: InternalCampaign,
    platforms: SupportedPlatform[],
    userId?: string
  ): Promise<BulkPreviewResult> {
    const previews: Record<SupportedPlatform, PreviewResult> = {} as any;
    
    await Promise.all(
      platforms.map(async (platform) => {
        try {
          previews[platform] = await this.previewCampaign(campaign, platform, userId);
        } catch (error) {
          // Skip platforms that fail preview generation
          this.logger.warn(`Preview failed for platform ${platform}: ${error}`);
        }
      })
    );

    return {
      campaign_id: campaign.id,
      previews,
      generated_at: new Date().toISOString()
    };
  }
}

// ==================== Type Definitions ====================

export interface PlatformCampaignResult {
  internal_id: string;
  platform_campaign_id: string;
  platform_name: SupportedPlatform;
  status: string;
  created_at: string;
  platform_data: Record<string, any>;
}

export interface CampaignSyncResult {
  success: boolean;
  status?: string;
  updated_at?: string;
  platform_data?: Record<string, any>;
  error?: string;
}

export interface CampaignMetricsResult {
  success: boolean;
  metrics?: import('./ads-platform.interface').CampaignMetrics;
  fetched_at?: string;
  error?: string;
}

export interface ConnectionDetails {
  platform: SupportedPlatform;
  connected: boolean;
  account_name?: string;
  account_id?: string;
  currency?: string;
  status?: string;
  error?: string;
  last_checked: string;
}

export interface BulkValidationResult {
  campaign_id: string;
  valid_platforms: SupportedPlatform[];
  invalid_platforms: SupportedPlatform[];
  results: Record<SupportedPlatform, ValidationResult>;
  validated_at: string;
}

export interface BulkPreviewResult {
  campaign_id: string;
  previews: Record<SupportedPlatform, PreviewResult>;
  generated_at: string;
}