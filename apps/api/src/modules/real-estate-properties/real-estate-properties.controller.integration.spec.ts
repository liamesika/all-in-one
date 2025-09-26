import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RealEstatePropertiesController } from './real-estate-properties.controller';
import { RealEstatePropertiesService } from './real-estate-properties.service';
import { PropertyImportService } from './property-import.service';

// Mock services
const mockPropertiesService = {
  list: jest.fn(),
  get: jest.fn(),
  getBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  hardDelete: jest.fn(),
  uploadAndAttachPhotos: jest.fn(),
};

const mockImportService = {
  importSingleProperty: jest.fn(),
  importBulkProperties: jest.fn(),
  getImportBatches: jest.fn(),
  getImportBatch: jest.fn(),
};

// Mock OrgGuard
const mockOrgGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('RealEstatePropertiesController (Integration)', () => {
  let app: INestApplication;
  let propertiesService: RealEstatePropertiesService;
  let importService: PropertyImportService;

  const mockOwnerUid = 'test-owner-uid';
  const mockProperty = {
    id: 'property-123',
    name: 'Test Property',
    address: '123 Test St',
    city: 'Tel Aviv',
    price: 1500000,
    currency: 'ILS',
    status: 'PUBLISHED',
    provider: 'YAD2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealEstatePropertiesController],
      providers: [
        {
          provide: RealEstatePropertiesService,
          useValue: mockPropertiesService,
        },
        {
          provide: PropertyImportService,
          useValue: mockImportService,
        },
      ],
    })
      .overrideGuard(require('../../auth/org.guard').OrgGuard)
      .useValue(mockOrgGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    propertiesService = module.get<RealEstatePropertiesService>(RealEstatePropertiesService);
    importService = module.get<PropertyImportService>(PropertyImportService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/real-estate/properties', () => {
    it('should return list of properties with query parameters', async () => {
      const mockProperties = {
        properties: [mockProperty],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockPropertiesService.list.mockResolvedValue(mockProperties);

      const response = await request(app.getHttpServer())
        .get('/real-estate/properties')
        .query({
          q: 'test',
          status: 'PUBLISHED',
          provider: 'YAD2',
          limit: '10',
          page: '1',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        .expect(200);

      expect(response.body).toEqual(mockProperties);
      expect(mockPropertiesService.list).toHaveBeenCalledWith(
        'demo', // Default ownerUid in mock
        {
          q: 'test',
          status: 'PUBLISHED',
          provider: 'YAD2',
          limit: 10,
          page: 1,
          offset: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      );
    });

    it('should handle search with no results', async () => {
      mockPropertiesService.list.mockResolvedValue({
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer())
        .get('/real-estate/properties')
        .query({ q: 'nonexistent' })
        .expect(200);

      expect(response.body.properties).toHaveLength(0);
    });

    it('should use default values for missing parameters', async () => {
      mockPropertiesService.list.mockResolvedValue({ properties: [], total: 0 });

      await request(app.getHttpServer())
        .get('/real-estate/properties')
        .expect(200);

      expect(mockPropertiesService.list).toHaveBeenCalledWith(
        'demo',
        {
          q: undefined,
          status: undefined,
          provider: undefined,
          limit: undefined,
          page: undefined,
          offset: undefined,
          sortBy: undefined,
          sortOrder: undefined,
        }
      );
    });
  });

  describe('GET /api/real-estate/properties/:id', () => {
    it('should return a specific property', async () => {
      mockPropertiesService.get.mockResolvedValue(mockProperty);

      const response = await request(app.getHttpServer())
        .get('/real-estate/properties/property-123')
        .expect(200);

      expect(response.body).toEqual(mockProperty);
      expect(mockPropertiesService.get).toHaveBeenCalledWith('demo', 'property-123');
    });

    it('should handle non-existent property', async () => {
      mockPropertiesService.get.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/real-estate/properties/nonexistent')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('GET /api/real-estate/properties/public/:slug', () => {
    it('should return property by slug without authentication', async () => {
      const mockPublicProperty = { ...mockProperty, slug: 'test-property' };
      mockPropertiesService.getBySlug.mockResolvedValue(mockPublicProperty);

      const response = await request(app.getHttpServer())
        .get('/real-estate/properties/public/test-property')
        .expect(200);

      expect(response.body).toEqual(mockPublicProperty);
      expect(mockPropertiesService.getBySlug).toHaveBeenCalledWith('test-property');
    });
  });

  describe('POST /api/real-estate/properties', () => {
    const createPropertyDto = {
      name: 'New Property',
      address: '456 New St',
      city: 'Jerusalem',
      price: 2000000,
      currency: 'ILS',
    };

    it('should create a new property', async () => {
      const newProperty = { id: 'new-property-456', ...createPropertyDto };
      mockPropertiesService.create.mockResolvedValue(newProperty);

      const response = await request(app.getHttpServer())
        .post('/real-estate/properties')
        .send(createPropertyDto)
        .expect(201);

      expect(response.body).toEqual(newProperty);
      expect(mockPropertiesService.create).toHaveBeenCalledWith('demo', createPropertyDto);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/real-estate/properties')
        .send({}) // Empty body
        .expect(400);
    });
  });

  describe('PATCH /api/real-estate/properties/:id', () => {
    const updatePropertyDto = {
      name: 'Updated Property',
      price: 1800000,
    };

    it('should update an existing property', async () => {
      const updatedProperty = { ...mockProperty, ...updatePropertyDto };
      mockPropertiesService.update.mockResolvedValue(updatedProperty);

      const response = await request(app.getHttpServer())
        .patch('/real-estate/properties/property-123')
        .send(updatePropertyDto)
        .expect(200);

      expect(response.body).toEqual(updatedProperty);
      expect(mockPropertiesService.update).toHaveBeenCalledWith(
        'demo',
        'property-123',
        updatePropertyDto
      );
    });
  });

  describe('DELETE /api/real-estate/properties/:id', () => {
    it('should delete a property', async () => {
      mockPropertiesService.hardDelete.mockResolvedValue({ success: true });

      const response = await request(app.getHttpServer())
        .delete('/real-estate/properties/property-123')
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(mockPropertiesService.hardDelete).toHaveBeenCalledWith('demo', 'property-123');
    });
  });

  describe('POST /api/real-estate/properties/:id/photos/upload', () => {
    it('should upload photos to property', async () => {
      const mockUploadResult = {
        success: true,
        uploadedPhotos: 2,
        photos: [
          { id: 'photo1', url: 'https://example.com/photo1.jpg' },
          { id: 'photo2', url: 'https://example.com/photo2.jpg' },
        ],
      };
      mockPropertiesService.uploadAndAttachPhotos.mockResolvedValue(mockUploadResult);

      const response = await request(app.getHttpServer())
        .post('/real-estate/properties/property-123/photos/upload')
        .attach('files', Buffer.from('fake-image-1'), 'photo1.jpg')
        .attach('files', Buffer.from('fake-image-2'), 'photo2.jpg')
        .expect(201);

      expect(response.body).toEqual(mockUploadResult);
    });

    it('should handle no files uploaded', async () => {
      await request(app.getHttpServer())
        .post('/real-estate/properties/property-123/photos/upload')
        .expect(400);
    });

    it('should respect file size limits', async () => {
      const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB - exceeds limit

      await request(app.getHttpServer())
        .post('/real-estate/properties/property-123/photos/upload')
        .attach('files', largeBuffer, 'large-photo.jpg')
        .expect(413); // Payload too large
    });
  });

  describe('Property Import Endpoints', () => {
    describe('POST /api/real-estate/properties/import/single-url', () => {
      const mockImportResult = {
        success: true,
        imported: 1,
        updated: 0,
        duplicates: 0,
        errors: 0,
        details: [
          {
            url: 'https://yad2.co.il/property/123',
            status: 'imported',
            message: 'Property imported successfully',
            propertyId: 'imported-123',
          },
        ],
      };

      it('should import single property from URL', async () => {
        mockImportService.importSingleProperty.mockResolvedValue(mockImportResult);

        const response = await request(app.getHttpServer())
          .post('/real-estate/properties/import/single-url')
          .send({ url: 'https://yad2.co.il/property/123' })
          .expect(201);

        expect(response.body).toEqual(mockImportResult);
        expect(mockImportService.importSingleProperty).toHaveBeenCalledWith(
          'demo',
          'https://yad2.co.il/property/123'
        );
      });

      it('should validate URL parameter', async () => {
        await request(app.getHttpServer())
          .post('/real-estate/properties/import/single-url')
          .send({}) // Missing URL
          .expect(400);

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/single-url')
          .send({ url: '' }) // Empty URL
          .expect(400);
      });

      it('should handle import errors', async () => {
        mockImportService.importSingleProperty.mockRejectedValue(
          new Error('Scraping failed')
        );

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/single-url')
          .send({ url: 'https://invalid-url.com' })
          .expect(500);
      });
    });

    describe('POST /api/real-estate/properties/import/bulk-urls', () => {
      const mockBulkImportResult = {
        success: true,
        imported: 2,
        updated: 0,
        duplicates: 0,
        errors: 0,
        details: [
          { url: 'https://yad2.co.il/property/123', status: 'imported' },
          { url: 'https://yad2.co.il/property/456', status: 'imported' },
        ],
      };

      it('should import multiple properties from URLs', async () => {
        mockImportService.importBulkProperties.mockResolvedValue(mockBulkImportResult);

        const urls = [
          'https://yad2.co.il/property/123',
          'https://yad2.co.il/property/456',
        ];

        const response = await request(app.getHttpServer())
          .post('/real-estate/properties/import/bulk-urls')
          .send({ urls, updateExisting: true })
          .expect(201);

        expect(response.body).toEqual(mockBulkImportResult);
        expect(mockImportService.importBulkProperties).toHaveBeenCalledWith('demo', {
          urls,
          updateExisting: true,
        });
      });

      it('should validate URLs array', async () => {
        await request(app.getHttpServer())
          .post('/real-estate/properties/import/bulk-urls')
          .send({}) // Missing URLs
          .expect(400);

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/bulk-urls')
          .send({ urls: [] }) // Empty URLs array
          .expect(400);

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/bulk-urls')
          .send({ urls: 'not-an-array' }) // Invalid type
          .expect(400);
      });

      it('should default updateExisting to false', async () => {
        mockImportService.importBulkProperties.mockResolvedValue(mockBulkImportResult);

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/bulk-urls')
          .send({ urls: ['https://yad2.co.il/property/123'] })
          .expect(201);

        expect(mockImportService.importBulkProperties).toHaveBeenCalledWith('demo', {
          urls: ['https://yad2.co.il/property/123'],
          updateExisting: false,
        });
      });
    });

    describe('POST /api/real-estate/properties/import/csv', () => {
      const mockCsvImportResult = {
        success: true,
        imported: 2,
        updated: 0,
        duplicates: 0,
        errors: 0,
        details: [
          { status: 'imported', message: 'Property created from CSV' },
          { status: 'imported', message: 'Property created from CSV' },
        ],
      };

      it('should import properties from CSV file', async () => {
        mockImportService.importBulkProperties.mockResolvedValue(mockCsvImportResult);

        const csvContent = 'name,address,city,price\nProperty 1,123 Test St,Tel Aviv,1500000\nProperty 2,456 Test Ave,Jerusalem,2000000';

        const response = await request(app.getHttpServer())
          .post('/real-estate/properties/import/csv')
          .attach('file', Buffer.from(csvContent), 'properties.csv')
          .field('updateExisting', 'true')
          .expect(201);

        expect(response.body).toEqual(mockCsvImportResult);
        expect(mockImportService.importBulkProperties).toHaveBeenCalledWith('demo', {
          csvData: [
            { name: 'Property 1', address: '123 Test St', city: 'Tel Aviv', price: '1500000' },
            { name: 'Property 2', address: '456 Test Ave', city: 'Jerusalem', price: '2000000' },
          ],
          updateExisting: true,
        });
      });

      it('should handle CSV with quoted values', async () => {
        mockImportService.importBulkProperties.mockResolvedValue(mockCsvImportResult);

        const csvContent = 'name,address,city,price\n"Property, with comma","123 Test St","Tel Aviv","1,500,000"';

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/csv')
          .attach('file', Buffer.from(csvContent), 'properties.csv')
          .expect(201);
      });

      it('should validate CSV file presence', async () => {
        await request(app.getHttpServer())
          .post('/real-estate/properties/import/csv')
          .expect(400);
      });

      it('should handle malformed CSV', async () => {
        const invalidCsv = 'just a header';

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/csv')
          .attach('file', Buffer.from(invalidCsv), 'invalid.csv')
          .expect(400);
      });

      it('should respect file size limits', async () => {
        const largeCsv = Buffer.alloc(6 * 1024 * 1024); // 6MB - exceeds 5MB limit

        await request(app.getHttpServer())
          .post('/real-estate/properties/import/csv')
          .attach('file', largeCsv, 'large.csv')
          .expect(413);
      });
    });

    describe('GET /api/real-estate/properties/import/batches', () => {
      it('should return import batches', async () => {
        const mockBatches = [
          {
            id: 'batch-1',
            source: 'YAD2',
            status: 'completed',
            totalItems: 5,
            importedItems: 5,
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'batch-2',
            source: 'MADLAN',
            status: 'processing',
            totalItems: 3,
            importedItems: 1,
            createdAt: '2024-01-16T14:20:00Z',
          },
        ];
        mockImportService.getImportBatches.mockResolvedValue(mockBatches);

        const response = await request(app.getHttpServer())
          .get('/real-estate/properties/import/batches')
          .expect(200);

        expect(response.body).toEqual(mockBatches);
        expect(mockImportService.getImportBatches).toHaveBeenCalledWith('demo', 20);
      });

      it('should respect custom limit parameter', async () => {
        mockImportService.getImportBatches.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/real-estate/properties/import/batches')
          .query({ limit: '50' })
          .expect(200);

        expect(mockImportService.getImportBatches).toHaveBeenCalledWith('demo', 50);
      });
    });

    describe('GET /api/real-estate/properties/import/batches/:batchId', () => {
      it('should return specific import batch', async () => {
        const mockBatch = {
          id: 'batch-123',
          source: 'YAD2',
          status: 'completed',
          summary: { imported: 5, errors: 0 },
        };
        mockImportService.getImportBatch.mockResolvedValue(mockBatch);

        const response = await request(app.getHttpServer())
          .get('/real-estate/properties/import/batches/batch-123')
          .expect(200);

        expect(response.body).toEqual(mockBatch);
        expect(mockImportService.getImportBatch).toHaveBeenCalledWith('demo', 'batch-123');
      });

      it('should handle non-existent batch', async () => {
        mockImportService.getImportBatch.mockResolvedValue(null);

        const response = await request(app.getHttpServer())
          .get('/real-estate/properties/import/batches/nonexistent')
          .expect(200);

        expect(response.body).toBeNull();
      });
    });

    describe('POST /api/real-estate/properties/:id/sync', () => {
      it('should sync property from external source', async () => {
        const propertyWithExternalUrl = {
          ...mockProperty,
          externalUrl: 'https://yad2.co.il/property/123',
        };
        mockPropertiesService.get.mockResolvedValue(propertyWithExternalUrl);
        mockImportService.importSingleProperty.mockResolvedValue({
          success: true,
          updated: 1,
          imported: 0,
          errors: 0,
          duplicates: 0,
          details: [{ status: 'updated' }],
        });

        const response = await request(app.getHttpServer())
          .post('/real-estate/properties/property-123/sync')
          .expect(201);

        expect(mockImportService.importSingleProperty).toHaveBeenCalledWith(
          'demo',
          'https://yad2.co.il/property/123'
        );
      });

      it('should handle property without external URL', async () => {
        const propertyWithoutUrl = { ...mockProperty, externalUrl: null };
        mockPropertiesService.get.mockResolvedValue(propertyWithoutUrl);

        await request(app.getHttpServer())
          .post('/real-estate/properties/property-123/sync')
          .expect(400);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for protected endpoints', async () => {
      mockOrgGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .get('/real-estate/properties')
        .expect(403);
    });

    it('should allow public access to public endpoints', async () => {
      mockPropertiesService.getBySlug.mockResolvedValue(mockProperty);

      // Public endpoint should work even when auth fails
      await request(app.getHttpServer())
        .get('/real-estate/properties/public/test-slug')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockPropertiesService.list.mockRejectedValue(new Error('Database connection failed'));

      await request(app.getHttpServer())
        .get('/real-estate/properties')
        .expect(500);
    });

    it('should return proper error messages for bad requests', async () => {
      await request(app.getHttpServer())
        .post('/real-estate/properties/import/single-url')
        .send({ url: '' })
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('URL is required');
        });
    });

    it('should handle malformed JSON in request body', async () => {
      await request(app.getHttpServer())
        .post('/real-estate/properties')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should validate property creation data', async () => {
      const invalidProperty = {
        name: '', // Empty name
        price: 'not-a-number', // Invalid price
        rooms: -1, // Negative rooms
      };

      await request(app.getHttpServer())
        .post('/real-estate/properties')
        .send(invalidProperty)
        .expect(400);
    });

    it('should sanitize input data', async () => {
      const propertyWithHtml = {
        name: '<script>alert("xss")</script>Property Name',
        description: '<img src="x" onerror="alert(1)">Description',
        address: '123 Test St',
        city: 'Tel Aviv',
        price: 1500000,
      };

      mockPropertiesService.create.mockResolvedValue({
        ...propertyWithHtml,
        id: 'sanitized-property',
      });

      const response = await request(app.getHttpServer())
        .post('/real-estate/properties')
        .send(propertyWithHtml)
        .expect(201);

      // Service should receive sanitized data
      expect(mockPropertiesService.create).toHaveBeenCalledWith(
        'demo',
        expect.objectContaining({
          name: expect.not.stringContaining('<script>'),
          description: expect.not.stringContaining('<img'),
        })
      );
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should handle concurrent requests efficiently', async () => {
      mockPropertiesService.list.mockResolvedValue({ properties: [], total: 0 });

      const requests = Array(10)
        .fill(0)
        .map(() =>
          request(app.getHttpServer())
            .get('/real-estate/properties')
            .expect(200)
        );

      await Promise.all(requests);

      expect(mockPropertiesService.list).toHaveBeenCalledTimes(10);
    });

    it('should handle large import requests', async () => {
      const manyUrls = Array(100)
        .fill(0)
        .map((_, i) => `https://yad2.co.il/property/${i}`);

      mockImportService.importBulkProperties.mockResolvedValue({
        success: true,
        imported: 100,
        updated: 0,
        duplicates: 0,
        errors: 0,
        details: [],
      });

      const response = await request(app.getHttpServer())
        .post('/real-estate/properties/import/bulk-urls')
        .send({ urls: manyUrls })
        .timeout(30000) // 30 second timeout for large requests
        .expect(201);

      expect(response.body.imported).toBe(100);
    });
  });
});