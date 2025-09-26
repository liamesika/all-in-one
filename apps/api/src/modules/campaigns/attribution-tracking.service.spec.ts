import { Test, TestingModule } from '@nestjs/testing';
import {
  AttributionTrackingService,
  AttributionReport,
  LeadJourney,
} from './attribution-tracking.service';

// Mock Prisma Client
const mockPrismaClient = {
  ecommerceLead: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

describe('AttributionTrackingService', () => {
  let service: AttributionTrackingService;

  const mockOwnerUid = 'test-owner-uid';

  const mockLeads = [
    {
      id: 'lead-1',
      ownerUid: mockOwnerUid,
      status: 'NEW',
      utmSource: 'facebook',
      utmMedium: 'paid-social',
      utmCampaign: 'summer_sale',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      orderValue: null,
      conversionDate: null,
      campaign: null,
      sales: [],
    },
    {
      id: 'lead-2',
      ownerUid: mockOwnerUid,
      status: 'CONVERTED',
      utmSource: 'facebook',
      utmMedium: 'paid-social',
      utmCampaign: 'summer_sale',
      createdAt: new Date('2024-01-16T14:20:00Z'),
      orderValue: 299,
      conversionDate: new Date('2024-01-20T09:15:00Z'),
      campaign: null,
      sales: [],
    },
    {
      id: 'lead-3',
      ownerUid: mockOwnerUid,
      status: 'CONVERTED',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'winter_campaign',
      createdAt: new Date('2024-01-17T16:45:00Z'),
      orderValue: 399,
      conversionDate: new Date('2024-01-22T11:30:00Z'),
      campaign: null,
      sales: [],
    },
    {
      id: 'lead-4',
      ownerUid: mockOwnerUid,
      status: 'CONTACTED',
      utmSource: 'direct',
      utmMedium: 'organic',
      utmCampaign: null,
      createdAt: new Date('2024-01-18T12:00:00Z'),
      orderValue: null,
      conversionDate: null,
      campaign: null,
      sales: [],
    },
  ];

  const mockLeadWithJourney = {
    id: 'lead-journey-1',
    ownerUid: mockOwnerUid,
    status: 'CONVERTED',
    utmSource: 'facebook',
    utmMedium: 'paid-social',
    utmCampaign: 'holiday_campaign',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    conversionDate: new Date('2024-01-18T14:20:00Z'),
    orderValue: 299,
    events: [
      {
        id: 'event-1',
        type: 'contacted',
        createdAt: new Date('2024-01-16T09:00:00Z'),
      },
      {
        id: 'event-2',
        type: 'qualified',
        createdAt: new Date('2024-01-17T15:30:00Z'),
      },
    ],
    activities: [],
    campaign: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributionTrackingService],
    }).compile();

    service = module.get<AttributionTrackingService>(AttributionTrackingService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generateAttributionReport', () => {
    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(mockLeads);
    });

    it('should generate comprehensive attribution report', async () => {
      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.summary.totalLeads).toBe(4);
      expect(result.summary.convertedLeads).toBe(2);
      expect(result.summary.conversionRate).toBe(50);
      expect(result.summary.totalRevenue).toBe(698);
      expect(result.summary.averageOrderValue).toBe(349);
    });

    it('should use custom date range when provided', async () => {
      const dateFrom = '2024-01-16';
      const dateTo = '2024-01-18';

      await service.generateAttributionReport(mockOwnerUid, dateFrom, dateTo);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
        include: {
          campaign: true,
          sales: true,
        },
      });
    });

    it('should default to 30 days when no date range provided', async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await service.generateAttributionReport(mockOwnerUid);

      const callArgs = mockPrismaClient.ecommerceLead.findMany.mock.calls[0][0];
      expect(callArgs.where.createdAt.gte.getTime()).toBeCloseTo(thirtyDaysAgo.getTime(), -2);
    });

    it('should calculate attribution by source correctly', async () => {
      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.bySource).toHaveLength(2);

      const facebookSource = result.bySource.find(
        s => s.source === 'facebook' && s.medium === 'paid-social'
      );
      expect(facebookSource).toBeDefined();
      expect(facebookSource?.leads).toBe(2);
      expect(facebookSource?.conversions).toBe(1);
      expect(facebookSource?.conversionRate).toBe(50);
      expect(facebookSource?.revenue).toBe(299);

      const googleSource = result.bySource.find(
        s => s.source === 'google' && s.medium === 'cpc'
      );
      expect(googleSource).toBeDefined();
      expect(googleSource?.leads).toBe(1);
      expect(googleSource?.conversions).toBe(1);
      expect(googleSource?.conversionRate).toBe(100);
      expect(googleSource?.revenue).toBe(399);
    });

    it('should calculate attribution by campaign correctly', async () => {
      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.byCampaign).toHaveLength(2);

      const summerSaleCampaign = result.byCampaign.find(
        c => c.campaign === 'summer_sale'
      );
      expect(summerSaleCampaign).toBeDefined();
      expect(summerSaleCampaign?.leads).toBe(2);
      expect(summerSaleCampaign?.conversions).toBe(1);

      const winterCampaign = result.byCampaign.find(
        c => c.campaign === 'winter_campaign'
      );
      expect(winterCampaign).toBeDefined();
      expect(winterCampaign?.leads).toBe(1);
      expect(winterCampaign?.conversions).toBe(1);
    });

    it('should generate funnel analysis', async () => {
      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.funnelAnalysis).toHaveLength(4);

      const leadGenerated = result.funnelAnalysis.find(f => f.stage === 'Lead Generated');
      expect(leadGenerated?.leads).toBe(4);
      expect(leadGenerated?.conversionRate).toBe(100);

      const contacted = result.funnelAnalysis.find(f => f.stage === 'Contacted');
      expect(contacted?.leads).toBe(3); // CONTACTED, QUALIFIED, CONVERTED leads

      const converted = result.funnelAnalysis.find(f => f.stage === 'Converted');
      expect(converted?.leads).toBe(2);
      expect(converted?.conversionRate).toBe(50);
    });

    it('should calculate timeframe attribution by day', async () => {
      const result = await service.generateAttributionReport(
        mockOwnerUid,
        '2024-01-15',
        '2024-01-20'
      );

      expect(result.byTimeframe).toBeDefined();
      expect(result.byTimeframe.length).toBeGreaterThan(0);

      // Should have entries for each day in range
      const jan15 = result.byTimeframe.find(t => t.date === '2024-01-15');
      expect(jan15).toBeDefined();
      expect(jan15?.leads).toBe(1);

      const jan16 = result.byTimeframe.find(t => t.date === '2024-01-16');
      expect(jan16).toBeDefined();
      expect(jan16?.leads).toBe(1);
    });

    it('should handle zero conversions gracefully', async () => {
      const leadsWithoutConversions = mockLeads.map(lead => ({
        ...lead,
        status: 'NEW',
        orderValue: null,
        conversionDate: null,
      }));
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(leadsWithoutConversions);

      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.summary.convertedLeads).toBe(0);
      expect(result.summary.conversionRate).toBe(0);
      expect(result.summary.totalRevenue).toBe(0);
      expect(result.summary.averageOrderValue).toBe(0);
    });

    it('should handle empty lead dataset', async () => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue([]);

      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.summary.totalLeads).toBe(0);
      expect(result.bySource).toHaveLength(0);
      expect(result.byCampaign).toHaveLength(0);
    });
  });

  describe('getLeadJourney', () => {
    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockLeadWithJourney);
    });

    it('should return complete lead journey', async () => {
      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      expect(result.leadId).toBe('lead-journey-1');
      expect(result.touchpoints).toHaveLength(4); // Created + 2 events + conversion
      expect(result.conversionPath).toEqual(['facebook/paid-social']);
      expect(result.timeToConversion).toBe(3); // 3 days from creation to conversion
      expect(result.totalRevenue).toBe(299);
    });

    it('should create touchpoints in chronological order', async () => {
      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      const timestamps = result.touchpoints.map(tp => new Date(tp.timestamp).getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);

      expect(timestamps).toEqual(sortedTimestamps);
    });

    it('should include lead creation touchpoint', async () => {
      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      const creationTouchpoint = result.touchpoints.find(tp => tp.action === 'lead_created');
      expect(creationTouchpoint).toBeDefined();
      expect(creationTouchpoint?.source).toBe('facebook');
      expect(creationTouchpoint?.medium).toBe('paid-social');
      expect(creationTouchpoint?.campaign).toBe('holiday_campaign');
    });

    it('should include conversion touchpoint for converted leads', async () => {
      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      const conversionTouchpoint = result.touchpoints.find(tp => tp.action === 'conversion');
      expect(conversionTouchpoint).toBeDefined();
      expect(new Date(conversionTouchpoint!.timestamp)).toEqual(
        mockLeadWithJourney.conversionDate
      );
    });

    it('should not include conversion touchpoint for non-converted leads', async () => {
      const nonConvertedLead = {
        ...mockLeadWithJourney,
        status: 'QUALIFIED',
        conversionDate: null,
        orderValue: null,
      };
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(nonConvertedLead);

      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      const conversionTouchpoint = result.touchpoints.find(tp => tp.action === 'conversion');
      expect(conversionTouchpoint).toBeUndefined();
      expect(result.timeToConversion).toBeUndefined();
      expect(result.totalRevenue).toBeUndefined();
    });

    it('should build unique conversion path', async () => {
      const leadWithMultipleTouchpoints = {
        ...mockLeadWithJourney,
        events: [
          { type: 'contacted', createdAt: new Date('2024-01-16T09:00:00Z') },
          { type: 'email_opened', createdAt: new Date('2024-01-17T10:00:00Z') },
          { type: 'qualified', createdAt: new Date('2024-01-17T15:30:00Z') },
        ],
      };
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(leadWithMultipleTouchpoints);

      const result = await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      // Should deduplicate the path (all touchpoints have same source/medium)
      expect(result.conversionPath).toEqual(['facebook/paid-social']);
    });

    it('should throw error for non-existent lead', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      await expect(
        service.getLeadJourney(mockOwnerUid, 'non-existent')
      ).rejects.toThrow('Lead not found');
    });

    it('should scope query to ownerUid', async () => {
      await service.getLeadJourney(mockOwnerUid, 'lead-journey-1');

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: { id: 'lead-journey-1', ownerUid: mockOwnerUid },
        include: {
          events: true,
          activities: true,
          campaign: true,
        },
      });
    });
  });

  describe('getRealTimeConversions', () => {
    const mockRecentConversions = [
      {
        id: 'conv-1',
        fullName: 'John Doe',
        orderValue: 299,
        conversionDate: new Date('2024-01-20T10:30:00Z'),
        utmSource: 'facebook',
        utmMedium: 'paid-social',
        utmCampaign: 'flash_sale',
        campaign: null,
      },
      {
        id: 'conv-2',
        fullName: 'Jane Smith',
        orderValue: 199,
        conversionDate: new Date('2024-01-20T14:15:00Z'),
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'search_ads',
        campaign: null,
      },
    ];

    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(mockRecentConversions);
    });

    it('should return real-time conversions for default 24 hours', async () => {
      const result = await service.getRealTimeConversions(mockOwnerUid);

      expect(result.timeframe).toBe('Last 24 hours');
      expect(result.conversions).toBe(2);
      expect(result.totalRevenue).toBe(498);
      expect(result.averageOrderValue).toBe(249);
      expect(result.recentConversions).toHaveLength(2);
    });

    it('should respect custom hours back parameter', async () => {
      const hoursBack = 48;
      const expectedFromTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      await service.getRealTimeConversions(mockOwnerUid, hoursBack);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          status: 'CONVERTED',
          conversionDate: {
            gte: expect.any(Date),
          },
        },
        orderBy: {
          conversionDate: 'desc',
        },
        take: 50,
        include: {
          campaign: true,
        },
      });

      const callArgs = mockPrismaClient.ecommerceLead.findMany.mock.calls[0][0];
      expect(callArgs.where.conversionDate.gte.getTime()).toBeCloseTo(
        expectedFromTime.getTime(),
        -2
      );
    });

    it('should format recent conversions correctly', async () => {
      const result = await service.getRealTimeConversions(mockOwnerUid);

      expect(result.recentConversions[0]).toEqual({
        leadId: 'conv-1',
        customerName: 'John Doe',
        orderValue: 299,
        conversionDate: new Date('2024-01-20T10:30:00Z'),
        source: 'facebook',
        medium: 'paid-social',
        campaign: 'flash_sale',
      });
    });

    it('should handle zero conversions', async () => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue([]);

      const result = await service.getRealTimeConversions(mockOwnerUid);

      expect(result.conversions).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageOrderValue).toBe(0);
      expect(result.recentConversions).toHaveLength(0);
    });

    it('should limit results to 50 conversions', async () => {
      await service.getRealTimeConversions(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should order by conversion date descending', async () => {
      await service.getRealTimeConversions(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            conversionDate: 'desc',
          },
        })
      );
    });
  });

  describe('data security and scoping', () => {
    it('should always scope queries to ownerUid', async () => {
      await service.generateAttributionReport(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });

    it('should not allow cross-owner data access in lead journey', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      await expect(
        service.getLeadJourney(mockOwnerUid, 'other-owner-lead')
      ).rejects.toThrow('Lead not found');

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: { id: 'other-owner-lead', ownerUid: mockOwnerUid },
        include: expect.any(Object),
      });
    });

    it('should scope real-time conversions to owner', async () => {
      await service.getRealTimeConversions(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle database errors in attribution report', async () => {
      mockPrismaClient.ecommerceLead.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        service.generateAttributionReport(mockOwnerUid)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle missing conversion dates gracefully', async () => {
      const leadsWithNullDates = mockLeads.map(lead => ({
        ...lead,
        conversionDate: null,
      }));
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(leadsWithNullDates);

      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.byTimeframe.every(t => t.conversions === 0)).toBe(true);
    });

    it('should handle leads with missing UTM data', async () => {
      const leadsWithoutUtm = [
        {
          ...mockLeads[0],
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        },
      ];
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(leadsWithoutUtm);

      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.bySource[0].source).toBe('direct');
      expect(result.bySource[0].medium).toBe('organic');
      expect(result.byCampaign[0].campaign).toBe('none');
    });

    it('should handle invalid date ranges', async () => {
      // Future date range
      const futureFrom = '2025-01-01';
      const futureTo = '2025-01-31';

      const result = await service.generateAttributionReport(
        mockOwnerUid,
        futureFrom,
        futureTo
      );

      expect(result.success).toBe(true);
      expect(result.summary.totalLeads).toBe(0);
    });
  });

  describe('performance and scalability', () => {
    it('should handle large datasets efficiently', async () => {
      const largeLeadSet = Array(1000)
        .fill(0)
        .map((_, i) => ({
          ...mockLeads[0],
          id: `lead-${i}`,
          status: i % 5 === 0 ? 'CONVERTED' : 'NEW',
          orderValue: i % 5 === 0 ? 100 + i : null,
        }));

      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(largeLeadSet);

      const result = await service.generateAttributionReport(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.summary.totalLeads).toBe(1000);
      expect(result.summary.convertedLeads).toBe(200);
    });

    it('should handle concurrent requests efficiently', async () => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(mockLeads);

      const promises = Array(10)
        .fill(0)
        .map(() => service.generateAttributionReport(mockOwnerUid));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should optimize date range queries', async () => {
      const specificDateRange = await service.generateAttributionReport(
        mockOwnerUid,
        '2024-01-15',
        '2024-01-16'
      );

      // Should use date filtering
      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });
  });
});