import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PropertyImportService, ImportResult } from './property-import.service';
import { PropertyScrapingService } from './property-scraping.service';
import { AiService } from '../ai/ai.service';

// Mock Prisma Client
const mockPrismaClient = {
  propertyImportBatch: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  property: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  propertyPhoto: {
    createMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

// Mock services
const mockScrapingService = {
  scrapeProperty: jest.fn(),
};

const mockAiService = {
  scoreProperty: jest.fn(),
};

describe('PropertyImportService', () => {
  let service: PropertyImportService;
  let scrapingService: PropertyScrapingService;
  let aiService: AiService;

  const mockOwnerUid = 'test-owner-uid';
  const mockUrl = 'https://yad2.co.il/property/123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyImportService,
        {
          provide: PropertyScrapingService,
          useValue: mockScrapingService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<PropertyImportService>(PropertyImportService);
    scrapingService = module.get<PropertyScrapingService>(PropertyScrapingService);
    aiService = module.get<AiService>(AiService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('importSingleProperty', () => {
    const mockScrapedProperty = {
      externalId: 'yad2_123',
      provider: 'YAD2',
      name: 'Test Property',
      address: '123 Test St',
      city: 'Tel Aviv',
      price: 1500000,
      currency: 'ILS',
      rooms: 3,
      size: 80,
      photos: ['https://example.com/photo1.jpg'],
      rawData: { test: 'data' },
    };

    const mockProperty = {
      id: 'property-id-123',
      ...mockScrapedProperty,
      ownerUid: mockOwnerUid,
    };

    const mockAiScore = {
      score: 85,
      category: 'excellent',
      reasons: ['Great location', 'Good price'],
      marketInsights: ['Growing area'],
      recommendations: ['Consider investment'],
    };

    beforeEach(() => {
      mockPrismaClient.propertyImportBatch.create.mockResolvedValue({
        id: 'batch-123',
      });
      mockPrismaClient.propertyImportBatch.update.mockResolvedValue({});
      mockScrapingService.scrapeProperty.mockResolvedValue(mockScrapedProperty);
      mockPrismaClient.property.findFirst.mockResolvedValue(null);
      mockPrismaClient.property.create.mockResolvedValue(mockProperty);
      mockPrismaClient.propertyPhoto.createMany.mockResolvedValue({});
      mockAiService.scoreProperty.mockResolvedValue(mockAiScore);
    });

    it('should successfully import a single property', async () => {
      const result = await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.details).toHaveLength(1);
      expect(result.details[0].status).toBe('imported');
    });

    it('should update existing property if found', async () => {
      const existingProperty = { id: 'existing-123', ...mockProperty };
      mockPrismaClient.property.findFirst.mockResolvedValue(existingProperty);
      mockPrismaClient.property.update.mockResolvedValue(existingProperty);

      const result = await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.details[0].status).toBe('updated');
    });

    it('should handle scraping errors gracefully', async () => {
      mockScrapingService.scrapeProperty.mockRejectedValue(new Error('Scraping failed'));

      const result = await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(result.success).toBe(false);
      expect(result.errors).toBe(1);
      expect(result.details[0].status).toBe('error');
      expect(result.details[0].message).toBe('Scraping failed');
    });

    it('should handle AI scoring errors gracefully and continue import', async () => {
      mockAiService.scoreProperty.mockRejectedValue(new Error('AI service unavailable'));

      const result = await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      // Property should still be created even if AI scoring fails
      expect(mockPrismaClient.property.create).toHaveBeenCalled();
    });

    it('should create property photos if available', async () => {
      await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(mockPrismaClient.propertyPhoto.createMany).toHaveBeenCalledWith({
        data: [
          {
            propertyId: mockProperty.id,
            url: 'https://example.com/photo1.jpg',
            sortIndex: 0,
          },
        ],
      });
    });

    it('should detect property provider correctly', async () => {
      const madlanUrl = 'https://madlan.co.il/property/456';
      await service.importSingleProperty(mockOwnerUid, madlanUrl);

      expect(mockPrismaClient.propertyImportBatch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            source: 'MADLAN',
          }),
        })
      );
    });

    it('should validate required URL parameter', async () => {
      await expect(service.importSingleProperty(mockOwnerUid, '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('importBulkProperties', () => {
    const mockUrls = [
      'https://yad2.co.il/property/123',
      'https://yad2.co.il/property/456',
    ];

    const mockCsvData = [
      {
        name: 'CSV Property 1',
        address: '456 CSV St',
        price: '2000000',
        rooms: '4',
      },
      {
        name: 'CSV Property 2',
        address: '789 CSV Ave',
        price: '2500000',
        rooms: '5',
      },
    ];

    beforeEach(() => {
      mockPrismaClient.propertyImportBatch.create.mockResolvedValue({
        id: 'bulk-batch-123',
      });
      mockPrismaClient.propertyImportBatch.update.mockResolvedValue({});
      mockScrapingService.scrapeProperty.mockResolvedValue({
        externalId: 'test',
        provider: 'YAD2',
        name: 'Test Property',
        rawData: {},
      });
      mockPrismaClient.property.findFirst.mockResolvedValue(null);
      mockPrismaClient.property.create.mockResolvedValue({ id: 'new-property' });
    });

    it('should import multiple URLs successfully', async () => {
      const result = await service.importBulkProperties(mockOwnerUid, { urls: mockUrls });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(mockScrapingService.scrapeProperty).toHaveBeenCalledTimes(2);
    });

    it('should import CSV data successfully', async () => {
      const result = await service.importBulkProperties(mockOwnerUid, { csvData: mockCsvData });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(mockPrismaClient.property.create).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed URLs and CSV data', async () => {
      const result = await service.importBulkProperties(mockOwnerUid, {
        urls: mockUrls.slice(0, 1),
        csvData: mockCsvData.slice(0, 1),
      });

      expect(result.imported).toBe(2);
    });

    it('should skip duplicates when updateExisting is false', async () => {
      const existingProperty = { id: 'existing' };
      mockPrismaClient.property.findFirst.mockResolvedValue(existingProperty);

      const result = await service.importBulkProperties(mockOwnerUid, {
        urls: mockUrls,
        updateExisting: false,
      });

      expect(result.duplicates).toBe(2);
      expect(result.imported).toBe(0);
    });

    it('should update existing properties when updateExisting is true', async () => {
      const existingProperty = { id: 'existing' };
      mockPrismaClient.property.findFirst.mockResolvedValue(existingProperty);
      mockPrismaClient.property.update.mockResolvedValue(existingProperty);

      const result = await service.importBulkProperties(mockOwnerUid, {
        urls: mockUrls,
        updateExisting: true,
      });

      expect(result.updated).toBe(2);
      expect(result.imported).toBe(0);
    });

    it('should track progress during bulk import', async () => {
      await service.importBulkProperties(mockOwnerUid, { urls: mockUrls });

      expect(mockPrismaClient.propertyImportBatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progress: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('getImportBatches', () => {
    it('should return import batches for owner', async () => {
      const mockBatches = [
        { id: 'batch1', status: 'completed' },
        { id: 'batch2', status: 'processing' },
      ];
      mockPrismaClient.propertyImportBatch.findMany.mockResolvedValue(mockBatches);

      const result = await service.getImportBatches(mockOwnerUid);

      expect(result).toEqual(mockBatches);
      expect(mockPrismaClient.propertyImportBatch.findMany).toHaveBeenCalledWith({
        where: { ownerUid: mockOwnerUid },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('should respect custom limit parameter', async () => {
      mockPrismaClient.propertyImportBatch.findMany.mockResolvedValue([]);

      await service.getImportBatches(mockOwnerUid, 50);

      expect(mockPrismaClient.propertyImportBatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });
  });

  describe('data security and scoping', () => {
    it('should always scope queries to ownerUid', async () => {
      await service.getImportBatches(mockOwnerUid);

      expect(mockPrismaClient.propertyImportBatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });

    it('should not allow cross-owner data access', async () => {
      const otherOwnerBatch = { id: 'other-batch', ownerUid: 'other-owner' };
      mockPrismaClient.propertyImportBatch.findFirst.mockResolvedValue(null);

      const result = await service.getImportBatch(mockOwnerUid, 'other-batch');

      expect(result).toBeNull();
      expect(mockPrismaClient.propertyImportBatch.findFirst).toHaveBeenCalledWith({
        where: { id: 'other-batch', ownerUid: mockOwnerUid },
      });
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockPrismaClient.propertyImportBatch.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        service.importSingleProperty(mockOwnerUid, mockUrl)
      ).rejects.toThrow('Import failed: Database connection failed');
    });

    it('should handle invalid property data gracefully', async () => {
      mockScrapingService.scrapeProperty.mockResolvedValue({
        // Missing required fields
        externalId: null,
        provider: 'UNKNOWN',
      });

      const result = await service.importSingleProperty(mockOwnerUid, mockUrl);

      expect(result.success).toBe(false);
      expect(result.errors).toBe(1);
    });
  });

  describe('performance considerations', () => {
    it('should handle large bulk imports efficiently', async () => {
      const largeUrlList = Array(100).fill(0).map((_, i) => `https://yad2.co.il/property/${i}`);

      mockScrapingService.scrapeProperty.mockResolvedValue({
        externalId: 'test',
        provider: 'YAD2',
        name: 'Test Property',
        rawData: {},
      });
      mockPrismaClient.property.create.mockResolvedValue({ id: 'test-property' });

      const result = await service.importBulkProperties(mockOwnerUid, { urls: largeUrlList });

      expect(result.imported).toBe(100);
      expect(mockScrapingService.scrapeProperty).toHaveBeenCalledTimes(100);
    });
  });
});