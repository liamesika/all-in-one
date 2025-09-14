import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { ConnectionsService } from '../connections/connections.service';
import {
  ConnectionProvider,
  ConnectionStatus,
  Insight,
  Connection,
  AdAccount,
} from '@prisma/client';

export interface InsightData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  ctr?: number;
  conversions?: number;
  conversionValue?: number;
}

export interface InsightsQuery {
  window?: '7' | '30';
  connectionId?: string;
  accountId?: string;
  campaignId?: string;
}

@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private connectionsService: ConnectionsService,
  ) {}

  /**
   * Get insights for an account or campaign with window filter
   */
  async getInsights(
    ownerUid: string,
    provider: ConnectionProvider,
    accountId?: string,
    query?: InsightsQuery,
  ): Promise<InsightData[]> {
    // Determine date range
    const windowDays = query?.window === '30' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    // Build query conditions
    const where: any = {
      ownerUid,
      connection: {
        provider,
      },
      date: {
        gte: startDate,
      },
    };

    if (accountId) {
      where.adAccount = {
        externalId: accountId,
      };
    }

    if (query?.campaignId) {
      where.campaign = {
        externalId: query.campaignId,
      };
    }

    // Fetch insights from database
    const insights = await this.prisma.insight.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        connection: true,
        adAccount: true,
        campaign: true,
      },
    });

    // Group by date and aggregate
    const aggregatedInsights = this.aggregateInsightsByDate(insights);

    return aggregatedInsights;
  }

  /**
   * Fetch fresh insights from provider APIs and store in database
   */
  async fetchInsightsFromProviders(
    ownerUid: string,
    connectionId?: string,
  ): Promise<void> {
    // Get connections to sync
    const connections = connectionId
      ? [await this.connectionsService.getConnection(connectionId, ownerUid)]
      : await this.connectionsService.listConnections(ownerUid);

    const validConnections = connections
      .filter((conn): conn is NonNullable<typeof conn> => conn !== null)
      .filter(conn => conn.status === ConnectionStatus.CONNECTED);

    for (const connection of validConnections) {
      try {
        await this.fetchInsightsForConnection(connection);
      } catch (error) {
        console.error(`Failed to fetch insights for connection ${connection.id}:`, error);
      }
    }
  }

  /**
   * Fetch insights for a specific connection
   */
  private async fetchInsightsForConnection(
    connection: Connection & { adAccounts?: AdAccount[] },
  ): Promise<void> {
    const accessToken = await this.connectionsService.getAccessToken(connection.id);
    if (!accessToken) {
      throw new BadRequestException('No valid access token available');
    }

    // Get ad accounts for this connection
    const adAccounts = await this.prisma.adAccount.findMany({
      where: {
        connectionId: connection.id,
        isActive: true,
      },
    });

    // Fetch insights for each ad account
    for (const account of adAccounts) {
      const insightsData = await this.fetchInsightsFromProvider(
        connection.provider,
        account.externalId,
        accessToken,
      );

      // Store insights in database
      await this.storeInsights(
        connection,
        account,
        insightsData,
      );
    }
  }

  /**
   * Fetch insights from provider API
   */
  private async fetchInsightsFromProvider(
    provider: ConnectionProvider,
    accountId: string,
    accessToken: string,
    windowDays: number = 7,
  ): Promise<InsightData[]> {
    switch (provider) {
      case ConnectionProvider.META:
        return this.fetchMetaInsights(accountId, accessToken, windowDays);
      case ConnectionProvider.GOOGLE_ADS:
        return this.fetchGoogleAdsInsights(accountId, accessToken, windowDays);
      case ConnectionProvider.TIKTOK_ADS:
        return this.fetchTikTokInsights(accountId, accessToken, windowDays);
      case ConnectionProvider.LINKEDIN_ADS:
        return this.fetchLinkedInInsights(accountId, accessToken, windowDays);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Store insights in database
   */
  private async storeInsights(
    connection: Connection,
    account: AdAccount,
    insights: InsightData[],
  ): Promise<void> {
    for (const insight of insights) {
      await this.prisma.insight.upsert({
        where: {
          connectionId_adAccountId_campaignId_date: {
            connectionId: connection.id,
            adAccountId: account.id,
            campaignId: null, // Account-level insights
            date: new Date(insight.date),
          },
        },
        create: {
          connectionId: connection.id,
          adAccountId: account.id,
          ownerUid: connection.ownerUid,
          date: new Date(insight.date),
          spend: insight.spend,
          impressions: insight.impressions,
          clicks: insight.clicks,
          cpc: insight.cpc,
          ctr: insight.ctr,
          conversions: insight.conversions || 0,
          conversionValue: insight.conversionValue,
        },
        update: {
          spend: insight.spend,
          impressions: insight.impressions,
          clicks: insight.clicks,
          cpc: insight.cpc,
          ctr: insight.ctr,
          conversions: insight.conversions || 0,
          conversionValue: insight.conversionValue,
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * Aggregate insights by date
   */
  private aggregateInsightsByDate(insights: Insight[]): InsightData[] {
    const aggregated = new Map<string, InsightData>();

    for (const insight of insights) {
      const dateStr = insight.date.toISOString().split('T')[0];

      if (!aggregated.has(dateStr)) {
        aggregated.set(dateStr, {
          date: dateStr,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionValue: 0,
        });
      }

      const agg = aggregated.get(dateStr)!;
      agg.spend += insight.spend;
      agg.impressions += insight.impressions;
      agg.clicks += insight.clicks;
      agg.conversions += insight.conversions;
      agg.conversionValue += insight.conversionValue || 0;
    }

    // Calculate derived metrics
    const result = Array.from(aggregated.values()).map(data => ({
      ...data,
      cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
    }));

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Provider-specific insights fetching implementations

  /**
   * Fetch insights from Meta (Facebook) API
   */
  private async fetchMetaInsights(
    accountId: string,
    accessToken: string,
    windowDays: number,
  ): Promise<InsightData[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    const url = `https://graph.facebook.com/v18.0/act_${accountId}/insights`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'spend,impressions,clicks,cpc,ctr,conversions,conversion_values',
      time_range: JSON.stringify({
        since: startDateStr,
        until: endDate,
      }),
      time_increment: '1',
      level: 'account',
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new BadRequestException(`Meta API error: ${JSON.stringify(result)}`);
      }

      return result.data.map((item: any) => ({
        date: item.date_start,
        spend: parseFloat(item.spend || '0'),
        impressions: parseInt(item.impressions || '0'),
        clicks: parseInt(item.clicks || '0'),
        cpc: parseFloat(item.cpc || '0'),
        ctr: parseFloat(item.ctr || '0'),
        conversions: parseInt(item.conversions || '0'),
        conversionValue: parseFloat(item.conversion_values || '0'),
      }));
    } catch (error) {
      console.error('Meta insights fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch insights from Google Ads API (placeholder for MVP)
   */
  private async fetchGoogleAdsInsights(
    accountId: string,
    accessToken: string,
    windowDays: number,
  ): Promise<InsightData[]> {
    // Google Ads API requires more complex setup
    // For MVP, return mock data
    const mockData: InsightData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    for (let i = 0; i < windowDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      mockData.push({
        date: date.toISOString().split('T')[0],
        spend: Math.random() * 100,
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        conversions: Math.floor(Math.random() * 10),
      });
    }

    return mockData;
  }

  /**
   * Fetch insights from TikTok Ads API (placeholder for MVP)
   */
  private async fetchTikTokInsights(
    accountId: string,
    accessToken: string,
    windowDays: number,
  ): Promise<InsightData[]> {
    // TikTok API implementation - placeholder for MVP
    return [];
  }

  /**
   * Fetch insights from LinkedIn Ads API (placeholder for MVP)
   */
  private async fetchLinkedInInsights(
    accountId: string,
    accessToken: string,
    windowDays: number,
  ): Promise<InsightData[]> {
    // LinkedIn API implementation - placeholder for MVP
    return [];
  }
}