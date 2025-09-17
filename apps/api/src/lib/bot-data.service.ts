import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

export interface UserDataSnapshot {
  meta: {
    ownerUid: string;
    language: 'he' | 'en';
    organizationId?: string;
    now: string;
    timezone?: string;
  };
  leads: {
    stats: {
      total: number;
      new: number;
      contacted: number;
      qualified: number;
      stale: number;
      hot: number;
      warm: number;
      cold: number;
    };
    staleList: Array<{
      id: string;
      fullName?: string;
      email?: string;
      phone?: string;
      status: string;
      source: string;
      daysSinceContact?: number;
      daysSinceCreated: number;
      score: string;
      budget?: number;
      notes?: string;
    }>;
    recentActivity: Array<{
      id: string;
      fullName?: string;
      status: string;
      daysSinceContact?: number;
      score: string;
    }>;
  };
  campaigns: {
    stats: {
      total: number;
      active: number;
      paused: number;
      totalSpend7d: number;
      totalSpend30d: number;
      avgCtr7d: number;
      avgCpc7d: number;
    };
    issues: Array<{
      id: string;
      name: string;
      provider: string;
      status: string;
      issue: 'low_ctr' | 'high_cpc' | 'overspend' | 'no_traffic' | 'stale';
      severity: 'high' | 'medium' | 'low';
      metric?: number;
      threshold?: number;
      suggestion: string;
    }>;
    topPerformers: Array<{
      id: string;
      name: string;
      provider: string;
      ctr: number;
      spend7d: number;
      conversions: number;
    }>;
  };
  properties: {
    stats: {
      total: number;
      active: number;
      sold: number;
      pending: number;
      stale: number;
      missingPhotos: number;
    };
    staleList: Array<{
      id: string;
      title?: string;
      address?: string;
      price?: number;
      status: string;
      daysSinceUpdate: number;
      missingFields: string[];
      photoCount: number;
    }>;
    recentActivity: Array<{
      id: string;
      title?: string;
      status: string;
      daysSinceUpdate: number;
    }>;
  };
  connections: {
    stats: {
      total: number;
      connected: number;
      error: number;
      expired: number;
    };
    issues: Array<{
      provider: string;
      status: string;
      issue: string;
      daysSinceError?: number;
    }>;
  };
  tasks: {
    stats: {
      total: number;
      pending: number;
      overdue: number;
      completed7d: number;
    };
    overdue: Array<{
      id: string;
      title: string;
      dueDate: string;
      daysOverdue: number;
      relatedEntity?: {
        type: 'lead' | 'property' | 'campaign';
        id: string;
        name: string;
      };
    }>;
  };
  recommendations: Array<{
    id: string;
    type: 'follow_up_lead' | 'pause_campaign' | 'update_property' | 'fix_connection' | 'create_task';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: {
      tool: string;
      params: Record<string, any>;
    };
    entityId?: string;
    entityType?: string;
  }>;
}

@Injectable()
export class BotDataService {
  private readonly logger = new Logger(BotDataService.name);
  private readonly cache = new Map<string, { data: UserDataSnapshot; timestamp: number; etag: string }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly STALE_DAYS_THRESHOLD = 3;
  private readonly LOW_CTR_THRESHOLD = 1.0; // 1%
  private readonly HIGH_CPC_THRESHOLD = 2.0; // $2.00

  constructor(private readonly prisma: PrismaService) {}

