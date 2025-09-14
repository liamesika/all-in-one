/**
 * RealEstateLeadsService Unit Tests
 * 
 * Tests CRUD operations for real estate leads including:
 * - Lead listing with filtering and pagination
 * - Lead creation with data validation
 * - Lead retrieval and updates
 * - Data scoping with ownerUid
 * - Search functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RealEstateLeadsService } from './real-estate-leads.service';

// Mock the prisma import first, before any other imports
jest.mock('../../../../../packages/server/db/client', () => ({
  prisma: {
    realEstateLead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Get the mocked prisma instance
const { prisma } = require('../../../../../packages/server/db/client');
const mockPrisma = prisma;

describe('RealEstateLeadsService', () => {
  let service: RealEstateLeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealEstateLeadsService],
    }).compile();

    service = module.get<RealEstateLeadsService>(RealEstateLeadsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('list', () => {
    const mockLeads = [
      {
        id: 'lead-1',
        ownerUid: 'org-1',
        clientName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        propertyType: 'APARTMENT',
        city: 'Tel Aviv',
        budgetMin: 500000,
        budgetMax: 800000,
        status: 'NEW',
        source: 'WEBSITE',
        notes: 'Looking for 2-bedroom apartment',
        createdAt: new Date(),
      },
      {
        id: 'lead-2',
        ownerUid: 'org-1',
        clientName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        propertyType: 'HOUSE',
        city: 'Jerusalem',
        budgetMin: 1000000,
        budgetMax: 1500000,
        status: 'CONTACTED',
        source: 'REFERRAL',
        notes: 'Family with children',
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      mockPrisma.realEstateLead.findMany.mockResolvedValue(mockLeads);
    });

    it('should list leads for organization', async () => {
      const result = await service.list({
        orgId: 'org-1',
        limit: 10,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      expect(result).toEqual(mockLeads);
    });

    it('should filter leads by status', async () => {
      await service.list({
        orgId: 'org-1',
        status: 'NEW',
        limit: 10,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
          status: 'NEW',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should filter leads by search query', async () => {
      await service.list({
        orgId: 'org-1',
        q: 'john',
        limit: 10,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
          OR: [
            { clientName: { contains: 'john' } },
            { city: { contains: 'john' } },
            { propertyType: { contains: 'john' } },
            { email: { contains: 'john' } },
            { phone: { contains: 'john' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should filter leads by both status and search query', async () => {
      await service.list({
        orgId: 'org-1',
        status: 'CONTACTED',
        q: 'jane',
        limit: 5,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
          status: 'CONTACTED',
          OR: [
            { clientName: { contains: 'jane' } },
            { city: { contains: 'jane' } },
            { propertyType: { contains: 'jane' } },
            { email: { contains: 'jane' } },
            { phone: { contains: 'jane' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });

    it('should enforce minimum limit of 1', async () => {
      await service.list({
        orgId: 'org-1',
        limit: 0,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
    });

    it('should enforce maximum limit of 1000', async () => {
      await service.list({
        orgId: 'org-1',
        limit: 2000,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'org-1',
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });
    });

    it('should scope data to organization (ownerUid)', async () => {
      await service.list({
        orgId: 'different-org',
        limit: 10,
      });

      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith({
        where: {
          ownerUid: 'different-org',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('getOne', () => {
    const mockLead = {
      id: 'lead-1',
      ownerUid: 'org-1',
      clientName: 'John Doe',
      email: 'john@example.com',
      status: 'NEW',
    };

    it('should return lead by ID', async () => {
      mockPrisma.realEstateLead.findUnique.mockResolvedValue(mockLead);

      const result = await service.getOne('lead-1');

      expect(mockPrisma.realEstateLead.findUnique).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
      });

      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException when lead not found', async () => {
      mockPrisma.realEstateLead.findUnique.mockResolvedValue(null);

      await expect(service.getOne('non-existent')).rejects.toThrow(
        new NotFoundException('Lead not found')
      );
    });
  });

  describe('create', () => {
    const mockCreatedLead = {
      id: 'new-lead-1',
      ownerUid: 'org-1',
      clientName: 'New Client',
      email: 'new@example.com',
      status: 'NEW',
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockPrisma.realEstateLead.create.mockResolvedValue(mockCreatedLead);
    });

    it('should create a new lead with all fields', async () => {
      const dto = {
        clientName: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        propertyType: 'APARTMENT',
        city: 'Tel Aviv',
        budgetMin: 500000,
        budgetMax: 800000,
        source: 'WEBSITE',
        status: 'NEW',
        notes: 'Looking for apartment',
        propertyId: 'property-123',
      };

      const result = await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith({
        data: {
          ownerUid: 'org-1',
          clientName: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          propertyType: 'APARTMENT',
          city: 'Tel Aviv',
          budgetMin: 500000,
          budgetMax: 800000,
          source: 'WEBSITE',
          status: 'NEW',
          notes: 'Looking for apartment',
          propertyId: 'property-123',
        },
      });

      expect(result).toEqual(mockCreatedLead);
    });

    it('should handle minimal lead data', async () => {
      const dto = {
        clientName: 'Minimal Client',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith({
        data: {
          ownerUid: 'org-1',
          clientName: 'Minimal Client',
          phone: null,
          email: null,
          propertyType: null,
          city: null,
          budgetMin: null,
          budgetMax: null,
          source: null,
          status: 'NEW',
          notes: null,
          propertyId: null,
        },
      });
    });

    it('should support legacy "name" field for clientName', async () => {
      const dto = {
        name: 'Legacy Name Field',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientName: 'Legacy Name Field',
          }),
        })
      );
    });

    it('should support legacy "message" field for notes', async () => {
      const dto = {
        clientName: 'Test Client',
        message: 'Legacy message field',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: 'Legacy message field',
          }),
        })
      );
    });

    it('should trim whitespace from clientName', async () => {
      const dto = {
        clientName: '  John Doe  ',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientName: 'John Doe',
          }),
        })
      );
    });

    it('should use fallback "—" for empty clientName', async () => {
      const dto = {
        clientName: '',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientName: '—',
          }),
        })
      );
    });

    it('should convert budget strings to numbers', async () => {
      const dto = {
        clientName: 'Test Client',
        budgetMin: '500000',
        budgetMax: '800000',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            budgetMin: 500000,
            budgetMax: 800000,
          }),
        })
      );
    });

    it('should handle empty string budgets as null', async () => {
      const dto = {
        clientName: 'Test Client',
        budgetMin: '',
        budgetMax: '',
      };

      await service.create({
        orgId: 'org-1',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            budgetMin: null,
            budgetMax: null,
          }),
        })
      );
    });

    it('should always scope to ownerUid', async () => {
      const dto = {
        clientName: 'Test Client',
      };

      await service.create({
        orgId: 'secure-org-id',
        dto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerUid: 'secure-org-id',
          }),
        })
      );
    });
  });

  describe('update', () => {
    const mockUpdatedLead = {
      id: 'lead-1',
      ownerUid: 'org-1',
      clientName: 'Updated Client',
      status: 'CONTACTED',
    };

    beforeEach(() => {
      mockPrisma.realEstateLead.update.mockResolvedValue(mockUpdatedLead);
    });

    it('should update lead with all fields', async () => {
      const dto = {
        clientName: 'Updated Client',
        status: 'CONTACTED',
        budgetMin: 600000,
        budgetMax: 900000,
      };

      const result = await service.update('lead-1', dto);

      expect(mockPrisma.realEstateLead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: {
          clientName: 'Updated Client',
          status: 'CONTACTED',
          budgetMin: 600000,
          budgetMax: 900000,
        },
      });

      expect(result).toEqual(mockUpdatedLead);
    });

    it('should convert budget strings to numbers', async () => {
      const dto = {
        budgetMin: '750000',
        budgetMax: '1000000',
      };

      await service.update('lead-1', dto);

      expect(mockPrisma.realEstateLead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: {
          budgetMin: 750000,
          budgetMax: 1000000,
        },
      });
    });

    it('should handle empty string budgets as null', async () => {
      const dto = {
        budgetMin: '',
        budgetMax: '',
      };

      await service.update('lead-1', dto);

      expect(mockPrisma.realEstateLead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: {
          budgetMin: null,
          budgetMax: null,
        },
      });
    });
  });

  describe('hardDelete', () => {
    it('should delete lead by ID', async () => {
      const mockDeletedLead = { id: 'lead-1' };
      mockPrisma.realEstateLead.delete.mockResolvedValue(mockDeletedLead);

      const result = await service.hardDelete('lead-1');

      expect(mockPrisma.realEstateLead.delete).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
      });

      expect(result).toEqual(mockDeletedLead);
    });
  });

  describe('Data Scoping Security', () => {
    it('should always use orgId as ownerUid in create operations', async () => {
      const maliciousDto = {
        clientName: 'Hacker',
        ownerUid: 'malicious-org-id', // Should be ignored
      };

      await service.create({
        orgId: 'legitimate-org-id',
        dto: maliciousDto,
      });

      expect(mockPrisma.realEstateLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerUid: 'legitimate-org-id', // Should use orgId, not dto.ownerUid
        }),
      });
    });

    it('should scope list operations to orgId', async () => {
      await service.list({
        orgId: 'user-org-1',
        limit: 10,
      });

      // Verify that the query is scoped to the user's organization
      expect(mockPrisma.realEstateLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: 'user-org-1',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate database errors in create operations', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.realEstateLead.create.mockRejectedValue(dbError);

      const dto = { clientName: 'Test Client' };

      await expect(
        service.create({ orgId: 'org-1', dto })
      ).rejects.toThrow('Database connection failed');
    });

    it('should propagate database errors in update operations', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.realEstateLead.update.mockRejectedValue(dbError);

      await expect(
        service.update('lead-1', { clientName: 'Updated' })
      ).rejects.toThrow('Database connection failed');
    });

    it('should propagate database errors in delete operations', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.realEstateLead.delete.mockRejectedValue(dbError);

      await expect(service.hardDelete('lead-1')).rejects.toThrow('Database connection failed');
    });
  });
});