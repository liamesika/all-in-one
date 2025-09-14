import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ExternalCampaignsService, CreateCampaignDto } from './external-campaigns.service';
import { ConnectionProvider } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    organizationId?: string;
  };
}

@Controller('api/campaigns/external')
export class ExternalCampaignsController {
  constructor(private externalCampaignsService: ExternalCampaignsService) {}

  /**
   * Create external campaign
   * POST /api/campaigns/external/create
   */
  @Post('create')
  async createCampaign(
    @Body() campaignData: CreateCampaignDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const campaign = await this.externalCampaignsService.createExternalCampaign(
      req.user.uid,
      campaignData,
    );

    return {
      success: true,
      campaign,
      message: 'Campaign created successfully',
    };
  }

  /**
   * Pause campaign
   * POST /api/campaigns/external/:provider/pause
   */
  @Post(':provider/pause')
  async pauseCampaign(
    @Param('provider') provider: string,
    @Body('externalCampaignId') externalCampaignId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!externalCampaignId) {
      throw new BadRequestException('externalCampaignId is required');
    }

    const providerEnum = this.validateProvider(provider);

    await this.externalCampaignsService.pauseCampaign(
      req.user.uid,
      providerEnum,
      externalCampaignId,
    );

    return {
      success: true,
      message: 'Campaign paused successfully',
    };
  }

  /**
   * Resume campaign
   * POST /api/campaigns/external/:provider/resume
   */
  @Post(':provider/resume')
  async resumeCampaign(
    @Param('provider') provider: string,
    @Body('externalCampaignId') externalCampaignId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!externalCampaignId) {
      throw new BadRequestException('externalCampaignId is required');
    }

    const providerEnum = this.validateProvider(provider);

    await this.externalCampaignsService.resumeCampaign(
      req.user.uid,
      providerEnum,
      externalCampaignId,
    );

    return {
      success: true,
      message: 'Campaign resumed successfully',
    };
  }

  /**
   * List external campaigns
   * GET /api/campaigns/external
   */
  @Get()
  async listCampaigns(
    @Query('connectionId') connectionId?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const campaigns = await this.externalCampaignsService.listCampaigns(
      req.user.uid,
      connectionId,
    );

    return {
      success: true,
      campaigns,
      total: campaigns.length,
    };
  }

  private validateProvider(provider: string): ConnectionProvider {
    const upperProvider = provider.toUpperCase().replace('-', '_');

    if (!Object.values(ConnectionProvider).includes(upperProvider as ConnectionProvider)) {
      throw new BadRequestException(
        `Unsupported provider: ${provider}. Supported providers: ${Object.values(ConnectionProvider).join(', ')}`,
      );
    }

    return upperProvider as ConnectionProvider;
  }
}