  async getUserDataSnapshot(
    ownerUid: string,
    organizationId?: string,
    windowDays: number = 30,
    forceRefresh = false
  ): Promise<UserDataSnapshot> {
    const cacheKey = `${ownerUid}:${organizationId || 'default'}:${windowDays}`;
    const cached = this.cache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for user ${ownerUid}`);
      return cached.data;
    }

    this.logger.log(`Generating data snapshot for user ${ownerUid}`);
    const startTime = Date.now();

    try {
      // Get user preferences
      const user = await this.prisma.user.findUnique({
        where: { uid: ownerUid },
        select: {
          preferredLanguage: true,
          timezone: true,
          organizationMemberships: {
            include: { organization: true }
          }
        },
      });

      const language = (user?.preferredLanguage?.toLowerCase() === 'he' ? 'he' : 'en') as 'he' | 'en';
      const now = new Date().toISOString();

      // Parallel data fetching for performance
      const [
        ecommerceLeads,
        realEstateLeads,
        campaigns,
        properties,
        connections,
        insights,
        tasks
      ] = await Promise.all([
        this.getEcommerceLeadsData(ownerUid, windowDays),
        this.getRealEstateLeadsData(ownerUid, windowDays),
        this.getCampaignsData(ownerUid, windowDays),
        this.getPropertiesData(ownerUid, windowDays),
        this.getConnectionsData(ownerUid),
        this.getInsightsData(ownerUid, windowDays),
        this.getTasksData(ownerUid)
      ]);

      // Combine leads data
      const allLeads = [...ecommerceLeads, ...realEstateLeads];
      const leadsData = this.processLeadsData(allLeads);

      // Process campaigns with insights
      const campaignsData = this.processCampaignsData(campaigns, insights);

      // Process properties
      const propertiesData = this.processPropertiesData(properties);

      // Process connections
      const connectionsData = this.processConnectionsData(connections);

      // Process tasks
      const tasksData = this.processTasksData(tasks);

      // Generate recommendations based on all data
      const recommendations = this.generateRecommendations({
        leads: leadsData,
        campaigns: campaignsData,
        properties: propertiesData,
        connections: connectionsData,
        tasks: tasksData
      });

      const snapshot: UserDataSnapshot = {
        meta: {
          ownerUid,
          language,
          organizationId,
          now,
          timezone: user?.timezone,
        },
        leads: leadsData,
        campaigns: campaignsData,
        properties: propertiesData,
        connections: connectionsData,
        tasks: tasksData,
        recommendations,
      };

      // Cache the result
      const etag = this.generateEtag(snapshot);
      this.cache.set(cacheKey, {
        data: snapshot,
        timestamp: Date.now(),
        etag,
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Generated snapshot for ${ownerUid} in ${duration}ms`);

