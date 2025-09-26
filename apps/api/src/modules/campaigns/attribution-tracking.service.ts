import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

export interface AttributionReport {
  success: boolean;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageOrderValue: number;
    costPerAcquisition?: number;
  };
  bySource: AttributionBySource[];
  byCampaign: AttributionByCampaign[];
  byTimeframe: AttributionTimeframe[];
  funnelAnalysis: FunnelStage[];
}

export interface AttributionBySource {
  source: string;
  medium: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

export interface AttributionByCampaign {
  campaign: string;
  source: string;
  medium: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  roas?: number; // Return on Ad Spend
}

export interface AttributionTimeframe {
  date: string;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface FunnelStage {
  stage: string;
  leads: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface LeadJourney {
  leadId: string;
  touchpoints: TouchPoint[];
  conversionPath: string[];
  timeToConversion?: number; // in days
  totalRevenue?: number;
}

export interface TouchPoint {
  timestamp: string;
  source: string;
  medium: string;
  campaign?: string;
  page?: string;
  action: string;
}

@Injectable()
export class AttributionTrackingService {
  private readonly logger = new Logger(AttributionTrackingService.name);
  private prisma = new PrismaClient();

  /**
   * Generate comprehensive attribution report
   */
  async generateAttributionReport(
    ownerUid: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<AttributionReport> {
    this.logger.log(`Generating attribution report for owner: ${ownerUid}`);

    const fromDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const toDate = dateTo ? new Date(dateTo) : new Date();

    try {
      // Get all leads in date range
      const leads = await this.prisma.ecommerceLead.findMany({
        where: {
          ownerUid,
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        },
        include: {
          campaign: true,
          sales: true
        }
      });

      // Get converted leads
      const convertedLeads = leads.filter(lead => lead.status === 'CONVERTED');

      // Calculate summary metrics
      const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (Number(lead.orderValue) || 0), 0);
      const averageOrderValue = convertedLeads.length > 0 ? totalRevenue / convertedLeads.length : 0;

      const summary = {
        totalLeads: leads.length,
        convertedLeads: convertedLeads.length,
        conversionRate: leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0,
        totalRevenue,
        averageOrderValue
      };

      // Attribution by source
      const bySource = this.calculateAttributionBySource(leads, convertedLeads);

      // Attribution by campaign
      const byCampaign = this.calculateAttributionByCampaign(leads, convertedLeads);

      // Attribution by timeframe (daily)
      const byTimeframe = this.calculateAttributionByTimeframe(leads, convertedLeads, fromDate, toDate);

      // Funnel analysis
      const funnelAnalysis = this.calculateFunnelAnalysis(leads);

      const report: AttributionReport = {
        success: true,
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        },
        summary,
        bySource,
        byCampaign,
        byTimeframe,
        funnelAnalysis
      };

      this.logger.log(`Attribution report generated: ${leads.length} leads, ${convertedLeads.length} conversions, ₪${totalRevenue} revenue`);

      return report;
    } catch (error) {
      this.logger.error('Failed to generate attribution report:', error);
      throw error;
    }
  }

  /**
   * Track lead journey and touchpoints
   */
  async getLeadJourney(ownerUid: string, leadId: string): Promise<LeadJourney> {
    const lead = await this.prisma.ecommerceLead.findFirst({
      where: { id: leadId, ownerUid },
      include: {
        events: true,
        activities: true,
        campaign: true
      }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Build touchpoint timeline
    const touchpoints: TouchPoint[] = [];

    // Initial lead creation touchpoint
    touchpoints.push({
      timestamp: lead.createdAt.toISOString(),
      source: lead.utmSource || 'direct',
      medium: lead.utmMedium || 'organic',
      campaign: lead.utmCampaign,
      action: 'lead_created'
    });

    // Add events as touchpoints
    lead.events?.forEach(event => {
      touchpoints.push({
        timestamp: event.createdAt.toISOString(),
        source: lead.utmSource || 'direct',
        medium: lead.utmMedium || 'organic',
        campaign: lead.utmCampaign,
        action: event.type || 'activity'
      });
    });

    // Add conversion touchpoint if converted
    if (lead.conversionDate) {
      touchpoints.push({
        timestamp: lead.conversionDate.toISOString(),
        source: lead.utmSource || 'direct',
        medium: lead.utmMedium || 'organic',
        campaign: lead.utmCampaign,
        action: 'conversion'
      });
    }

    // Sort touchpoints by timestamp
    touchpoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Build conversion path
    const conversionPath = [...new Set(touchpoints.map(tp => `${tp.source}/${tp.medium}`))];

    // Calculate time to conversion
    let timeToConversion: number | undefined;
    if (lead.conversionDate) {
      timeToConversion = Math.floor(
        (lead.conversionDate.getTime() - lead.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      );
    }

    return {
      leadId: lead.id,
      touchpoints,
      conversionPath,
      timeToConversion,
      totalRevenue: Number(lead.orderValue) || undefined
    };
  }

  /**
   * Get real-time conversion tracking data
   */
  async getRealTimeConversions(ownerUid: string, hoursBack = 24): Promise<any> {
    const fromTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const recentConversions = await this.prisma.ecommerceLead.findMany({
      where: {
        ownerUid,
        status: 'CONVERTED',
        conversionDate: {
          gte: fromTime
        }
      },
      orderBy: {
        conversionDate: 'desc'
      },
      take: 50,
      include: {
        campaign: true
      }
    });

    const totalRevenue = recentConversions.reduce((sum, lead) => sum + (Number(lead.orderValue) || 0), 0);

    return {
      timeframe: `Last ${hoursBack} hours`,
      conversions: recentConversions.length,
      totalRevenue,
      averageOrderValue: recentConversions.length > 0 ? totalRevenue / recentConversions.length : 0,
      recentConversions: recentConversions.map(lead => ({
        leadId: lead.id,
        customerName: lead.fullName,
        orderValue: Number(lead.orderValue),
        conversionDate: lead.conversionDate,
        source: lead.utmSource,
        medium: lead.utmMedium,
        campaign: lead.utmCampaign
      }))
    };
  }

  private calculateAttributionBySource(leads: any[], convertedLeads: any[]): AttributionBySource[] {
    const sourceMap = new Map<string, any>();

    leads.forEach(lead => {
      const key = `${lead.utmSource || 'direct'}|${lead.utmMedium || 'organic'}`;

      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          source: lead.utmSource || 'direct',
          medium: lead.utmMedium || 'organic',
          leads: 0,
          conversions: 0,
          revenue: 0
        });
      }

      const source = sourceMap.get(key);
      source.leads++;

      if (lead.status === 'CONVERTED') {
        source.conversions++;
        source.revenue += Number(lead.orderValue) || 0;
      }
    });

    return Array.from(sourceMap.values()).map(source => ({
      ...source,
      conversionRate: source.leads > 0 ? (source.conversions / source.leads) * 100 : 0,
      averageOrderValue: source.conversions > 0 ? source.revenue / source.conversions : 0
    }));
  }

  private calculateAttributionByCampaign(leads: any[], convertedLeads: any[]): AttributionByCampaign[] {
    const campaignMap = new Map<string, any>();

    leads.forEach(lead => {
      const key = `${lead.utmCampaign || 'none'}|${lead.utmSource || 'direct'}|${lead.utmMedium || 'organic'}`;

      if (!campaignMap.has(key)) {
        campaignMap.set(key, {
          campaign: lead.utmCampaign || 'none',
          source: lead.utmSource || 'direct',
          medium: lead.utmMedium || 'organic',
          leads: 0,
          conversions: 0,
          revenue: 0
        });
      }

      const campaign = campaignMap.get(key);
      campaign.leads++;

      if (lead.status === 'CONVERTED') {
        campaign.conversions++;
        campaign.revenue += Number(lead.orderValue) || 0;
      }
    });

    return Array.from(campaignMap.values()).map(campaign => ({
      ...campaign,
      conversionRate: campaign.leads > 0 ? (campaign.conversions / campaign.leads) * 100 : 0
    }));
  }

  private calculateAttributionByTimeframe(
    leads: any[],
    convertedLeads: any[],
    fromDate: Date,
    toDate: Date
  ): AttributionTimeframe[] {
    const timeframeMap = new Map<string, any>();

    // Initialize all dates in range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      timeframeMap.set(dateKey, {
        date: dateKey,
        leads: 0,
        conversions: 0,
        revenue: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count leads by date
    leads.forEach(lead => {
      const dateKey = lead.createdAt.toISOString().split('T')[0];
      const timeframe = timeframeMap.get(dateKey);
      if (timeframe) {
        timeframe.leads++;
      }
    });

    // Count conversions by date
    convertedLeads.forEach(lead => {
      if (lead.conversionDate) {
        const dateKey = lead.conversionDate.toISOString().split('T')[0];
        const timeframe = timeframeMap.get(dateKey);
        if (timeframe) {
          timeframe.conversions++;
          timeframe.revenue += Number(lead.orderValue) || 0;
        }
      }
    });

    return Array.from(timeframeMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateFunnelAnalysis(leads: any[]): FunnelStage[] {
    const totalLeads = leads.length;
    const contactedLeads = leads.filter(l => ['CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'].includes(l.status));
    const qualifiedLeads = leads.filter(l => ['QUALIFIED', 'CONVERTED', 'CLOSED'].includes(l.status));
    const convertedLeads = leads.filter(l => l.status === 'CONVERTED');

    const stages: FunnelStage[] = [
      {
        stage: 'Lead Generated',
        leads: totalLeads,
        conversionRate: 100,
        dropOffRate: 0
      },
      {
        stage: 'Contacted',
        leads: contactedLeads.length,
        conversionRate: totalLeads > 0 ? (contactedLeads.length / totalLeads) * 100 : 0,
        dropOffRate: totalLeads > 0 ? ((totalLeads - contactedLeads.length) / totalLeads) * 100 : 0
      },
      {
        stage: 'Qualified',
        leads: qualifiedLeads.length,
        conversionRate: totalLeads > 0 ? (qualifiedLeads.length / totalLeads) * 100 : 0,
        dropOffRate: totalLeads > 0 ? ((totalLeads - qualifiedLeads.length) / totalLeads) * 100 : 0
      },
      {
        stage: 'Converted',
        leads: convertedLeads.length,
        conversionRate: totalLeads > 0 ? (convertedLeads.length / totalLeads) * 100 : 0,
        dropOffRate: totalLeads > 0 ? ((totalLeads - convertedLeads.length) / totalLeads) * 100 : 0
      }
    ];

    return stages;
  }
}