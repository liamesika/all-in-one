import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { LeadImportService } from './lead-import.service';
import { ShopifyIntegrationService } from './shopify-integration.service';
import { AttributionTrackingService } from './attribution-tracking.service';

// Mock services
const mockCampaignsService = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  hardDelete: jest.fn(),
};

const mockLeadImportService = {
  syncMetaCampaignLeads: jest.fn(),
  importMetaLeads: jest.fn(),
  getCampaignAttribution: jest.fn(),
};

const mockShopifyService = {
  syncShopifyOrders: jest.fn(),
  getConversionTracking: jest.fn(),
};

const mockAttributionService = {
  generateAttributionReport: jest.fn(),
  getLeadJourney: jest.fn(),
  getRealTimeConversions: jest.fn(),
};

// Mock OrgGuard
const mockOrgGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('CampaignsController (Integration)', () => {
  let app: INestApplication;
  let campaignsService: CampaignsService;
  let leadImportService: LeadImportService;
  let shopifyService: ShopifyIntegrationService;
  let attributionService: AttributionTrackingService;

  const mockOwnerUid = 'test-owner-uid';
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Summer Sale Campaign',
    platform: 'META',
    status: 'ACTIVE',
    budget: 5000,
    spend: 2500,
    conversions: 25,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
        {
          provide: LeadImportService,
          useValue: mockLeadImportService,
        },
        {
          provide: ShopifyIntegrationService,
          useValue: mockShopifyService,
        },
        {
          provide: AttributionTrackingService,
          useValue: mockAttributionService,
        },
      ],
    })
      .overrideGuard(require('../../auth/org.guard').OrgGuard)
      .useValue(mockOrgGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    campaignsService = module.get<CampaignsService>(CampaignsService);
    leadImportService = module.get<LeadImportService>(LeadImportService);
    shopifyService = module.get<ShopifyIntegrationService>(ShopifyIntegrationService);
    attributionService = module.get<AttributionTrackingService>(AttributionTrackingService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Campaign CRUD Operations', () => {
    describe('GET /api/e-commerce/campaigns', () => {
      it('should return list of campaigns with filters', async () => {
        const mockCampaigns = {
          campaigns: [mockCampaign],
          total: 1,
        };
        mockCampaignsService.list.mockResolvedValue(mockCampaigns);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns')
          .query({
            q: 'summer',
            status: 'ACTIVE',
            limit: '50',
          })
          .expect(200);

        expect(response.body).toEqual(mockCampaigns);
        expect(mockCampaignsService.list).toHaveBeenCalledWith('demo', {
          q: 'summer',
          status: 'ACTIVE',
          limit: 50,
        });
      });

      it('should use default limit when not specified', async () => {
        mockCampaignsService.list.mockResolvedValue({ campaigns: [], total: 0 });

        await request(app.getHttpServer())
          .get('/e-commerce/campaigns')
          .expect(200);

        expect(mockCampaignsService.list).toHaveBeenCalledWith('demo', {
          q: undefined,
          status: undefined,
          limit: 100,
        });
      });
    });

    describe('GET /api/e-commerce/campaigns/:id', () => {
      it('should return specific campaign', async () => {
        mockCampaignsService.get.mockResolvedValue(mockCampaign);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/campaign-123')
          .expect(200);

        expect(response.body).toEqual(mockCampaign);
        expect(mockCampaignsService.get).toHaveBeenCalledWith('demo', 'campaign-123');
      });

      it('should handle non-existent campaign', async () => {
        mockCampaignsService.get.mockResolvedValue(null);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/nonexistent')
          .expect(200);

        expect(response.body).toBeNull();
      });
    });

    describe('POST /api/e-commerce/campaigns', () => {
      const createCampaignDto = {
        name: 'New Campaign',
        platform: 'META',
        goal: 'CONVERSIONS',
        budget: 3000,
        audience: { interests: ['shopping', 'fashion'] },
      };

      it('should create new campaign', async () => {
        const newCampaign = { id: 'new-campaign-456', ...createCampaignDto };
        mockCampaignsService.create.mockResolvedValue(newCampaign);

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns')
          .send(createCampaignDto)
          .expect(201);

        expect(response.body).toEqual(newCampaign);
        expect(mockCampaignsService.create).toHaveBeenCalledWith('demo', createCampaignDto);
      });

      it('should validate campaign data', async () => {
        const invalidCampaign = {
          name: '', // Empty name
          platform: 'INVALID_PLATFORM',
          budget: -100, // Negative budget
        };

        await request(app.getHttpServer())
          .post('/e-commerce/campaigns')
          .send(invalidCampaign)
          .expect(400);
      });
    });

    describe('PATCH /api/e-commerce/campaigns/:id', () => {
      const updateCampaignDto = {
        name: 'Updated Campaign',
        status: 'PAUSED',
        budget: 4000,
      };

      it('should update existing campaign', async () => {
        const updatedCampaign = { ...mockCampaign, ...updateCampaignDto };
        mockCampaignsService.update.mockResolvedValue(updatedCampaign);

        const response = await request(app.getHttpServer())
          .patch('/e-commerce/campaigns/campaign-123')
          .send(updateCampaignDto)
          .expect(200);

        expect(response.body).toEqual(updatedCampaign);
        expect(mockCampaignsService.update).toHaveBeenCalledWith(
          'demo',
          'campaign-123',
          updateCampaignDto
        );
      });
    });

    describe('DELETE /api/e-commerce/campaigns/:id', () => {
      it('should delete campaign', async () => {
        mockCampaignsService.hardDelete.mockResolvedValue(true);

        const response = await request(app.getHttpServer())
          .delete('/e-commerce/campaigns/campaign-123')
          .expect(200);

        expect(response.body).toEqual({ ok: true });
        expect(mockCampaignsService.hardDelete).toHaveBeenCalledWith('demo', 'campaign-123');
      });
    });
  });

  describe('Lead Import Operations', () => {
    describe('POST /api/e-commerce/campaigns/leads/sync', () => {
      it('should sync Meta campaign leads', async () => {
        const mockSyncResult = {
          success: true,
          imported: 15,
          updated: 3,
          errors: 0,
          details: [],
        };
        mockLeadImportService.syncMetaCampaignLeads.mockResolvedValue(mockSyncResult);

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/sync')
          .query({ campaignId: 'campaign-123' })
          .expect(201);

        expect(response.body).toEqual(mockSyncResult);
        expect(mockLeadImportService.syncMetaCampaignLeads).toHaveBeenCalledWith(
          'demo',
          'campaign-123'
        );
      });

      it('should sync all campaigns when no campaignId provided', async () => {
        const mockSyncResult = {
          success: true,
          imported: 25,
          updated: 5,
          errors: 0,
          details: [],
        };
        mockLeadImportService.syncMetaCampaignLeads.mockResolvedValue(mockSyncResult);

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/sync')
          .expect(201);

        expect(response.body).toEqual(mockSyncResult);
        expect(mockLeadImportService.syncMetaCampaignLeads).toHaveBeenCalledWith(
          'demo',
          undefined
        );
      });

      it('should handle sync failures', async () => {
        mockLeadImportService.syncMetaCampaignLeads.mockRejectedValue(
          new Error('Meta API unavailable')
        );

        await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/sync')
          .expect(500);
      });
    });

    describe('POST /api/e-commerce/campaigns/leads/import', () => {
      const mockMetaLeads = [
        {
          leadgen_id: 'lead_123456789',
          form_id: 'form_987654321',
          campaign_id: 'camp_111222333',
          campaign_name: 'Summer Sale Campaign',
          adset_id: 'adset_444555666',
          adset_name: 'Lookalike Audience',
          ad_id: 'ad_777888999',
          ad_name: 'Promotional Video Ad',
          created_time: '2024-01-15T10:30:00Z',
          platform: 'facebook',
          field_data: [
            { name: 'full_name', values: ['John Doe'] },
            { name: 'email', values: ['john.doe@example.com'] },
            { name: 'phone_number', values: ['+972501234567'] },
          ],
        },
      ];

      it('should import Meta leads directly', async () => {
        const mockImportResult = {
          success: true,
          imported: 1,
          updated: 0,
          errors: 0,
          details: [
            {
              leadId: 'imported-lead-123',
              status: 'imported',
              message: 'Lead imported successfully',
            },
          ],
        };
        mockLeadImportService.importMetaLeads.mockResolvedValue(mockImportResult);

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/import')
          .send({ leads: mockMetaLeads })
          .expect(201);

        expect(response.body).toEqual(mockImportResult);
        expect(mockLeadImportService.importMetaLeads).toHaveBeenCalledWith(
          'demo',
          mockMetaLeads
        );
      });

      it('should validate leads array', async () => {
        await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/import')
          .send({}) // Missing leads
          .expect(400);

        await request(app.getHttpServer())
          .post('/e-commerce/campaigns/leads/import')
          .send({ leads: 'not-an-array' })
          .expect(400);
      });
    });

    describe('GET /api/e-commerce/campaigns/leads/:leadId/attribution', () => {
      it('should return lead attribution data', async () => {
        const mockAttribution = {
          leadId: 'lead-123',
          source: 'FACEBOOK',
          sourceName: 'Summer Sale Campaign',
          utmSource: 'facebook',
          utmMedium: 'paid-social',
          utmCampaign: 'summer_sale',
          createdAt: '2024-01-15T10:30:00Z',
        };
        mockLeadImportService.getCampaignAttribution.mockResolvedValue(mockAttribution);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/leads/lead-123/attribution')
          .expect(200);

        expect(response.body).toEqual(mockAttribution);
        expect(mockLeadImportService.getCampaignAttribution).toHaveBeenCalledWith(
          'demo',
          'lead-123'
        );
      });

      it('should handle non-existent lead', async () => {
        mockLeadImportService.getCampaignAttribution.mockResolvedValue(null);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/leads/nonexistent/attribution')
          .expect(200);

        expect(response.body).toBeNull();
      });
    });
  });

  describe('Shopify Integration Operations', () => {
    describe('POST /api/e-commerce/campaigns/shopify/sync', () => {
      it('should sync Shopify orders with optional credentials', async () => {
        const mockSyncResult = {
          success: true,
          conversions: 12,
          orders: 15,
          totalRevenue: 4500,
          details: [
            {
              orderId: '1001',
              status: 'converted',
              revenue: 299,
              message: 'Lead converted to customer',
            },
          ],
        };
        mockShopifyService.syncShopifyOrders.mockResolvedValue(mockSyncResult);

        const credentials = {
          shopifyUrl: 'https://mystore.myshopify.com',
          accessToken: 'test-access-token',
        };

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns/shopify/sync')
          .send(credentials)
          .expect(201);

        expect(response.body).toEqual(mockSyncResult);
        expect(mockShopifyService.syncShopifyOrders).toHaveBeenCalledWith(
          'demo',
          credentials.shopifyUrl,
          credentials.accessToken
        );
      });

      it('should sync with stored credentials when none provided', async () => {
        const mockSyncResult = {
          success: true,
          conversions: 8,
          orders: 10,
          totalRevenue: 2100,
          details: [],
        };
        mockShopifyService.syncShopifyOrders.mockResolvedValue(mockSyncResult);

        const response = await request(app.getHttpServer())
          .post('/e-commerce/campaigns/shopify/sync')
          .send({})
          .expect(201);

        expect(response.body).toEqual(mockSyncResult);
        expect(mockShopifyService.syncShopifyOrders).toHaveBeenCalledWith(
          'demo',
          undefined,
          undefined
        );
      });

      it('should handle Shopify API errors', async () => {
        mockShopifyService.syncShopifyOrders.mockRejectedValue(
          new Error('Shopify API authentication failed')
        );

        await request(app.getHttpServer())
          .post('/e-commerce/campaigns/shopify/sync')
          .send({ shopifyUrl: 'invalid', accessToken: 'invalid' })
          .expect(500);
      });
    });

    describe('GET /api/e-commerce/campaigns/conversion-tracking', () => {
      it('should return conversion tracking data', async () => {
        const mockTrackingData = {
          totalLeads: 150,
          convertedLeads: 45,
          conversionRate: 30,
          totalRevenue: 13500,
          attribution: [
            {
              source: 'facebook',
              medium: 'paid-social',
              campaign: 'summer_sale',
              conversions: 25,
              revenue: 7500,
            },
            {
              source: 'google',
              medium: 'cpc',
              campaign: 'search_ads',
              conversions: 20,
              revenue: 6000,
            },
          ],
          recentConversions: [],
        };
        mockShopifyService.getConversionTracking.mockResolvedValue(mockTrackingData);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/conversion-tracking')
          .query({
            dateFrom: '2024-01-01',
            dateTo: '2024-01-31',
          })
          .expect(200);

        expect(response.body).toEqual(mockTrackingData);
        expect(mockShopifyService.getConversionTracking).toHaveBeenCalledWith(
          'demo',
          '2024-01-01',
          '2024-01-31'
        );
      });

      it('should work without date parameters', async () => {
        mockShopifyService.getConversionTracking.mockResolvedValue({
          totalLeads: 0,
          convertedLeads: 0,
          conversionRate: 0,
          totalRevenue: 0,
          attribution: [],
          recentConversions: [],
        });

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/conversion-tracking')
          .expect(200);

        expect(mockShopifyService.getConversionTracking).toHaveBeenCalledWith(
          'demo',
          undefined,
          undefined
        );
      });
    });
  });

  describe('Attribution Tracking Operations', () => {
    describe('GET /api/e-commerce/campaigns/attribution-report', () => {
      it('should return comprehensive attribution report', async () => {
        const mockAttributionReport = {
          success: true,
          dateRange: {
            from: '2024-01-01T00:00:00.000Z',
            to: '2024-01-31T23:59:59.999Z',
          },
          summary: {
            totalLeads: 200,
            convertedLeads: 60,
            conversionRate: 30,
            totalRevenue: 18000,
            averageOrderValue: 300,
          },
          bySource: [
            {
              source: 'facebook',
              medium: 'paid-social',
              leads: 120,
              conversions: 36,
              conversionRate: 30,
              revenue: 10800,
              averageOrderValue: 300,
            },
          ],
          byCampaign: [
            {
              campaign: 'summer_sale',
              source: 'facebook',
              medium: 'paid-social',
              leads: 80,
              conversions: 24,
              conversionRate: 30,
              revenue: 7200,
            },
          ],
          byTimeframe: [
            {
              date: '2024-01-01',
              leads: 10,
              conversions: 3,
              revenue: 900,
            },
          ],
          funnelAnalysis: [
            {
              stage: 'Lead Generated',
              leads: 200,
              conversionRate: 100,
              dropOffRate: 0,
            },
            {
              stage: 'Converted',
              leads: 60,
              conversionRate: 30,
              dropOffRate: 70,
            },
          ],
        };
        mockAttributionService.generateAttributionReport.mockResolvedValue(mockAttributionReport);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/attribution-report')
          .query({
            dateFrom: '2024-01-01',
            dateTo: '2024-01-31',
          })
          .expect(200);

        expect(response.body).toEqual(mockAttributionReport);
        expect(mockAttributionService.generateAttributionReport).toHaveBeenCalledWith(
          'demo',
          '2024-01-01',
          '2024-01-31'
        );
      });

      it('should use default date range when not specified', async () => {
        mockAttributionService.generateAttributionReport.mockResolvedValue({
          success: true,
          dateRange: { from: expect.any(String), to: expect.any(String) },
          summary: {
            totalLeads: 0,
            convertedLeads: 0,
            conversionRate: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
          },
          bySource: [],
          byCampaign: [],
          byTimeframe: [],
          funnelAnalysis: [],
        });

        await request(app.getHttpServer())
          .get('/e-commerce/campaigns/attribution-report')
          .expect(200);

        expect(mockAttributionService.generateAttributionReport).toHaveBeenCalledWith(
          'demo',
          undefined,
          undefined
        );
      });
    });

    describe('GET /api/e-commerce/campaigns/leads/:leadId/journey', () => {
      it('should return lead journey data', async () => {
        const mockLeadJourney = {
          leadId: 'lead-123',
          touchpoints: [
            {
              timestamp: '2024-01-15T10:30:00Z',
              source: 'facebook',
              medium: 'paid-social',
              campaign: 'summer_sale',
              action: 'lead_created',
            },
            {
              timestamp: '2024-01-16T09:00:00Z',
              source: 'facebook',
              medium: 'paid-social',
              campaign: 'summer_sale',
              action: 'contacted',
            },
            {
              timestamp: '2024-01-18T14:20:00Z',
              source: 'facebook',
              medium: 'paid-social',
              campaign: 'summer_sale',
              action: 'conversion',
            },
          ],
          conversionPath: ['facebook/paid-social'],
          timeToConversion: 3,
          totalRevenue: 299,
        };
        mockAttributionService.getLeadJourney.mockResolvedValue(mockLeadJourney);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/leads/lead-123/journey')
          .expect(200);

        expect(response.body).toEqual(mockLeadJourney);
        expect(mockAttributionService.getLeadJourney).toHaveBeenCalledWith(
          'demo',
          'lead-123'
        );
      });

      it('should handle non-existent lead journey', async () => {
        mockAttributionService.getLeadJourney.mockRejectedValue(
          new Error('Lead not found')
        );

        await request(app.getHttpServer())
          .get('/e-commerce/campaigns/leads/nonexistent/journey')
          .expect(500);
      });
    });

    describe('GET /api/e-commerce/campaigns/real-time-conversions', () => {
      it('should return real-time conversion data', async () => {
        const mockRealTimeData = {
          timeframe: 'Last 24 hours',
          conversions: 8,
          totalRevenue: 2400,
          averageOrderValue: 300,
          recentConversions: [
            {
              leadId: 'conv-1',
              customerName: 'John Doe',
              orderValue: 299,
              conversionDate: '2024-01-20T10:30:00Z',
              source: 'facebook',
              medium: 'paid-social',
              campaign: 'flash_sale',
            },
            {
              leadId: 'conv-2',
              customerName: 'Jane Smith',
              orderValue: 199,
              conversionDate: '2024-01-20T14:15:00Z',
              source: 'google',
              medium: 'cpc',
              campaign: 'search_ads',
            },
          ],
        };
        mockAttributionService.getRealTimeConversions.mockResolvedValue(mockRealTimeData);

        const response = await request(app.getHttpServer())
          .get('/e-commerce/campaigns/real-time-conversions')
          .query({ hoursBack: '48' })
          .expect(200);

        expect(response.body).toEqual(mockRealTimeData);
        expect(mockAttributionService.getRealTimeConversions).toHaveBeenCalledWith(
          'demo',
          48
        );
      });

      it('should use default hours back when not specified', async () => {
        mockAttributionService.getRealTimeConversions.mockResolvedValue({
          timeframe: 'Last 24 hours',
          conversions: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          recentConversions: [],
        });

        await request(app.getHttpServer())
          .get('/e-commerce/campaigns/real-time-conversions')
          .expect(200);

        expect(mockAttributionService.getRealTimeConversions).toHaveBeenCalledWith(
          'demo',
          24
        );
      });

      it('should handle invalid hoursBack parameter', async () => {
        mockAttributionService.getRealTimeConversions.mockResolvedValue({
          timeframe: 'Last 24 hours',
          conversions: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          recentConversions: [],
        });

        await request(app.getHttpServer())
          .get('/e-commerce/campaigns/real-time-conversions')
          .query({ hoursBack: 'invalid' })
          .expect(200);

        // Should fallback to 24 hours (NaN converts to 24)
        expect(mockAttributionService.getRealTimeConversions).toHaveBeenCalledWith(
          'demo',
          24
        );
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      mockOrgGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .get('/e-commerce/campaigns')
        .expect(403);

      await request(app.getHttpServer())
        .post('/e-commerce/campaigns/leads/sync')
        .expect(403);

      await request(app.getHttpServer())
        .get('/e-commerce/campaigns/attribution-report')
        .expect(403);
    });

    it('should pass authentication with valid credentials', async () => {
      mockOrgGuard.canActivate.mockReturnValue(true);
      mockCampaignsService.list.mockResolvedValue({ campaigns: [], total: 0 });

      await request(app.getHttpServer())
        .get('/e-commerce/campaigns')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockCampaignsService.list.mockRejectedValue(new Error('Database connection failed'));

      await request(app.getHttpServer())
        .get('/e-commerce/campaigns')
        .expect(500);
    });

    it('should handle Meta API rate limiting', async () => {
      mockLeadImportService.syncMetaCampaignLeads.mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await request(app.getHttpServer())
        .post('/e-commerce/campaigns/leads/sync')
        .expect(500);
    });

    it('should handle Shopify authentication errors', async () => {
      mockShopifyService.syncShopifyOrders.mockRejectedValue({
        status: 401,
        message: 'Invalid access token',
      });

      await request(app.getHttpServer())
        .post('/e-commerce/campaigns/shopify/sync')
        .send({ shopifyUrl: 'https://test.myshopify.com', accessToken: 'invalid' })
        .expect(500);
    });

    it('should validate date parameters', async () => {
      await request(app.getHttpServer())
        .get('/e-commerce/campaigns/attribution-report')
        .query({
          dateFrom: 'invalid-date',
          dateTo: '2024-01-31',
        })
        .expect(400);
    });
  });

  describe('Data Security and Scoping', () => {
    it('should scope all operations to authenticated owner', async () => {
      mockCampaignsService.list.mockResolvedValue({ campaigns: [], total: 0 });
      mockLeadImportService.syncMetaCampaignLeads.mockResolvedValue({
        success: true,
        imported: 0,
        updated: 0,
        errors: 0,
        details: [],
      });
      mockShopifyService.getConversionTracking.mockResolvedValue({
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        totalRevenue: 0,
        attribution: [],
        recentConversions: [],
      });

      await request(app.getHttpServer()).get('/e-commerce/campaigns').expect(200);
      await request(app.getHttpServer()).post('/e-commerce/campaigns/leads/sync').expect(201);
      await request(app.getHttpServer()).get('/e-commerce/campaigns/conversion-tracking').expect(200);

      // Verify all services receive the correct ownerUid
      expect(mockCampaignsService.list).toHaveBeenCalledWith(
        'demo',
        expect.any(Object)
      );
      expect(mockLeadImportService.syncMetaCampaignLeads).toHaveBeenCalledWith(
        'demo',
        expect.any(String)
      );
      expect(mockShopifyService.getConversionTracking).toHaveBeenCalledWith(
        'demo',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should not allow cross-owner data access', async () => {
      // Mock services should never receive different ownerUid
      mockCampaignsService.get.mockResolvedValue(null); // Simulate no access to other owner's data

      const response = await request(app.getHttpServer())
        .get('/e-commerce/campaigns/other-owner-campaign')
        .expect(200);

      expect(response.body).toBeNull();
      expect(mockCampaignsService.get).toHaveBeenCalledWith('demo', 'other-owner-campaign');
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should handle concurrent requests efficiently', async () => {
      mockAttributionService.generateAttributionReport.mockResolvedValue({
        success: true,
        dateRange: { from: '2024-01-01', to: '2024-01-31' },
        summary: {
          totalLeads: 0,
          convertedLeads: 0,
          conversionRate: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        },
        bySource: [],
        byCampaign: [],
        byTimeframe: [],
        funnelAnalysis: [],
      });

      const requests = Array(10)
        .fill(0)
        .map(() =>
          request(app.getHttpServer())
            .get('/e-commerce/campaigns/attribution-report')
            .expect(200)
        );

      await Promise.all(requests);

      expect(mockAttributionService.generateAttributionReport).toHaveBeenCalledTimes(10);
    });

    it('should handle large lead import batches', async () => {
      const largeLeadBatch = Array(500)
        .fill(0)
        .map((_, i) => ({
          leadgen_id: `lead_${i}`,
          campaign_name: 'Large Test Campaign',
          field_data: [
            { name: 'email', values: [`test${i}@example.com`] },
          ],
        }));

      mockLeadImportService.importMetaLeads.mockResolvedValue({
        success: true,
        imported: 500,
        updated: 0,
        errors: 0,
        details: [],
      });

      const response = await request(app.getHttpServer())
        .post('/e-commerce/campaigns/leads/import')
        .send({ leads: largeLeadBatch })
        .timeout(30000) // 30 second timeout for large requests
        .expect(201);

      expect(response.body.imported).toBe(500);
    });
  });

  describe('Integration Flow Testing', () => {
    it('should support complete lead-to-customer conversion flow', async () => {
      // 1. Import leads from Meta
      const mockLeads = [
        {
          leadgen_id: 'lead_flow_test',
          campaign_name: 'Integration Test Campaign',
          field_data: [
            { name: 'email', values: ['flow-test@example.com'] },
          ],
        },
      ];

      mockLeadImportService.importMetaLeads.mockResolvedValue({
        success: true,
        imported: 1,
        updated: 0,
        errors: 0,
        details: [{ leadId: 'imported-flow-lead', status: 'imported' }],
      });

      // 2. Sync Shopify orders to convert leads
      mockShopifyService.syncShopifyOrders.mockResolvedValue({
        success: true,
        conversions: 1,
        orders: 1,
        totalRevenue: 299,
        details: [
          {
            leadId: 'imported-flow-lead',
            status: 'converted',
            revenue: 299,
          },
        ],
      });

      // 3. Generate attribution report
      mockAttributionService.generateAttributionReport.mockResolvedValue({
        success: true,
        summary: {
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: 100,
          totalRevenue: 299,
          averageOrderValue: 299,
        },
      });

      // Execute the flow
      const leadImportResponse = await request(app.getHttpServer())
        .post('/e-commerce/campaigns/leads/import')
        .send({ leads: mockLeads })
        .expect(201);

      const shopifySyncResponse = await request(app.getHttpServer())
        .post('/e-commerce/campaigns/shopify/sync')
        .expect(201);

      const attributionResponse = await request(app.getHttpServer())
        .get('/e-commerce/campaigns/attribution-report')
        .expect(200);

      // Verify complete flow
      expect(leadImportResponse.body.imported).toBe(1);
      expect(shopifySyncResponse.body.conversions).toBe(1);
      expect(attributionResponse.body.summary.conversionRate).toBe(100);
    });
  });
});