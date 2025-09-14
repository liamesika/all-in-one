import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { PreviewService } from './preview.service';
import { SupportedPlatform } from '../integrations/platform-factory';

/**
 * Campaign Preview Controller
 * 
 * REST API for generating campaign previews and estimates
 */
@Controller('api/campaigns/preview')
export class PreviewController {
  private readonly logger = new Logger(PreviewController.name);

  constructor(private readonly previewService: PreviewService) {}

  /**
   * Generate preview for a single platform
   * POST /api/campaigns/preview/:platform
   */
  @Post(':platform')
  async generatePreview(
    @Param('platform') platform: string,
    @Body() body: GeneratePreviewRequest,
    @Query('userId') userId?: string
  ) {
    try {
      if (!this.isSupportedPlatform(platform)) {
        throw new HttpException('Unsupported platform', HttpStatus.BAD_REQUEST);
      }

      if (!body.campaign) {
        throw new HttpException('Campaign data is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Generating preview for platform ${platform}`);

      const preview = await this.previewService.generatePreview(
        body.campaign,
        platform as SupportedPlatform,
        userId
      );

      return {
        success: true,
        data: preview
      };
    } catch (error) {
      this.logger.error(`Preview generation failed:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to generate campaign preview',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Generate previews for multiple platforms
   * POST /api/campaigns/preview/bulk
   */
  @Post('bulk')
  async generateBulkPreview(
    @Body() body: GenerateBulkPreviewRequest,
    @Query('userId') userId?: string
  ) {
    try {
      if (!body.campaign) {
        throw new HttpException('Campaign data is required', HttpStatus.BAD_REQUEST);
      }

      if (!body.platforms || body.platforms.length === 0) {
        throw new HttpException('At least one platform is required', HttpStatus.BAD_REQUEST);
      }

      // Validate all platforms
      const invalidPlatforms = body.platforms.filter(p => !this.isSupportedPlatform(p));
      if (invalidPlatforms.length > 0) {
        throw new HttpException(
          `Unsupported platforms: ${invalidPlatforms.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.log(`Generating bulk preview for ${body.platforms.length} platforms`);

      const bulkPreview = await this.previewService.generateBulkPreview(
        body.campaign,
        body.platforms as SupportedPlatform[],
        userId
      );

      return {
        success: true,
        data: bulkPreview
      };
    } catch (error) {
      this.logger.error(`Bulk preview generation failed:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to generate bulk campaign preview',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get supported platforms
   * GET /api/campaigns/preview/platforms
   */
  @Get('platforms')
  async getSupportedPlatforms() {
    return {
      success: true,
      data: {
        platforms: ['meta', 'google', 'facebook', 'instagram'],
        platform_info: {
          meta: {
            name: 'Meta (Facebook/Instagram)',
            description: 'Unified Meta advertising platform',
            supported_objectives: ['BRAND_AWARENESS', 'LEAD_GENERATION', 'CONVERSIONS', 'TRAFFIC', 'ENGAGEMENT', 'VIDEO_VIEWS', 'REACH'],
            max_headline_length: 27,
            max_description_length: 125,
            supports_images: true,
            supports_videos: true
          },
          facebook: {
            name: 'Facebook',
            description: 'Facebook advertising',
            supported_objectives: ['BRAND_AWARENESS', 'LEAD_GENERATION', 'CONVERSIONS', 'TRAFFIC', 'ENGAGEMENT', 'VIDEO_VIEWS', 'REACH'],
            max_headline_length: 27,
            max_description_length: 125,
            supports_images: true,
            supports_videos: true
          },
          instagram: {
            name: 'Instagram',
            description: 'Instagram advertising',
            supported_objectives: ['BRAND_AWARENESS', 'ENGAGEMENT', 'VIDEO_VIEWS', 'REACH', 'TRAFFIC'],
            max_headline_length: 27,
            max_description_length: 125,
            supports_images: true,
            supports_videos: true
          },
          google: {
            name: 'Google Ads',
            description: 'Google advertising platform',
            supported_objectives: ['CONVERSIONS', 'TRAFFIC', 'LEAD_GENERATION', 'BRAND_AWARENESS', 'APP_INSTALLS'],
            max_headline_length: 30,
            max_description_length: 90,
            supports_images: true,
            supports_videos: true
          }
        }
      }
    };
  }

  /**
   * Get preview insights for campaign optimization
   * POST /api/campaigns/preview/insights
   */
  @Post('insights')
  async getPreviewInsights(
    @Body() body: GeneratePreviewRequest,
    @Query('platforms') platformsQuery?: string
  ) {
    try {
      if (!body.campaign) {
        throw new HttpException('Campaign data is required', HttpStatus.BAD_REQUEST);
      }

      // Parse platforms from query param
      const platforms = platformsQuery 
        ? platformsQuery.split(',').filter(p => this.isSupportedPlatform(p))
        : ['meta', 'google'];

      if (platforms.length === 0) {
        throw new HttpException('No valid platforms specified', HttpStatus.BAD_REQUEST);
      }

      this.logger.debug(`Generating insights for platforms: ${platforms.join(', ')}`);

      const bulkPreview = await this.previewService.generateBulkPreview(
        body.campaign,
        platforms as SupportedPlatform[]
      );

      // Extract all insights
      const allInsights = [];
      
      // Add platform-specific insights
      Object.entries(bulkPreview.previews).forEach(([platform, preview]) => {
        preview.smart_insights.forEach(insight => {
          allInsights.push({
            ...insight,
            platform,
            source: 'platform_specific'
          });
        });
      });

      // Add cross-platform insights
      bulkPreview.cross_platform_insights.forEach(insight => {
        allInsights.push({
          ...insight,
          source: 'cross_platform'
        });
      });

      // Group insights by category
      const groupedInsights = allInsights.reduce((groups, insight) => {
        const category = insight.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(insight);
        return groups;
      }, {} as Record<string, any[]>);

      return {
        success: true,
        data: {
          campaign_id: body.campaign.id,
          total_insights: allInsights.length,
          insights_by_category: groupedInsights,
          all_insights: allInsights,
          generated_at: bulkPreview.generated_at
        }
      };
    } catch (error) {
      this.logger.error(`Insights generation failed:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to generate campaign insights',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Test preview generation with sample data
   * GET /api/campaigns/preview/test/:platform
   */
  @Get('test/:platform')
  async testPreview(
    @Param('platform') platform: string,
    @Query('goal') goal = 'traffic',
    @Query('copy') copy = 'Discover amazing products and services that will transform your experience!'
  ) {
    try {
      if (!this.isSupportedPlatform(platform)) {
        throw new HttpException('Unsupported platform', HttpStatus.BAD_REQUEST);
      }

      // Create sample campaign
      const sampleCampaign = {
        id: 'test-preview-' + Date.now(),
        goal,
        copy,
        image: 'https://via.placeholder.com/1200x628?text=Sample+Ad+Image',
        audience: {
          ageMin: 25,
          ageMax: 45,
          locations: ['US', 'CA'],
          interests: ['technology', 'business'],
          genders: ['all'],
          languages: ['en']
        },
        platform: null,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerUid: 'test-user'
      };

      this.logger.debug(`Testing preview generation for ${platform} with sample data`);

      const preview = await this.previewService.generatePreview(
        sampleCampaign,
        platform as SupportedPlatform
      );

      return {
        success: true,
        data: preview,
        note: 'This is a test preview using sample data'
      };
    } catch (error) {
      this.logger.error(`Test preview failed:`, error);
      throw new HttpException(
        'Failed to generate test preview',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== Helper Methods ====================

  private isSupportedPlatform(platform: string): boolean {
    return ['meta', 'google', 'facebook', 'instagram'].includes(platform);
  }
}

// ==================== Type Definitions ====================

interface GeneratePreviewRequest {
  campaign: {
    id: string;
    goal: string;
    copy: string;
    image?: string;
    audience?: any;
    platform?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    ownerUid: string;
  };
}

interface GenerateBulkPreviewRequest {
  campaign: {
    id: string;
    goal: string;
    copy: string;
    image?: string;
    audience?: any;
    platform?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    ownerUid: string;
  };
  platforms: string[];
}