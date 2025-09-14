import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { ConnectionsService } from '../connections/connections.service';
import {
  ConnectionProvider,
  ConnectionStatus,
  ExternalCampaign,
  AdAccount,
} from '@prisma/client';

export interface CreateCampaignDto {
  connectionId: string;
  accountExternalId: string;
  name: string;
  objective: string;
  dailyBudget?: number;
  totalBudget?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'PAUSED';
}

export interface CampaignResponse {
  id: string;
  externalId: string;
  name: string;
  status: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
}

@Injectable()
export class ExternalCampaignsService {
  constructor(
    private prisma: PrismaService,
    private connectionsService: ConnectionsService,
  ) {}

  /**
   * Create a new external campaign
   */
  async createExternalCampaign(
    ownerUid: string,
    campaignData: CreateCampaignDto,
  ): Promise<ExternalCampaign> {
    // Verify connection and account
    const connection = await this.connectionsService.getConnection(
      campaignData.connectionId,
      ownerUid,
    );

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new BadRequestException('Connection is not in CONNECTED state');
    }

    const adAccount = await this.prisma.adAccount.findFirst({
      where: {
        connectionId: campaignData.connectionId,
        externalId: campaignData.accountExternalId,
        isActive: true,
      },
    });

    if (!adAccount) {
      throw new NotFoundException('Ad account not found');
    }

    // Get access token
    const accessToken = await this.connectionsService.getAccessToken(
      campaignData.connectionId,
    );

    if (!accessToken) {
      throw new BadRequestException('No valid access token available');
    }

    // Create campaign with provider
    const providerCampaign = await this.createCampaignWithProvider(
      connection.provider,
      adAccount.externalId,
      campaignData,
      accessToken,
    );

    // Store in our database
    const campaign = await this.prisma.externalCampaign.create({
      data: {
        connectionId: campaignData.connectionId,
        adAccountId: adAccount.id,
        ownerUid,
        externalId: providerCampaign.externalId,
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status || 'PAUSED',
        dailyBudget: campaignData.dailyBudget,
        totalBudget: campaignData.totalBudget,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
      },
    });

