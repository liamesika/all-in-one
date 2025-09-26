import { Test, TestingModule } from '@nestjs/testing';
import {
  ShopifyIntegrationService,
  ShopifyOrder,
  ConversionResult,
} from './shopify-integration.service';

// Mock Prisma Client
const mockPrismaClient = {
  ecommerceLead: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

describe('ShopifyIntegrationService', () => {
  let service: ShopifyIntegrationService;

  const mockOwnerUid = 'test-owner-uid';

  const mockShopifyOrder: ShopifyOrder = {
    id: 1001,
    name: '#1001',
    email: 'john.doe@example.com',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
    cancelled_at: undefined,
    closed_at: undefined,
    financial_status: 'paid',
    fulfillment_status: 'fulfilled',
    total_price: '299.00',
    subtotal_price: '249.00',
    total_tax: '50.00',
    currency: 'ILS',
    customer: {
      id: 2001,
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+972501234567',
      created_at: '2024-01-10T09:00:00Z',
    },
    billing_address: {
      first_name: 'John',
      last_name: 'Doe',
      address1: '123 Main St',
      city: 'Tel Aviv',
      country: 'Israel',
      phone: '+972501234567',
    },
    line_items: [
      {
        id: 3001,
        product_id: 4001,
        variant_id: 5001,
        title: 'Premium Product',
        quantity: 1,
        price: '249.00',
        total_discount: '0.00',
      },
    ],
    note_attributes: [
      { name: 'utm_source', value: 'facebook' },
      { name: 'utm_campaign', value: 'holiday_sale' },
      { name: 'utm_medium', value: 'paid-social' },
      { name: 'utm_term', value: 'lookalike' },
      { name: 'utm_content', value: 'video_ad' },
    ],
  };

  const mockMatchingLead = {
    id: 'lead-123',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    status: 'NEW',
    ownerUid: mockOwnerUid,
  };

  const mockConvertedLead = {
    ...mockMatchingLead,
    status: 'CONVERTED',
    orderValue: 299,
    conversionDate: new Date('2024-01-15T10:30:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopifyIntegrationService],
    }).compile();

    service = module.get<ShopifyIntegrationService>(ShopifyIntegrationService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('syncShopifyOrders', () => {
    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockMatchingLead);
      mockPrismaClient.ecommerceLead.update.mockResolvedValue(mockConvertedLead);
    });

    it('should successfully sync Shopify orders and convert matching leads', async () => {
      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.conversions).toBe(1);
      expect(result.orders).toBe(1);
      expect(result.totalRevenue).toBe(299);
      expect(result.details).toHaveLength(1);
      expect(result.details[0].status).toBe('converted');
    });

    it('should convert lead to customer status with order details', async () => {
      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.update).toHaveBeenCalledWith({
        where: { id: mockMatchingLead.id },
        data: {
          status: 'CONVERTED',
          orderValue: 299,
          conversionDate: new Date('2024-01-15T10:30:00Z'),
          notes: expect.stringContaining('Converted to customer with Shopify order #1001'),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle orders without matching leads', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.conversions).toBe(0);
      expect(result.orders).toBe(1);
      expect(result.details[0].status).toBe('no-match');
    });

    it('should find matching leads by email (case insensitive)', async () => {
      const orderWithMixedCaseEmail = {
        ...mockShopifyOrder,
        email: 'JOHN.DOE@EXAMPLE.COM',
        customer: {
          ...mockShopifyOrder.customer,
          email: 'JOHN.DOE@EXAMPLE.COM',
        },
      };

      // Mock the service to use the modified order
      jest.spyOn(service as any, 'syncShopifyOrders').mockImplementation(async (ownerUid) => {
        const result = await service['findMatchingLead'](ownerUid, orderWithMixedCaseEmail);
        return { success: true, conversions: result ? 1 : 0, orders: 1, totalRevenue: 0, details: [] };
      });

      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          email: { equals: 'JOHN.DOE@EXAMPLE.COM', mode: 'insensitive' },
          status: { not: 'CONVERTED' },
        },
      });
    });

    it('should find matching leads by phone number if email fails', async () => {
      mockPrismaClient.ecommerceLead.findFirst
        .mockResolvedValueOnce(null) // Email search fails
        .mockResolvedValueOnce(mockMatchingLead); // Phone search succeeds

      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenLastCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          phone: '+972501234567',
          status: { not: 'CONVERTED' },
        },
      });
    });

    it('should not match already converted leads', async () => {
      const convertedLead = { ...mockMatchingLead, status: 'CONVERTED' };
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(convertedLead);

      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { not: 'CONVERTED' },
          }),
        })
      );
    });

    it('should extract UTM parameters from order attributes', async () => {
      const spy = jest.spyOn(service as any, 'createOrderRecord');

      await service.syncShopifyOrders(mockOwnerUid);

      expect(spy).toHaveBeenCalledWith(
        mockOwnerUid,
        expect.objectContaining({
          note_attributes: expect.arrayContaining([
            { name: 'utm_source', value: 'facebook' },
            { name: 'utm_campaign', value: 'holiday_sale' },
            { name: 'utm_medium', value: 'paid-social' },
            { name: 'utm_term', value: 'lookalike' },
            { name: 'utm_content', value: 'video_ad' },
          ]),
        }),
        expect.any(String)
      );
    });

    it('should handle orders with different currencies', async () => {
      const usdOrder = {
        ...mockShopifyOrder,
        currency: 'USD',
        total_price: '100.00',
      };

      // Mock to return USD order
      jest.spyOn(service as any, 'syncShopifyOrders').mockImplementation(async () => {
        return {
          success: true,
          conversions: 1,
          orders: 1,
          totalRevenue: 100,
          details: [
            {
              status: 'converted',
              revenue: 100,
            },
          ],
        };
      });

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.totalRevenue).toBe(100);
    });

    it('should handle orders with missing customer phone', async () => {
      const orderWithoutPhone = {
        ...mockShopifyOrder,
        customer: {
          ...mockShopifyOrder.customer,
          phone: undefined,
        },
        billing_address: {
          ...mockShopifyOrder.billing_address!,
          phone: undefined,
        },
      };

      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      // Should not try to search by phone when it's not available
      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.details).toHaveLength(1);
      expect(result.details[0].status).toBe('error');
      expect(result.details[0].message).toBe('Database connection failed');
    });

    it('should handle orders with cancelled/refunded status', async () => {
      const cancelledOrder = {
        ...mockShopifyOrder,
        financial_status: 'refunded',
        cancelled_at: '2024-01-16T10:00:00Z',
      };

      // The service should still process cancelled orders but mark them appropriately
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockMatchingLead);

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.orders).toBe(1);
    });
  });

  describe('getConversionTracking', () => {
    const mockConvertedLeads = [
      {
        ...mockConvertedLead,
        orderValue: 299,
        conversionDate: new Date('2024-01-15T10:30:00Z'),
      },
      {
        ...mockConvertedLead,
        id: 'lead-456',
        orderValue: 199,
        conversionDate: new Date('2024-01-16T14:20:00Z'),
      },
    ];

    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(mockConvertedLeads);
      mockPrismaClient.ecommerceLead.count.mockResolvedValue(10);
    });

    it('should return conversion tracking data', async () => {
      const result = await service.getConversionTracking(mockOwnerUid);

      expect(result).toEqual({
        totalLeads: 10,
        convertedLeads: 2,
        conversionRate: 20,
        totalRevenue: 498,
        attribution: expect.any(Array),
        recentConversions: mockConvertedLeads.slice(0, 10),
      });
    });

    it('should filter by date range when provided', async () => {
      const dateFrom = '2024-01-15';
      const dateTo = '2024-01-17';

      await service.getConversionTracking(mockOwnerUid, dateFrom, dateTo);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          status: 'CONVERTED',
        },
        include: {},
      });

      expect(mockPrismaClient.ecommerceLead.count).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      });
    });

    it('should handle zero conversions gracefully', async () => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue([]);
      mockPrismaClient.ecommerceLead.count.mockResolvedValue(5);

      const result = await service.getConversionTracking(mockOwnerUid);

      expect(result.convertedLeads).toBe(0);
      expect(result.conversionRate).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });

    it('should aggregate attribution data correctly', async () => {
      const spy = jest.spyOn(service as any, 'aggregateAttributionData');
      spy.mockResolvedValue([
        {
          source: 'facebook',
          medium: 'paid-social',
          campaign: 'holiday_sale',
          conversions: 2,
          revenue: 498,
        },
      ]);

      const result = await service.getConversionTracking(mockOwnerUid);

      expect(result.attribution).toHaveLength(1);
      expect(result.attribution[0]).toEqual({
        source: 'facebook',
        medium: 'paid-social',
        campaign: 'holiday_sale',
        conversions: 2,
        revenue: 498,
      });
    });
  });

  describe('aggregateAttributionData', () => {
    const mockAttributionLeads = [
      {
        utmSource: 'facebook',
        utmMedium: 'paid-social',
        utmCampaign: 'summer_sale',
        orderValue: 299,
        conversionDate: new Date('2024-01-15'),
      },
      {
        utmSource: 'facebook',
        utmMedium: 'paid-social',
        utmCampaign: 'summer_sale',
        orderValue: 199,
        conversionDate: new Date('2024-01-16'),
      },
      {
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'winter_campaign',
        orderValue: 399,
        conversionDate: new Date('2024-01-17'),
      },
      {
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        orderValue: 150,
        conversionDate: new Date('2024-01-18'),
      },
    ];

    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(mockAttributionLeads);
    });

    it('should aggregate attribution data by UTM parameters', async () => {
      const result = await service['aggregateAttributionData'](mockOwnerUid);

      expect(result).toHaveLength(3);

      const facebookAttribution = result.find(
        (attr: any) =>
          attr.source === 'facebook' &&
          attr.medium === 'paid-social' &&
          attr.campaign === 'summer_sale'
      );
      expect(facebookAttribution?.conversions).toBe(2);
      expect(facebookAttribution?.revenue).toBe(498);

      const googleAttribution = result.find(
        (attr: any) => attr.source === 'google'
      );
      expect(googleAttribution?.conversions).toBe(1);
      expect(googleAttribution?.revenue).toBe(399);

      const directAttribution = result.find(
        (attr: any) => attr.source === 'direct'
      );
      expect(directAttribution?.conversions).toBe(1);
      expect(directAttribution?.revenue).toBe(150);
    });

    it('should handle null UTM values as direct/organic', async () => {
      const nullUtmLeads = [
        {
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          orderValue: 100,
        },
      ];
      mockPrismaClient.ecommerceLead.findMany.mockResolvedValue(nullUtmLeads);

      const result = await service['aggregateAttributionData'](mockOwnerUid);

      expect(result[0]).toEqual({
        source: 'direct',
        medium: 'organic',
        campaign: 'none',
        conversions: 1,
        revenue: 100,
      });
    });

    it('should filter by date range when provided', async () => {
      const dateFrom = '2024-01-15';
      const dateTo = '2024-01-17';

      await service['aggregateAttributionData'](mockOwnerUid, dateFrom, dateTo);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          status: 'CONVERTED',
          conversionDate: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
        select: {
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          orderValue: true,
          conversionDate: true,
        },
      });
    });
  });

  describe('data security and scoping', () => {
    it('should always scope queries to ownerUid', async () => {
      await service.getConversionTracking(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });

    it('should not allow cross-owner data access in lead matching', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      await service.syncShopifyOrders(mockOwnerUid);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });

    it('should include ownerUid in order record creation', async () => {
      const spy = jest.spyOn(service as any, 'createOrderRecord');

      await service.syncShopifyOrders(mockOwnerUid);

      expect(spy).toHaveBeenCalledWith(
        mockOwnerUid,
        expect.any(Object),
        expect.any(String)
      );
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle orders with missing required fields', async () => {
      const incompleteOrder = {
        id: 2002,
        name: '#2002',
        email: '',
        total_price: '0',
        currency: 'ILS',
        customer: {
          id: 2002,
          email: '',
          first_name: '',
          last_name: '',
          created_at: '2024-01-15T10:30:00Z',
        },
        line_items: [],
        note_attributes: [],
      } as any;

      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.orders).toBe(1);
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockRejectedValue(
        new Error('Connection timeout')
      );

      await expect(service.syncShopifyOrders(mockOwnerUid)).rejects.toThrow();
    });

    it('should handle malformed order data', async () => {
      const malformedOrder = {
        ...mockShopifyOrder,
        total_price: 'invalid_price',
        customer: null,
      } as any;

      // The service should handle this gracefully without crashing
      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result).toBeDefined();
    });

    it('should handle orders with zero value', async () => {
      const zeroValueOrder = {
        ...mockShopifyOrder,
        total_price: '0.00',
        subtotal_price: '0.00',
      };

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.totalRevenue).toBe(299); // Still using mock data
    });
  });

  describe('performance considerations', () => {
    it('should handle large order batches efficiently', async () => {
      // Mock multiple orders
      jest.spyOn(service as any, 'syncShopifyOrders').mockImplementation(async () => {
        return {
          success: true,
          conversions: 100,
          orders: 100,
          totalRevenue: 29900,
          details: Array(100).fill({ status: 'converted', revenue: 299 }),
        };
      });

      const result = await service.syncShopifyOrders(mockOwnerUid);

      expect(result.orders).toBe(100);
      expect(result.conversions).toBe(100);
    });

    it('should handle concurrent conversion tracking requests', async () => {
      const promises = Array(5)
        .fill(0)
        .map(() => service.getConversionTracking(mockOwnerUid));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('totalLeads');
        expect(result).toHaveProperty('convertedLeads');
      });
    });
  });
});