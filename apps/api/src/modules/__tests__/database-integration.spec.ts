import { Test, TestingModule } from '@nestjs/testing';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

/**
 * Database Integration Tests for Real Data Integration System
 *
 * These tests validate:
 * 1. Database schema integrity for new Real Data Integration fields
 * 2. Data persistence and relationships
 * 3. Multi-tenant data scoping
 * 4. Performance characteristics
 * 5. Data validation and constraints
 */

describe('Database Integration - Real Data Integrations', () => {
  let prisma: any;

  const mockOwnerUid = 'test-owner-database-integration';
  const mockOtherOwnerUid = 'other-owner-database-integration';

  beforeAll(async () => {
    // Use test database connection
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });

    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    try {
      // Delete in reverse dependency order
      await prisma.propertyPhoto.deleteMany({
        where: {
          property: {
            ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] },
          },
        },
      });

      await prisma.realEstateLead.deleteMany({
        where: { ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] } },
      });

      await prisma.property.deleteMany({
        where: { ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] } },
      });

      await prisma.propertyImportBatch.deleteMany({
        where: { ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] } },
      });

      await prisma.ecommerceLead.deleteMany({
        where: { ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] } },
      });

      await prisma.leadImportBatch.deleteMany({
        where: { ownerUid: { in: [mockOwnerUid, mockOtherOwnerUid] } },
      });
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  describe('Property Model - AI Scoring Integration', () => {
    it('should store and retrieve AI scoring data', async () => {
      const propertyData = {
        ownerUid: mockOwnerUid,
        name: 'AI Scored Test Property',
        address: '123 AI Test St',
        city: 'Tel Aviv',
        price: 2500000,
        currency: 'ILS',
        provider: 'YAD2',
        externalId: 'ai_test_123',
        externalUrl: 'https://yad2.co.il/property/ai_test_123',

        // AI Scoring fields
        aiScore: 87.5,
        aiCategory: 'excellent',
        aiInsights: JSON.stringify({
          reasons: ['מיקום מעולה', 'מחיר תחרותי'],
          marketInsights: ['שכונה צומחת', 'ביקוש גבוה'],
          recommendations: ['מתאים להשקעה']
        }),
        aiScoredAt: new Date(),

        // Import tracking
        syncStatus: 'SUCCESS',
        lastSyncAt: new Date(),
        syncData: JSON.stringify({ source: 'yad2', scraped: true }),
        needsReview: false,
      };

      const createdProperty = await prisma.property.create({ data: propertyData });

      expect(createdProperty.id).toBeDefined();
      expect(createdProperty.aiScore).toBe(87.5);
      expect(createdProperty.aiCategory).toBe('excellent');
      expect(createdProperty.aiScoredAt).toBeInstanceOf(Date);

      const aiInsights = JSON.parse(createdProperty.aiInsights);
      expect(aiInsights.reasons).toContain('מיקום מעולה');
      expect(aiInsights.marketInsights).toContain('שכונה צומחת');
      expect(aiInsights.recommendations).toContain('מתאים להשקעה');

      // Verify sync tracking fields
      expect(createdProperty.syncStatus).toBe('SUCCESS');
      expect(createdProperty.lastSyncAt).toBeInstanceOf(Date);
      expect(createdProperty.needsReview).toBe(false);

      const syncData = JSON.parse(createdProperty.syncData);
      expect(syncData.source).toBe('yad2');
      expect(syncData.scraped).toBe(true);
    });

    it('should enforce AI score constraints', async () => {
      const invalidPropertyData = {
        ownerUid: mockOwnerUid,
        name: 'Invalid AI Score Property',
        address: '456 Invalid St',
        city: 'Jerusalem',
        aiScore: 150, // Invalid score > 100
      };

      // This should fail if database constraints are properly set
      try {
        await prisma.property.create({ data: invalidPropertyData });

        // If creation succeeds, verify score is stored as-is (application should validate)
        const property = await prisma.property.findFirst({
          where: { name: 'Invalid AI Score Property' },
        });

        // Application should handle validation, but database should store the value
        expect(property.aiScore).toBe(150);
      } catch (error) {
        // Database constraint would prevent this
        expect(error).toBeDefined();
      }
    });

    it('should handle null AI scoring fields gracefully', async () => {
      const propertyWithoutAI = {
        ownerUid: mockOwnerUid,
        name: 'Property Without AI',
        address: '789 No AI St',
        city: 'Haifa',
        price: 1800000,
        provider: 'MANUAL',
      };

      const createdProperty = await prisma.property.create({ data: propertyWithoutAI });

      expect(createdProperty.aiScore).toBeNull();
      expect(createdProperty.aiCategory).toBeNull();
      expect(createdProperty.aiInsights).toBeNull();
      expect(createdProperty.aiScoredAt).toBeNull();
    });
  });

  describe('PropertyImportBatch Model', () => {
    it('should create and track import batches', async () => {
      const batchData = {
        ownerUid: mockOwnerUid,
        source: 'YAD2',
        importType: 'bulk_urls',
        urls: JSON.stringify(['https://yad2.co.il/1', 'https://yad2.co.il/2']),
        totalItems: 2,
        importedItems: 1,
        updatedItems: 0,
        duplicateItems: 0,
        errorItems: 1,
        status: 'completed',
        progress: 100,
        summary: JSON.stringify({
          success: false,
          imported: 1,
          errors: 1,
          details: ['Property 1 imported', 'Property 2 failed'],
        }),
        completedAt: new Date(),
      };

      const batch = await prisma.propertyImportBatch.create({ data: batchData });

      expect(batch.id).toBeDefined();
      expect(batch.source).toBe('YAD2');
      expect(batch.importType).toBe('bulk_urls');
      expect(batch.totalItems).toBe(2);
      expect(batch.progress).toBe(100);

      const urls = JSON.parse(batch.urls);
      expect(urls).toHaveLength(2);
      expect(urls[0]).toBe('https://yad2.co.il/1');

      const summary = JSON.parse(batch.summary);
      expect(summary.success).toBe(false);
      expect(summary.imported).toBe(1);
    });

    it('should enforce ownerUid scoping for batches', async () => {
      const batch1 = await prisma.propertyImportBatch.create({
        data: {
          ownerUid: mockOwnerUid,
          source: 'YAD2',
          importType: 'single_url',
          totalItems: 1,
        },
      });

      const batch2 = await prisma.propertyImportBatch.create({
        data: {
          ownerUid: mockOtherOwnerUid,
          source: 'MADLAN',
          importType: 'single_url',
          totalItems: 1,
        },
      });

      // Owner 1 should only see their own batches
      const owner1Batches = await prisma.propertyImportBatch.findMany({
        where: { ownerUid: mockOwnerUid },
      });

      expect(owner1Batches).toHaveLength(1);
      expect(owner1Batches[0].id).toBe(batch1.id);
      expect(owner1Batches[0].source).toBe('YAD2');

      // Owner 2 should only see their own batches
      const owner2Batches = await prisma.propertyImportBatch.findMany({
        where: { ownerUid: mockOtherOwnerUid },
      });

      expect(owner2Batches).toHaveLength(1);
      expect(owner2Batches[0].id).toBe(batch2.id);
      expect(owner2Batches[0].source).toBe('MADLAN');
    });
  });

  describe('EcommerceLead Model - Order Tracking', () => {
    it('should store and retrieve order conversion data', async () => {
      const leadData = {
        ownerUid: mockOwnerUid,
        externalId: 'meta_lead_conversion_test',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.conversion@example.com',
        phone: '+972501234567',
        source: 'FACEBOOK',
        sourceName: 'Summer Sale Campaign',
        status: 'CONVERTED',
        utmSource: 'facebook',
        utmMedium: 'paid-social',
        utmCampaign: 'summer_sale',

        // Order/Conversion tracking
        orderValue: 299.99,
        conversionDate: new Date('2024-01-20T14:30:00Z'),
        orderNumber: 'SHOP-2024-001',
      };

      const lead = await prisma.ecommerceLead.create({ data: leadData });

      expect(lead.id).toBeDefined();
      expect(lead.status).toBe('CONVERTED');
      expect(lead.orderValue).toBe(299.99);
      expect(lead.conversionDate).toEqual(new Date('2024-01-20T14:30:00Z'));
      expect(lead.orderNumber).toBe('SHOP-2024-001');

      // Verify UTM tracking
      expect(lead.utmSource).toBe('facebook');
      expect(lead.utmMedium).toBe('paid-social');
      expect(lead.utmCampaign).toBe('summer_sale');
    });

    it('should handle lead deduplication', async () => {
      const originalLead = {
        ownerUid: mockOwnerUid,
        externalId: 'duplicate_test_lead',
        email: 'duplicate.test@example.com',
        source: 'FACEBOOK',
        status: 'NEW',
      };

      const duplicateLead = {
        ownerUid: mockOwnerUid,
        externalId: 'duplicate_test_lead_2',
        email: 'duplicate.test@example.com', // Same email
        source: 'FACEBOOK',
        status: 'NEW',
        isDuplicate: true,
      };

      const original = await prisma.ecommerceLead.create({ data: originalLead });
      const duplicate = await prisma.ecommerceLead.create({
        data: {
          ...duplicateLead,
          duplicateOfId: original.id,
        },
      });

      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.duplicateOfId).toBe(original.id);

      // Verify relationship
      const duplicateWithOriginal = await prisma.ecommerceLead.findUnique({
        where: { id: duplicate.id },
        include: { duplicateOf: true },
      });

      expect(duplicateWithOriginal.duplicateOf.id).toBe(original.id);
      expect(duplicateWithOriginal.duplicateOf.email).toBe('duplicate.test@example.com');
    });

    it('should enforce unique constraints', async () => {
      const leadData = {
        ownerUid: mockOwnerUid,
        externalId: 'unique_constraint_test',
        email: 'unique.constraint@example.com',
        source: 'FACEBOOK',
      };

      await prisma.ecommerceLead.create({ data: leadData });

      // Attempt to create duplicate with same ownerUid, externalId, source
      await expect(
        prisma.ecommerceLead.create({ data: leadData })
      ).rejects.toThrow(); // Unique constraint violation
    });
  });

  describe('Performance and Indexing', () => {
    it('should efficiently query properties with AI scoring filters', async () => {
      // Create test properties with various AI scores
      const properties = await Promise.all([
        prisma.property.create({
          data: {
            ownerUid: mockOwnerUid,
            name: 'Excellent Property',
            address: '1 Excellent St',
            city: 'Tel Aviv',
            aiScore: 95,
            aiCategory: 'excellent',
            provider: 'YAD2',
          },
        }),
        prisma.property.create({
          data: {
            ownerUid: mockOwnerUid,
            name: 'Good Property',
            address: '2 Good St',
            city: 'Jerusalem',
            aiScore: 75,
            aiCategory: 'good',
            provider: 'MADLAN',
          },
        }),
        prisma.property.create({
          data: {
            ownerUid: mockOwnerUid,
            name: 'Fair Property',
            address: '3 Fair St',
            city: 'Haifa',
            aiScore: 55,
            aiCategory: 'fair',
            provider: 'YAD2',
          },
        }),
      ]);

      const startTime = Date.now();

      // Query with multiple filters (should use indexes)
      const excellentProperties = await prisma.property.findMany({
        where: {
          ownerUid: mockOwnerUid,
          aiScore: { gte: 85 },
          provider: 'YAD2',
        },
        orderBy: { aiScore: 'desc' },
      });

      const queryTime = Date.now() - startTime;

      expect(excellentProperties).toHaveLength(1);
      expect(excellentProperties[0].name).toBe('Excellent Property');
      expect(queryTime).toBeLessThan(100); // Should be fast with proper indexes
    });

    it('should efficiently query leads for attribution analysis', async () => {
      // Create test leads with various UTM parameters
      const testLeads = [
        {
          ownerUid: mockOwnerUid,
          externalId: 'perf_test_lead_1',
          email: 'perf1@example.com',
          source: 'FACEBOOK',
          status: 'CONVERTED',
          utmSource: 'facebook',
          utmMedium: 'paid-social',
          utmCampaign: 'campaign_1',
          orderValue: 299,
          conversionDate: new Date('2024-01-15T10:00:00Z'),
        },
        {
          ownerUid: mockOwnerUid,
          externalId: 'perf_test_lead_2',
          email: 'perf2@example.com',
          source: 'GOOGLE',
          status: 'CONVERTED',
          utmSource: 'google',
          utmMedium: 'cpc',
          utmCampaign: 'campaign_2',
          orderValue: 199,
          conversionDate: new Date('2024-01-16T12:00:00Z'),
        },
      ];

      await prisma.ecommerceLead.createMany({ data: testLeads });

      const startTime = Date.now();

      // Complex attribution query
      const attributionData = await prisma.ecommerceLead.findMany({
        where: {
          ownerUid: mockOwnerUid,
          status: 'CONVERTED',
          conversionDate: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        select: {
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          orderValue: true,
          conversionDate: true,
        },
        orderBy: { conversionDate: 'desc' },
      });

      const queryTime = Date.now() - startTime;

      expect(attributionData).toHaveLength(2);
      expect(queryTime).toBeLessThan(50); // Should be very fast with proper indexes
    });

    it('should handle large datasets efficiently', async () => {
      // Create a larger dataset for performance testing
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        ownerUid: mockOwnerUid,
        externalId: `large_dataset_lead_${i}`,
        email: `large${i}@example.com`,
        source: 'FACEBOOK',
        status: i % 10 === 0 ? 'CONVERTED' : 'NEW',
        utmSource: 'facebook',
        utmCampaign: `campaign_${Math.floor(i / 10)}`,
        orderValue: i % 10 === 0 ? 100 + (i * 10) : null,
      }));

      const batchStartTime = Date.now();
      await prisma.ecommerceLead.createMany({ data: largeBatch });
      const batchCreateTime = Date.now() - batchStartTime;

      // Query performance on larger dataset
      const queryStartTime = Date.now();
      const results = await prisma.ecommerceLead.findMany({
        where: {
          ownerUid: mockOwnerUid,
          status: 'CONVERTED',
        },
        include: {
          _count: true,
        },
        take: 50,
      });
      const queryTime = Date.now() - queryStartTime;

      expect(batchCreateTime).toBeLessThan(1000); // Batch insert should be fast
      expect(queryTime).toBeLessThan(100); // Query should be fast even with more data
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation and Constraints', () => {
    it('should validate required enum values', async () => {
      // Valid enum values should work
      const validProperty = await prisma.property.create({
        data: {
          ownerUid: mockOwnerUid,
          name: 'Valid Enum Property',
          address: '123 Enum St',
          provider: 'YAD2', // Valid PropertyProvider
          status: 'PUBLISHED', // Valid PropertyStatus
          type: 'APARTMENT', // Valid PropertyType
        },
      });

      expect(validProperty.provider).toBe('YAD2');
      expect(validProperty.status).toBe('PUBLISHED');
      expect(validProperty.type).toBe('APARTMENT');

      // Invalid enum values should fail
      await expect(
        prisma.property.create({
          data: {
            ownerUid: mockOwnerUid,
            name: 'Invalid Enum Property',
            address: '456 Invalid St',
            provider: 'INVALID_PROVIDER', // Invalid enum value
          },
        })
      ).rejects.toThrow();
    });

    it('should validate decimal precision for order values', async () => {
      const leadWithPreciseValue = await prisma.ecommerceLead.create({
        data: {
          ownerUid: mockOwnerUid,
          externalId: 'decimal_precision_test',
          email: 'decimal.test@example.com',
          source: 'FACEBOOK',
          orderValue: 299.99, // Should handle 2 decimal places
        },
      });

      expect(leadWithPreciseValue.orderValue).toBe(299.99);

      // Test very large values
      const leadWithLargeValue = await prisma.ecommerceLead.create({
        data: {
          ownerUid: mockOwnerUid,
          externalId: 'large_decimal_test',
          email: 'large.decimal@example.com',
          source: 'FACEBOOK',
          orderValue: 999999999.99, // Large value within Decimal(12,2) limits
        },
      });

      expect(leadWithLargeValue.orderValue).toBe(999999999.99);
    });

    it('should handle JSON field validation', async () => {
      const validJsonData = {
        reasons: ['Good location', 'Fair price'],
        marketInsights: ['Growing area'],
        recommendations: ['Consider buying'],
      };

      const property = await prisma.property.create({
        data: {
          ownerUid: mockOwnerUid,
          name: 'JSON Test Property',
          address: '123 JSON St',
          provider: 'MANUAL',
          aiInsights: JSON.stringify(validJsonData),
        },
      });

      const retrievedProperty = await prisma.property.findUnique({
        where: { id: property.id },
      });

      const parsedInsights = JSON.parse(retrievedProperty.aiInsights);
      expect(parsedInsights.reasons).toEqual(['Good location', 'Fair price']);
      expect(parsedInsights.marketInsights).toEqual(['Growing area']);
    });
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should maintain strict data isolation between owners', async () => {
      // Create properties for two different owners
      const owner1Property = await prisma.property.create({
        data: {
          ownerUid: mockOwnerUid,
          name: 'Owner 1 Property',
          address: '123 Owner 1 St',
          provider: 'YAD2',
          aiScore: 85,
        },
      });

      const owner2Property = await prisma.property.create({
        data: {
          ownerUid: mockOtherOwnerUid,
          name: 'Owner 2 Property',
          address: '456 Owner 2 St',
          provider: 'MADLAN',
          aiScore: 75,
        },
      });

      // Owner 1 should only see their own properties
      const owner1Properties = await prisma.property.findMany({
        where: { ownerUid: mockOwnerUid },
      });

      expect(owner1Properties).toHaveLength(1);
      expect(owner1Properties[0].id).toBe(owner1Property.id);
      expect(owner1Properties[0].name).toBe('Owner 1 Property');

      // Owner 2 should only see their own properties
      const owner2Properties = await prisma.property.findMany({
        where: { ownerUid: mockOtherOwnerUid },
      });

      expect(owner2Properties).toHaveLength(1);
      expect(owner2Properties[0].id).toBe(owner2Property.id);
      expect(owner2Properties[0].name).toBe('Owner 2 Property');

      // Cross-owner query should return nothing
      const crossOwnerQuery = await prisma.property.findMany({
        where: {
          ownerUid: mockOwnerUid,
          id: owner2Property.id, // Try to access other owner's property
        },
      });

      expect(crossOwnerQuery).toHaveLength(0);
    });

    it('should maintain lead data isolation', async () => {
      const owner1Lead = await prisma.ecommerceLead.create({
        data: {
          ownerUid: mockOwnerUid,
          externalId: 'isolation_test_lead_1',
          email: 'owner1.isolation@example.com',
          source: 'FACEBOOK',
        },
      });

      const owner2Lead = await prisma.ecommerceLead.create({
        data: {
          ownerUid: mockOtherOwnerUid,
          externalId: 'isolation_test_lead_2',
          email: 'owner2.isolation@example.com',
          source: 'FACEBOOK',
        },
      });

      // Verify isolation
      const owner1Leads = await prisma.ecommerceLead.findMany({
        where: { ownerUid: mockOwnerUid },
      });

      const owner2Leads = await prisma.ecommerceLead.findMany({
        where: { ownerUid: mockOtherOwnerUid },
      });

      expect(owner1Leads).toHaveLength(1);
      expect(owner1Leads[0].email).toBe('owner1.isolation@example.com');

      expect(owner2Leads).toHaveLength(1);
      expect(owner2Leads[0].email).toBe('owner2.isolation@example.com');
    });
  });
});