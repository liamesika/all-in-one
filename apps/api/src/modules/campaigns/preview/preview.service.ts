import { Injectable, Logger } from '@nestjs/common';
import { IntegrationService } from '../integrations/integration.service';
import { CampaignMapper, InternalCampaign, SupportedPlatform } from '../integrations/platform-factory';

/**
 * Campaign Preview Service
 * 
 * Generates campaign previews and estimates for different platforms.
 * Combines platform-specific preview data with our own smart estimates.
 */
@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  constructor(private readonly integrationService: IntegrationService) {}

  /**
   * Generate campaign preview for a specific platform
   */
  async generatePreview(
    campaign: InternalCampaign,
    platform: SupportedPlatform,
    userId?: string
  ): Promise<CampaignPreview> {
    try {
      this.logger.debug(`Generating preview for campaign ${campaign.id} on ${platform}`);

      // Get platform-specific preview if available
      let platformPreview;
      try {
        platformPreview = await this.integrationService.previewCampaign(campaign, platform, userId);
      } catch (error) {
        this.logger.warn(`Platform preview failed for ${platform}, using fallback:`, error);
        platformPreview = null;
      }

      // Generate smart preview using our algorithms
      const smartPreview = await this.generateSmartPreview(campaign, platform);

      // Combine platform and smart previews
      return {
        campaign_id: campaign.id,
        platform,
        preview_data: platformPreview?.preview_data || smartPreview.preview_data,
        estimated_reach: platformPreview?.estimated_reach || smartPreview.estimated_reach,
        estimated_cost_per_result: platformPreview?.estimated_cost_per_result || smartPreview.estimated_cost_per_result,
        smart_insights: smartPreview.smart_insights,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Preview generation failed for ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Generate bulk previews for multiple platforms
   */
  async generateBulkPreview(
    campaign: InternalCampaign,
    platforms: SupportedPlatform[],
    userId?: string
  ): Promise<BulkPreview> {
    this.logger.debug(`Generating bulk preview for campaign ${campaign.id} across ${platforms.length} platforms`);

    const previews: Record<SupportedPlatform, CampaignPreview> = {} as any;
    
    // Generate previews in parallel
    await Promise.all(
      platforms.map(async (platform) => {
        try {
          previews[platform] = await this.generatePreview(campaign, platform, userId);
        } catch (error) {
          this.logger.warn(`Preview failed for ${platform}, skipping:`, error);
          // Skip failed platforms
        }
      })
    );

    // Calculate cross-platform insights
    const crossPlatformInsights = this.calculateCrossPlatformInsights(previews, campaign);

    return {
      campaign_id: campaign.id,
      previews,
      cross_platform_insights: crossPlatformInsights,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Generate smart preview using our own algorithms
   */
  private async generateSmartPreview(
    campaign: InternalCampaign,
    platform: SupportedPlatform
  ): Promise<CampaignPreview> {
    // Map campaign to platform format for consistent processing
    const payload = CampaignMapper.mapToCreatePayload(campaign, platform);

    // Generate preview data based on campaign content
    const previewData = {
      headline: this.generateSmartHeadline(campaign, platform),
      primary_text: payload.creative.primary_text,
      description: this.generateSmartDescription(campaign, platform),
      image_url: payload.creative.images?.[0]?.url,
      call_to_action: this.generateSmartCTA(campaign, platform)
    };

    // Estimate reach based on targeting and platform
    const estimatedReach = this.estimateReach(campaign, platform);

    // Estimate cost per result based on industry benchmarks
    const estimatedCostPerResult = this.estimateCostPerResult(campaign, platform);

    // Generate smart insights
    const smartInsights = this.generateSmartInsights(campaign, platform);

    return {
      campaign_id: campaign.id,
      platform,
      preview_data: previewData,
      estimated_reach: estimatedReach,
      estimated_cost_per_result: estimatedCostPerResult,
      smart_insights: smartInsights,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Generate smart headline based on campaign goal and copy
   */
  private generateSmartHeadline(campaign: InternalCampaign, platform: SupportedPlatform): string {
    const copy = campaign.copy || '';
    const goal = campaign.goal?.toLowerCase() || '';

    // Try to extract first sentence as headline
    const firstSentence = copy.split('.')[0]?.trim();
    
    // Check if first sentence is good headline length for platform
    const maxLength = this.getHeadlineMaxLength(platform);
    if (firstSentence && firstSentence.length <= maxLength && firstSentence.length >= 10) {
      return firstSentence;
    }

    // Generate goal-based headline
    const goalHeadlines = {
      'sales': ['Shop Now & Save', 'Limited Time Offer', 'Best Deals Available'],
      'leads': ['Get Started Today', 'Free Consultation', 'Contact Us Now'],
      'awareness': ['Discover Our Brand', 'Learn More About Us', 'See What We Offer'],
      'traffic': ['Visit Our Website', 'Explore Our Services', 'Learn More'],
      'engagement': ['Join the Community', 'Be Part of Something Great', 'Connect With Us'],
      'video': ['Watch Our Video', 'See It In Action', 'Watch Now'],
      'reach': ['Don\'t Miss Out', 'Everyone\'s Talking About', 'Join Thousands'],
      'app': ['Download Our App', 'Get It On Your Phone', 'Try Our App']
    };

    const headlines = goalHeadlines[goal as keyof typeof goalHeadlines] || goalHeadlines['traffic'];
    return headlines[Math.floor(Math.random() * headlines.length)];
  }

  /**
   * Generate smart description based on campaign content
   */
  private generateSmartDescription(campaign: InternalCampaign, platform: SupportedPlatform): string {
    const copy = campaign.copy || '';
    const maxLength = this.getDescriptionMaxLength(platform);

    // Try to use second sentence or truncate copy
    const sentences = copy.split('.');
    if (sentences.length > 1) {
      const secondSentence = sentences[1]?.trim();
      if (secondSentence && secondSentence.length <= maxLength) {
        return secondSentence;
      }
    }

    // Fallback: truncate copy or use generic description
    if (copy.length <= maxLength) {
      return copy;
    }

    if (copy.length > 10) {
      return `${copy.substring(0, maxLength - 3)}...`;
    }

    return 'Discover amazing products and services that can transform your experience.';
  }

  /**
   * Generate smart call-to-action based on campaign goal
   */
  private generateSmartCTA(campaign: InternalCampaign, platform: SupportedPlatform): { type: string; value?: string } {
    const goal = campaign.goal?.toLowerCase() || '';

    const goalCTAs = {
      'sales': { type: 'SHOP_NOW' },
      'leads': { type: 'SIGN_UP' },
      'awareness': { type: 'LEARN_MORE' },
      'traffic': { type: 'LEARN_MORE' },
      'engagement': { type: 'LEARN_MORE' },
      'video': { type: 'LEARN_MORE', value: 'Watch Now' },
      'reach': { type: 'LEARN_MORE' },
      'app': { type: 'DOWNLOAD' }
    };

    return goalCTAs[goal as keyof typeof goalCTAs] || { type: 'LEARN_MORE' };
  }

  /**
   * Estimate reach based on targeting parameters
   */
  private estimateReach(campaign: InternalCampaign, platform: SupportedPlatform): { min: number; max: number } {
    let baseReach = 10000; // Default base reach

    // Adjust based on platform
    const platformMultipliers = {
      'meta': 1.2,
      'facebook': 1.2,
      'instagram': 0.8,
      'google': 1.0
    };

    baseReach *= platformMultipliers[platform] || 1.0;

    // Adjust based on audience targeting
    if (campaign.audience) {
      const audience = campaign.audience as any;
      
      // Age range impact
      if (audience.ageMin && audience.ageMax) {
        const ageRange = audience.ageMax - audience.ageMin;
        if (ageRange < 10) baseReach *= 0.3; // Very narrow age range
        else if (ageRange < 20) baseReach *= 0.6;
        else if (ageRange < 30) baseReach *= 0.8;
      }

      // Location impact
      if (audience.locations && audience.locations.length > 0) {
        if (audience.locations.length === 1) baseReach *= 0.4; // Single location
        else if (audience.locations.length <= 3) baseReach *= 0.7;
      }

      // Interest targeting impact
      if (audience.interests && audience.interests.length > 0) {
        baseReach *= 0.6; // Interest targeting reduces reach
      }
    }

    const min = Math.round(baseReach * 0.7);
    const max = Math.round(baseReach * 1.5);

    return { min, max };
  }

  /**
   * Estimate cost per result based on industry benchmarks
   */
  private estimateCostPerResult(campaign: InternalCampaign, platform: SupportedPlatform): { min: number; max: number; currency: string } {
    const goal = campaign.goal?.toLowerCase() || '';
    
    // Base costs by goal (in USD)
    const baseCosts = {
      'sales': { min: 2.00, max: 8.00 },
      'leads': { min: 1.50, max: 5.00 },
      'awareness': { min: 0.50, max: 2.00 },
      'traffic': { min: 0.30, max: 1.50 },
      'engagement': { min: 0.20, max: 1.00 },
      'video': { min: 0.10, max: 0.50 },
      'reach': { min: 0.05, max: 0.25 },
      'app': { min: 1.00, max: 4.00 }
    };

    let costs = baseCosts[goal as keyof typeof baseCosts] || baseCosts['traffic'];

    // Platform adjustments
    const platformAdjustments = {
      'meta': 1.0,
      'facebook': 1.0,
      'instagram': 1.2,
      'google': 1.3
    };

    const adjustment = platformAdjustments[platform] || 1.0;
    costs = {
      min: costs.min * adjustment,
      max: costs.max * adjustment
    };

    return {
      min: Math.round(costs.min * 100) / 100,
      max: Math.round(costs.max * 100) / 100,
      currency: 'USD'
    };
  }

  /**
   * Generate smart insights for campaign optimization
   */
  private generateSmartInsights(campaign: InternalCampaign, platform: SupportedPlatform): SmartInsight[] {
    const insights: SmartInsight[] = [];
    const copy = campaign.copy || '';

    // Copy length analysis
    const copyLength = copy.length;
    if (copyLength > 125 && (platform === 'meta' || platform === 'facebook' || platform === 'instagram')) {
      insights.push({
        type: 'warning',
        category: 'copy',
        message: 'Your ad copy is longer than 125 characters and may be truncated on mobile devices.',
        suggestion: 'Consider shortening your copy to 125 characters or less for better visibility.',
        impact: 'medium'
      });
    }

    if (copyLength < 20) {
      insights.push({
        type: 'suggestion',
        category: 'copy',
        message: 'Your ad copy is quite short.',
        suggestion: 'Consider adding more compelling details about your offer or benefits.',
        impact: 'low'
      });
    }

    // Image analysis
    if (!campaign.image) {
      insights.push({
        type: 'warning',
        category: 'creative',
        message: 'No image provided for your campaign.',
        suggestion: 'Visual content significantly improves engagement. Consider adding a compelling image.',
        impact: 'high'
      });
    }

    // Audience insights
    if (!campaign.audience) {
      insights.push({
        type: 'suggestion',
        category: 'targeting',
        message: 'No specific audience targeting defined.',
        suggestion: 'Define your target audience to improve campaign performance and reduce costs.',
        impact: 'high'
      });
    }

    // Goal-specific insights
    const goal = campaign.goal?.toLowerCase() || '';
    if (goal === 'sales' && !copy.toLowerCase().includes('price') && !copy.toLowerCase().includes('offer') && !copy.toLowerCase().includes('discount')) {
      insights.push({
        type: 'suggestion',
        category: 'copy',
        message: 'Sales campaigns often perform better with clear value propositions.',
        suggestion: 'Consider mentioning pricing, discounts, or special offers in your copy.',
        impact: 'medium'
      });
    }

    // Platform-specific insights
    if (platform === 'google' && goal !== 'traffic' && goal !== 'sales') {
      insights.push({
        type: 'info',
        category: 'platform',
        message: 'Google Ads typically performs best for traffic and sales objectives.',
        suggestion: 'Consider using Meta platforms for brand awareness and engagement campaigns.',
        impact: 'low'
      });
    }

    return insights;
  }

  /**
   * Calculate insights across multiple platforms
   */
  private calculateCrossPlatformInsights(
    previews: Record<SupportedPlatform, CampaignPreview>,
    campaign: InternalCampaign
  ): CrossPlatformInsight[] {
    const insights: CrossPlatformInsight[] = [];
    const platforms = Object.keys(previews) as SupportedPlatform[];

    if (platforms.length < 2) return insights;

    // Compare reach across platforms
    const reaches = platforms.map(p => ({
      platform: p,
      reach: (previews[p]?.estimated_reach?.min || 0) + (previews[p]?.estimated_reach?.max || 0) / 2
    })).sort((a, b) => b.reach - a.reach);

    if (reaches.length >= 2) {
      insights.push({
        type: 'info',
        category: 'reach',
        message: `${reaches[0].platform} offers the highest estimated reach (${reaches[0].reach.toLocaleString()}) for this campaign.`,
        affected_platforms: platforms,
        recommendation: `Consider starting with ${reaches[0].platform} for maximum visibility.`
      });
    }

    // Compare costs across platforms
    const costs = platforms.map(p => ({
      platform: p,
      cost: ((previews[p]?.estimated_cost_per_result?.min || 0) + (previews[p]?.estimated_cost_per_result?.max || 0)) / 2
    })).sort((a, b) => a.cost - b.cost);

    if (costs.length >= 2) {
      insights.push({
        type: 'suggestion',
        category: 'budget',
        message: `${costs[0].platform} offers the lowest estimated cost per result ($${costs[0].cost.toFixed(2)}).`,
        affected_platforms: platforms,
        recommendation: `Consider allocating more budget to ${costs[0].platform} for cost efficiency.`
      });
    }

    return insights;
  }

  // Helper methods for platform-specific limits
  private getHeadlineMaxLength(platform: SupportedPlatform): number {
    const limits = {
      'meta': 27,
      'facebook': 27,
      'instagram': 27,
      'google': 30
    };
    return limits[platform] || 30;
  }

  private getDescriptionMaxLength(platform: SupportedPlatform): number {
    const limits = {
      'meta': 125,
      'facebook': 125,
      'instagram': 125,
      'google': 90
    };
    return limits[platform] || 90;
  }
}

// ==================== Type Definitions ====================

export interface CampaignPreview {
  campaign_id: string;
  platform: SupportedPlatform;
  preview_data: {
    headline: string;
    primary_text: string;
    description?: string;
    image_url?: string;
    call_to_action?: { type: string; value?: string };
  };
  estimated_reach?: {
    min: number;
    max: number;
  };
  estimated_cost_per_result?: {
    min: number;
    max: number;
    currency: string;
  };
  smart_insights: SmartInsight[];
  generated_at: string;
}

export interface BulkPreview {
  campaign_id: string;
  previews: Record<SupportedPlatform, CampaignPreview>;
  cross_platform_insights: CrossPlatformInsight[];
  generated_at: string;
}

export interface SmartInsight {
  type: 'info' | 'warning' | 'suggestion';
  category: 'copy' | 'creative' | 'targeting' | 'platform' | 'budget';
  message: string;
  suggestion?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface CrossPlatformInsight {
  type: 'info' | 'warning' | 'suggestion';
  category: 'reach' | 'budget' | 'performance';
  message: string;
  affected_platforms: SupportedPlatform[];
  recommendation: string;
}