      return snapshot;
    } catch (error) {
      this.logger.error(`Error generating snapshot for ${ownerUid}:`, error);
      throw error;
    }
  }

  private async getEcommerceLeadsData(ownerUid: string, windowDays: number) {
    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - windowDays);

    return await this.prisma.ecommerceLead.findMany({
      where: { ownerUid },
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        score: true,
        budget: true,
        notes: true,
        firstContactAt: true,
        lastContactAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getRealEstateLeadsData(ownerUid: string, windowDays: number) {
    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - windowDays);

    return await this.prisma.realEstateLead.findMany({
      where: { ownerUid },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        score: true,
        budget: true,
        notes: true,
        firstContactAt: true,
        lastContactAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getCampaignsData(ownerUid: string, windowDays: number) {
    return await this.prisma.externalCampaign.findMany({
      where: { ownerUid },
      select: {
        id: true,
        externalId: true,
        name: true,
        objective: true,
        status: true,
        dailyBudget: true,
        totalBudget: true,
        spend: true,
        impressions: true,
        clicks: true,
        cpc: true,
        ctr: true,
        conversions: true,
        createdAt: true,
        updatedAt: true,
        lastSyncAt: true,
        connection: {
          select: {
            provider: true,
            status: true,
          },
        },
        adAccount: {
          select: {
            name: true,
            externalId: true,
          },
        },
      },
    });
  }

  private async getPropertiesData(ownerUid: string, windowDays: number) {
    return await this.prisma.property.findMany({
      where: { ownerUid },
      select: {
        id: true,
        title: true,
        address: true,
        price: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async getConnectionsData(ownerUid: string) {
    return await this.prisma.connection.findMany({
      where: { ownerUid },
      select: {
        id: true,
        provider: true,
        status: true,
        displayName: true,
        lastError: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async getInsightsData(ownerUid: string, windowDays: number) {
    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - windowDays);

    return await this.prisma.insight.findMany({
      where: {
        ownerUid,
        date: { gte: windowDate },
      },
      select: {
        id: true,
        date: true,
        spend: true,
        impressions: true,
        clicks: true,
        conversions: true,
        cpc: true,
        ctr: true,
        provider: true,
        accountExternalId: true,
        campaignExternalId: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  private async getTasksData(ownerUid: string) {
    return await this.prisma.task?.findMany({
      where: { ownerUid },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
      },
    }) || [];
  }

  private processLeadsData(leads: any[]) {
    const now = new Date();

    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      contacted: leads.filter(l => ['CONTACTED', 'QUALIFIED', 'MEETING'].includes(l.status)).length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      stale: 0,
      hot: leads.filter(l => l.score === 'HOT').length,
      warm: leads.filter(l => l.score === 'WARM').length,
      cold: leads.filter(l => l.score === 'COLD').length,
    };

    const staleList: any[] = [];
    const recentActivity: any[] = [];

    leads.forEach(lead => {
      const lastContact = lead.lastContactAt ? new Date(lead.lastContactAt) : null;
      const created = new Date(lead.createdAt);
      const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceContact = lastContact ?
        Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)) : null;

      // Determine if lead is stale
      const isStale = (daysSinceContact && daysSinceContact > this.STALE_DAYS_THRESHOLD) ||
                     (!lastContact && daysSinceCreated > this.STALE_DAYS_THRESHOLD);

      if (isStale) {
        stats.stale++;
        staleList.push({
          id: lead.id,
          fullName: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          daysSinceContact,
          daysSinceCreated,
          score: lead.score,
          budget: lead.budget,
          notes: lead.notes ? lead.notes.substring(0, 100) + (lead.notes.length > 100 ? '...' : '') : undefined,
        });
      }

      // Recent activity (last 7 days)
      if (daysSinceCreated <= 7 || (daysSinceContact && daysSinceContact <= 7)) {
        recentActivity.push({
          id: lead.id,
          fullName: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
          status: lead.status,
          daysSinceContact,
          score: lead.score,
        });
      }
    });

    // Sort stale list by urgency (hot leads first, then by days since contact)
    staleList.sort((a, b) => {
      if (a.score === 'HOT' && b.score !== 'HOT') return -1;
      if (b.score === 'HOT' && a.score !== 'HOT') return 1;
      return (b.daysSinceContact || b.daysSinceCreated) - (a.daysSinceContact || a.daysSinceCreated);
    });

    return {
      stats,
      staleList: staleList.slice(0, 10), // Limit to top 10
      recentActivity: recentActivity.slice(0, 5),
    };
  }

  private processCampaignsData(campaigns: any[], insights: any[]) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate 7-day insights
    const insights7d = insights.filter(i => new Date(i.date) >= last7Days);
    const totalSpend7d = insights7d.reduce((sum, i) => sum + (i.spend || 0), 0);
    const totalClicks7d = insights7d.reduce((sum, i) => sum + (i.clicks || 0), 0);
    const totalImpressions7d = insights7d.reduce((sum, i) => sum + (i.impressions || 0), 0);
    const avgCtr7d = totalImpressions7d > 0 ? (totalClicks7d / totalImpressions7d) * 100 : 0;
    const avgCpc7d = totalClicks7d > 0 ? totalSpend7d / totalClicks7d : 0;

    // Calculate 30-day spend
    const totalSpend30d = insights.reduce((sum, i) => sum + (i.spend || 0), 0);

    const stats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'ACTIVE').length,
      paused: campaigns.filter(c => c.status === 'PAUSED').length,
      totalSpend7d,
      totalSpend30d,
      avgCtr7d,
      avgCpc7d,
    };

    const issues: any[] = [];
    const topPerformers: any[] = [];

    campaigns.forEach(campaign => {
      // Get campaign-specific insights
      const campaignInsights = insights7d.filter(i => i.campaignExternalId === campaign.externalId);
      const campaignSpend7d = campaignInsights.reduce((sum, i) => sum + (i.spend || 0), 0);
      const campaignClicks7d = campaignInsights.reduce((sum, i) => sum + (i.clicks || 0), 0);
      const campaignImpressions7d = campaignInsights.reduce((sum, i) => sum + (i.impressions || 0), 0);
      const campaignCtr = campaignImpressions7d > 0 ? (campaignClicks7d / campaignImpressions7d) * 100 : 0;
      const campaignCpc = campaignClicks7d > 0 ? campaignSpend7d / campaignClicks7d : 0;
      const campaignConversions = campaignInsights.reduce((sum, i) => sum + (i.conversions || 0), 0);

      // Check for issues
      if (campaign.status === 'ACTIVE') {
        // Low CTR
        if (campaignImpressions7d > 1000 && campaignCtr < this.LOW_CTR_THRESHOLD) {
          issues.push({
            id: campaign.id,
            name: campaign.name,
            provider: campaign.connection.provider,
            status: campaign.status,
            issue: 'low_ctr',
            severity: 'medium',
            metric: campaignCtr,
            threshold: this.LOW_CTR_THRESHOLD,
            suggestion: 'Consider updating ad creative or targeting to improve click-through rate',
          });
        }

        // High CPC
        if (campaignClicks7d > 50 && campaignCpc > this.HIGH_CPC_THRESHOLD) {
          issues.push({
            id: campaign.id,
            name: campaign.name,
            provider: campaign.connection.provider,
            status: campaign.status,
            issue: 'high_cpc',
            severity: 'medium',
            metric: campaignCpc,
            threshold: this.HIGH_CPC_THRESHOLD,
            suggestion: 'Review targeting and bidding strategy to reduce cost per click',
          });
        }

        // No traffic (low impressions)
        if (campaignImpressions7d < 100) {
          issues.push({
            id: campaign.id,
            name: campaign.name,
            provider: campaign.connection.provider,
            status: campaign.status,
            issue: 'no_traffic',
            severity: 'high',
            metric: campaignImpressions7d,
            suggestion: 'Check campaign setup, targeting, and budget to increase visibility',
          });
        }

        // Overspend without conversions
        if (campaignSpend7d > 50 && campaignConversions === 0) {
          issues.push({
            id: campaign.id,
            name: campaign.name,
            provider: campaign.connection.provider,
            status: campaign.status,
            issue: 'overspend',
            severity: 'high',
            metric: campaignSpend7d,
            suggestion: 'Consider pausing campaign or optimizing for conversions',
          });
        }
      }

      // Check for stale campaigns (not synced recently)
      const daysSinceSync = campaign.lastSyncAt ?
        Math.floor((now.getTime() - new Date(campaign.lastSyncAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;

      if (daysSinceSync > 7) {
        issues.push({
          id: campaign.id,
          name: campaign.name,
          provider: campaign.connection.provider,
          status: campaign.status,
          issue: 'stale',
          severity: 'low',
          metric: daysSinceSync,
          suggestion: 'Sync campaign data to get latest performance metrics',
        });
      }

      // Identify top performers
      if (campaignConversions > 0 && campaignCtr > 2.0) {
        topPerformers.push({
          id: campaign.id,
          name: campaign.name,
          provider: campaign.connection.provider,
          ctr: campaignCtr,
          spend7d: campaignSpend7d,
          conversions: campaignConversions,
        });
      }
    });

    // Sort issues by severity and top performers by conversions
    issues.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    topPerformers.sort((a, b) => b.conversions - a.conversions);

    return {
      stats,
      issues: issues.slice(0, 5),
      topPerformers: topPerformers.slice(0, 3),
    };
  }

  private processPropertiesData(properties: any[]) {
    const now = new Date();

    const stats = {
      total: properties.length,
      active: properties.filter(p => p.status === 'ACTIVE').length,
      sold: properties.filter(p => p.status === 'SOLD').length,
      pending: properties.filter(p => p.status === 'PENDING').length,
      stale: 0,
      missingPhotos: 0,
    };

    const staleList: any[] = [];
    const recentActivity: any[] = [];

    properties.forEach(property => {
      const daysSinceUpdate = Math.floor((now.getTime() - new Date(property.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceCreated = Math.floor((now.getTime() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      // Check for missing fields
      const missingFields: string[] = [];
      if (!property.description || property.description.length < 50) missingFields.push('description');
      if (!property.bedrooms) missingFields.push('bedrooms');
      if (!property.bathrooms) missingFields.push('bathrooms');
      if (!property.area) missingFields.push('area');

      // Check if stale (not updated in 14 days for active properties)
      const isStale = property.status === 'ACTIVE' && daysSinceUpdate > 14;

      if (isStale) {
        stats.stale++;
        staleList.push({
          id: property.id,
          title: property.title,
          address: property.address,
          price: property.price,
          status: property.status,
          daysSinceUpdate,
          missingFields,
          photoCount: 0, // TODO: Count photos when implemented
        });
      }

      if (missingFields.length > 0) {
        stats.missingPhotos++; // Using this field for missing info in general
      }

      // Recent activity (last 7 days)
      if (daysSinceUpdate <= 7 || daysSinceCreated <= 7) {
        recentActivity.push({
          id: property.id,
          title: property.title,
          status: property.status,
          daysSinceUpdate,
        });
      }
    });

    // Sort stale list by days since update
    staleList.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

    return {
      stats,
      staleList: staleList.slice(0, 10),
      recentActivity: recentActivity.slice(0, 5),
    };
  }

  private processConnectionsData(connections: any[]) {
    const now = new Date();

    const stats = {
      total: connections.length,
      connected: connections.filter(c => c.status === 'CONNECTED').length,
      error: connections.filter(c => c.status === 'ERROR').length,
      expired: connections.filter(c => c.status === 'EXPIRED').length,
    };

    const issues: any[] = [];

    connections.forEach(connection => {
      if (connection.status === 'ERROR' || connection.status === 'EXPIRED') {
        const daysSinceError = connection.updatedAt ?
          Math.floor((now.getTime() - new Date(connection.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        issues.push({
          provider: connection.provider,
          status: connection.status,
          issue: connection.lastError || `Connection ${connection.status.toLowerCase()}`,
          daysSinceError,
        });
      }
    });

    return {
      stats,
      issues,
    };
  }

  private processTasksData(tasks: any[]) {
    const now = new Date();

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status !== 'COMPLETED').length,
      overdue: 0,
      completed7d: tasks.filter(t =>
        t.completedAt &&
        new Date(t.completedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    };

    const overdue: any[] = [];

    tasks.forEach(task => {
      if (task.dueDate && task.status !== 'COMPLETED') {
        const dueDate = new Date(task.dueDate);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          stats.overdue++;
          overdue.push({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            daysOverdue,
            relatedEntity: null, // TODO: Link tasks to entities when implemented
          });
        }
      }
    });

    // Sort overdue tasks by days overdue
    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return {
      stats,
      overdue: overdue.slice(0, 10),
    };
  }

  private generateRecommendations(data: {
    leads: any;
    campaigns: any;
    properties: any;
    connections: any;
    tasks: any;
  }): any[] {
    const recommendations: any[] = [];

    // Lead follow-up recommendations
    data.leads.staleList.slice(0, 3).forEach(lead => {
      recommendations.push({
        id: `follow_up_${lead.id}`,
        type: 'follow_up_lead',
        priority: lead.score === 'HOT' ? 'high' : 'medium',
        title: `Follow up with ${lead.fullName || 'lead'}`,
        description: `${lead.fullName || 'Lead'} has been waiting ${lead.daysSinceContact || lead.daysSinceCreated} days for contact (${lead.score} lead)`,
        action: {
          tool: 'update_lead_status',
          params: {
            leadId: lead.id,
            status: 'CONTACTED',
            note: 'Bot-recommended follow-up'
          }
        },
        entityId: lead.id,
        entityType: 'lead',
      });
    });

    // Campaign recommendations
    data.campaigns.issues.slice(0, 2).forEach(issue => {
      if (issue.issue === 'overspend' || issue.issue === 'no_traffic') {
        recommendations.push({
          id: `pause_campaign_${issue.id}`,
          type: 'pause_campaign',
          priority: issue.severity === 'high' ? 'high' : 'medium',
          title: `Consider pausing campaign "${issue.name}"`,
          description: issue.suggestion,
          action: {
            tool: 'pause_campaign',
            params: {
              campaignId: issue.id,
              provider: issue.provider,
              reason: `Bot recommendation: ${issue.issue}`
            }
          },
          entityId: issue.id,
          entityType: 'campaign',
        });
      }
    });

    // Property update recommendations
    data.properties.staleList.slice(0, 2).forEach(property => {
      recommendations.push({
        id: `update_property_${property.id}`,
        type: 'update_property',
        priority: 'medium',
        title: `Update property "${property.title}"`,
        description: `Property hasn't been updated in ${property.daysSinceUpdate} days${property.missingFields.length ? ` and is missing: ${property.missingFields.join(', ')}` : ''}`,
        action: {
          tool: 'open_entity',
          params: {
            type: 'property',
            id: property.id
          }
        },
        entityId: property.id,
        entityType: 'property',
      });
    });

    // Connection fix recommendations
    data.connections.issues.forEach(issue => {
      recommendations.push({
        id: `fix_connection_${issue.provider}`,
        type: 'fix_connection',
        priority: 'high',
        title: `Fix ${issue.provider} connection`,
        description: `${issue.provider} connection has been ${issue.status.toLowerCase()} for ${issue.daysSinceError} days`,
        action: {
          tool: 'open_entity',
          params: {
            type: 'connections',
            id: issue.provider
          }
        },
        entityId: issue.provider,
        entityType: 'connection',
      });
    });

    // Task creation recommendations based on overdue items
    if (data.tasks.overdue.length > 3) {
      recommendations.push({
        id: 'create_task_management',
        type: 'create_task',
        priority: 'medium',
        title: 'Review overdue tasks',
        description: `You have ${data.tasks.overdue.length} overdue tasks that need attention`,
        action: {
          tool: 'create_task',
          params: {
            title: 'Review and prioritize overdue tasks',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            tags: ['bot-generated', 'task-management']
          }
        },
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private generateEtag(data: UserDataSnapshot): string {
    const hash = require('crypto').createHash('sha256');
    hash.update(JSON.stringify({
      leadsCount: data.leads.stats.total,
      campaignsCount: data.campaigns.stats.total,
      propertiesCount: data.properties.stats.total,
      lastUpdate: data.meta.now,
    }));
    return hash.digest('hex').substring(0, 16);
  }

  async invalidateCache(ownerUid: string): Promise<void> {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(ownerUid));
    keysToDelete.forEach(key => this.cache.delete(key));
    this.logger.debug(`Invalidated cache for user ${ownerUid}, removed ${keysToDelete.length} entries`);
  }

  async getStaleItems(ownerUid: string): Promise<{
    staleLeads: number;
    issuesCount: number;
    staleProperties: number;
    overdueTasks: number;
  }> {
    const snapshot = await this.getUserDataSnapshot(ownerUid);
    return {
      staleLeads: snapshot.leads.stats.stale,
      issuesCount: snapshot.campaigns.issues.length + snapshot.connections.issues.length,
      staleProperties: snapshot.properties.stats.stale,
      overdueTasks: snapshot.tasks.stats.overdue,
    };
  }
}