    return campaign;
  }

  /**
   * Pause an external campaign
   */
  async pauseCampaign(
    ownerUid: string,
    provider: ConnectionProvider,
    externalCampaignId: string,
  ): Promise<void> {
    const campaign = await this.prisma.externalCampaign.findFirst({
      where: {
        ownerUid,
        externalId: externalCampaignId,
      },
      include: {
        connection: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.connection.provider !== provider) {
      throw new BadRequestException('Provider mismatch');
    }

    const accessToken = await this.connectionsService.getAccessToken(
      campaign.connectionId,
    );

    if (!accessToken) {
      throw new BadRequestException('No valid access token available');
    }

    // Pause with provider
    await this.updateCampaignStatusWithProvider(
      provider,
      externalCampaignId,
      'PAUSED',
      accessToken,
    );

    // Update in our database
    await this.prisma.externalCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'PAUSED',
        lastSyncAt: new Date(),
      },
    });
  }

  /**
   * Resume an external campaign
   */
  async resumeCampaign(
    ownerUid: string,
    provider: ConnectionProvider,
    externalCampaignId: string,
  ): Promise<void> {
    const campaign = await this.prisma.externalCampaign.findFirst({
      where: {
        ownerUid,
        externalId: externalCampaignId,
      },
      include: {
        connection: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.connection.provider !== provider) {
      throw new BadRequestException('Provider mismatch');
    }

    const accessToken = await this.connectionsService.getAccessToken(
      campaign.connectionId,
    );

    if (!accessToken) {
      throw new BadRequestException('No valid access token available');
    }

    // Resume with provider
    await this.updateCampaignStatusWithProvider(
      provider,
      externalCampaignId,
      'ACTIVE',
      accessToken,
    );

    // Update in our database
    await this.prisma.externalCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'ACTIVE',
        lastSyncAt: new Date(),
      },
    });
  }

  /**
   * List campaigns for a connection
   */
  async listCampaigns(
    ownerUid: string,
    connectionId?: string,
  ): Promise<ExternalCampaign[]> {
    const where: any = { ownerUid };
    if (connectionId) {
      where.connectionId = connectionId;
    }

    return this.prisma.externalCampaign.findMany({
      where,
      include: {
        connection: true,
        adAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Provider-specific campaign creation
   */
  private async createCampaignWithProvider(
    provider: ConnectionProvider,
    accountId: string,
    campaignData: CreateCampaignDto,
    accessToken: string,
  ): Promise<CampaignResponse> {
    switch (provider) {
      case ConnectionProvider.META:
        return this.createMetaCampaign(accountId, campaignData, accessToken);
      case ConnectionProvider.GOOGLE_ADS:
        return this.createGoogleAdsCampaign(accountId, campaignData, accessToken);
      case ConnectionProvider.TIKTOK_ADS:
        return this.createTikTokCampaign(accountId, campaignData, accessToken);
      case ConnectionProvider.LINKEDIN_ADS:
        return this.createLinkedInCampaign(accountId, campaignData, accessToken);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Provider-specific campaign status update
   */
  private async updateCampaignStatusWithProvider(
    provider: ConnectionProvider,
    campaignId: string,
    status: 'ACTIVE' | 'PAUSED',
    accessToken: string,
  ): Promise<void> {
    switch (provider) {
      case ConnectionProvider.META:
        return this.updateMetaCampaignStatus(campaignId, status, accessToken);
      case ConnectionProvider.GOOGLE_ADS:
        return this.updateGoogleAdsCampaignStatus(campaignId, status, accessToken);
      case ConnectionProvider.TIKTOK_ADS:
        return this.updateTikTokCampaignStatus(campaignId, status, accessToken);
      case ConnectionProvider.LINKEDIN_ADS:
        return this.updateLinkedInCampaignStatus(campaignId, status, accessToken);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  // Meta (Facebook) API implementations
  private async createMetaCampaign(
    accountId: string,
    campaignData: CreateCampaignDto,
    accessToken: string,
  ): Promise<CampaignResponse> {
    const url = `https://graph.facebook.com/v18.0/act_${accountId}/campaigns`;

    const body = {
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status || 'PAUSED',
      daily_budget: campaignData.dailyBudget ? campaignData.dailyBudget * 100 : undefined,
      lifetime_budget: campaignData.totalBudget ? campaignData.totalBudget * 100 : undefined,
      access_token: accessToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new BadRequestException(`Meta API error: ${JSON.stringify(result)}`);
    }

    return {
      id: result.id,
      externalId: result.id,
      name: campaignData.name,
      status: campaignData.status || 'PAUSED',
    };
  }

  private async updateMetaCampaignStatus(
    campaignId: string,
    status: 'ACTIVE' | 'PAUSED',
    accessToken: string,
  ): Promise<void> {
    const url = `https://graph.facebook.com/v18.0/${campaignId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new BadRequestException(`Meta API error: ${JSON.stringify(result)}`);
    }
  }

  // Google Ads, TikTok, LinkedIn implementations (placeholder for MVP)
  private async createGoogleAdsCampaign(
    accountId: string,
    campaignData: CreateCampaignDto,
    accessToken: string,
  ): Promise<CampaignResponse> {
    const mockId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: mockId,
      externalId: mockId,
      name: campaignData.name,
      status: campaignData.status || 'PAUSED',
    };
  }

  private async updateGoogleAdsCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED', accessToken: string): Promise<void> {
    console.log(`Google Ads: ${status} campaign ${campaignId}`);
  }

  private async createTikTokCampaign(accountId: string, campaignData: CreateCampaignDto, accessToken: string): Promise<CampaignResponse> {
    const mockId = `tiktok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: mockId,
      externalId: mockId,
      name: campaignData.name,
      status: campaignData.status || 'PAUSED',
    };
  }

  private async updateTikTokCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED', accessToken: string): Promise<void> {
    console.log(`TikTok: ${status} campaign ${campaignId}`);
  }

  private async createLinkedInCampaign(accountId: string, campaignData: CreateCampaignDto, accessToken: string): Promise<CampaignResponse> {
    const mockId = `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: mockId,
      externalId: mockId,
      name: campaignData.name,
      status: campaignData.status || 'PAUSED',
    };
  }

  private async updateLinkedInCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED', accessToken: string): Promise<void> {
    console.log(`LinkedIn: ${status} campaign ${campaignId}`);
  }
}