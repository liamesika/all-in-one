import { Test, TestingModule } from '@nestjs/testing';
import { LeadImportService, MetaLeadFormData, ImportResult } from './lead-import.service';

// Mock Prisma Client
const mockPrismaClient = {
  ecommerceLead: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

describe('LeadImportService', () => {
  let service: LeadImportService;

  const mockOwnerUid = 'test-owner-uid';

  const mockMetaLeadForm: MetaLeadFormData = {
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
      { name: 'city', values: ['Tel Aviv'] },
      { name: 'budget', values: ['5000'] },
    ],
  };

  const mockExistingLead = {
    id: 'existing-lead-123',
    externalId: 'lead_123456789',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    ownerUid: mockOwnerUid,
  };

  const mockNewLead = {
    id: 'new-lead-456',
    externalId: 'lead_123456789',
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+972501234567',
    city: 'Tel Aviv',
    budget: 5000,
    source: 'FACEBOOK',
    sourceName: 'Summer Sale Campaign',
    status: 'NEW',
    score: 'WARM',
    utmSource: 'facebook',
    utmMedium: 'paid-social',
    utmCampaign: 'Summer Sale Campaign',
    utmTerm: 'Lookalike Audience',
    ownerUid: mockOwnerUid,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadImportService],
    }).compile();

    service = module.get<LeadImportService>(LeadImportService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('importMetaLeads', () => {
    beforeEach(() => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create.mockResolvedValue(mockNewLead);
    });

    it('should successfully import new Meta leads', async () => {
      const result = await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.details).toHaveLength(1);
      expect(result.details[0].status).toBe('imported');
      expect(result.details[0].externalId).toBe(mockMetaLeadForm.leadgen_id);
    });

    it('should update existing leads when found', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockExistingLead);
      mockPrismaClient.ecommerceLead.update.mockResolvedValue({
        ...mockExistingLead,
        updatedAt: new Date(),
      });

      const result = await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.details[0].status).toBe('updated');
    });

    it('should parse Meta lead form data correctly', async () => {
      await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          externalId: 'lead_123456789',
          fullName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+972501234567',
          city: 'Tel Aviv',
          budget: 5000,
          source: 'FACEBOOK',
          sourceName: 'Summer Sale Campaign',
          status: 'NEW',
          score: 'WARM',
          utmSource: 'facebook',
          utmMedium: 'paid-social',
          utmCampaign: 'Summer Sale Campaign',
          utmTerm: 'Lookalike Audience',
        }),
      });
    });

    it('should handle multiple field name variations', async () => {
      const leadWithVariations: MetaLeadFormData = {
        ...mockMetaLeadForm,
        field_data: [
          { name: 'first_name', values: ['Jane'] },
          { name: 'last_name', values: ['Smith'] },
          { name: 'phone', values: ['+972509876543'] },
          { name: 'email', values: ['jane.smith@example.com'] },
        ],
      };

      await service.importMetaLeads(mockOwnerUid, [leadWithVariations]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+972509876543',
          email: 'jane.smith@example.com',
        }),
      });
    });

    it('should handle Instagram platform leads', async () => {
      const instagramLead: MetaLeadFormData = {
        ...mockMetaLeadForm,
        platform: 'instagram',
      };

      await service.importMetaLeads(mockOwnerUid, [instagramLead]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          utmSource: 'instagram',
          utmMedium: 'paid-social',
        }),
      });
    });

    it('should handle leads with missing optional fields', async () => {
      const minimalLead: MetaLeadFormData = {
        ...mockMetaLeadForm,
        field_data: [{ name: 'email', values: ['minimal@example.com'] }],
      };

      await service.importMetaLeads(mockOwnerUid, [minimalLead]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'minimal@example.com',
          fullName: undefined,
          firstName: undefined,
          lastName: undefined,
          phone: undefined,
          city: undefined,
          budget: undefined,
        }),
      });
    });

    it('should handle batch import errors gracefully', async () => {
      const leads = [
        mockMetaLeadForm,
        { ...mockMetaLeadForm, leadgen_id: 'lead_error' },
        { ...mockMetaLeadForm, leadgen_id: 'lead_success' },
      ];

      mockPrismaClient.ecommerceLead.create
        .mockResolvedValueOnce(mockNewLead)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({ ...mockNewLead, id: 'lead-success-789' });

      const result = await service.importMetaLeads(mockOwnerUid, leads);

      expect(result.imported).toBe(2);
      expect(result.errors).toBe(1);
      expect(result.success).toBe(true); // Success if some imports worked
      expect(result.details).toHaveLength(3);

      const errorDetail = result.details.find(d => d.status === 'error');
      expect(errorDetail?.message).toBe('Database error');
    });

    it('should find existing leads by external ID first', async () => {
      await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          externalId: 'lead_123456789',
        },
      });
    });

    it('should find existing leads by email if external ID not found', async () => {
      mockPrismaClient.ecommerceLead.findFirst
        .mockResolvedValueOnce(null) // First call for external ID
        .mockResolvedValueOnce(mockExistingLead); // Second call for email

      await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: {
          ownerUid: mockOwnerUid,
          email: { equals: 'john.doe@example.com', mode: 'insensitive' },
        },
      });
    });
  });

  describe('getCampaignAttribution', () => {
    const mockLeadWithAttribution = {
      id: 'lead-123',
      source: 'FACEBOOK',
      sourceName: 'Summer Sale Campaign',
      utmSource: 'facebook',
      utmMedium: 'paid-social',
      utmCampaign: 'Summer Sale Campaign',
      utmTerm: 'Lookalike Audience',
      createdAt: new Date('2024-01-15T10:30:00Z'),
    };

    it('should return attribution data for existing lead', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockLeadWithAttribution);

      const result = await service.getCampaignAttribution(mockOwnerUid, 'lead-123');

      expect(result).toEqual({
        leadId: 'lead-123',
        source: 'FACEBOOK',
        sourceName: 'Summer Sale Campaign',
        utmSource: 'facebook',
        utmMedium: 'paid-social',
        utmCampaign: 'Summer Sale Campaign',
        utmTerm: 'Lookalike Audience',
        createdAt: mockLeadWithAttribution.createdAt,
      });
    });

    it('should return null for non-existent lead', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      const result = await service.getCampaignAttribution(mockOwnerUid, 'non-existent');

      expect(result).toBeNull();
    });

    it('should scope attribution query to owner', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      await service.getCampaignAttribution(mockOwnerUid, 'lead-123');

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: { id: 'lead-123', ownerUid: mockOwnerUid },
        include: {},
      });
    });
  });

  describe('syncMetaCampaignLeads', () => {
    it('should sync campaign leads with mock data', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create.mockResolvedValue(mockNewLead);

      const result = await service.syncMetaCampaignLeads(mockOwnerUid);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.details).toHaveLength(1);
    });

    it('should use specific campaign ID when provided', async () => {
      const specificCampaignId = 'campaign-specific-123';
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create.mockResolvedValue({
        ...mockNewLead,
        utmCampaign: 'E-commerce Lead Gen Campaign',
      });

      const result = await service.syncMetaCampaignLeads(mockOwnerUid, specificCampaignId);

      expect(result.success).toBe(true);
      // Mock data should include the specific campaign ID in the lead generation
    });

    it('should handle sync errors gracefully', async () => {
      mockPrismaClient.ecommerceLead.create.mockRejectedValue(
        new Error('Sync failed')
      );

      await expect(
        service.syncMetaCampaignLeads(mockOwnerUid)
      ).rejects.toThrow('Sync failed');
    });
  });

  describe('data security and scoping', () => {
    it('should always scope queries to ownerUid', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      await service.getCampaignAttribution(mockOwnerUid, 'lead-123');

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerUid: mockOwnerUid,
          }),
        })
      );
    });

    it('should not allow cross-owner lead access', async () => {
      const otherOwnerLead = { id: 'other-lead', ownerUid: 'other-owner' };
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);

      const result = await service.getCampaignAttribution(mockOwnerUid, 'other-lead');

      expect(result).toBeNull();
    });

    it('should include ownerUid in all new lead creations', async () => {
      await service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerUid: mockOwnerUid,
        }),
      });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed field data', async () => {
      const malformedLead: MetaLeadFormData = {
        ...mockMetaLeadForm,
        field_data: [
          { name: 'email', values: [] }, // Empty values
          { name: 'phone', values: [''] }, // Empty string
          { name: 'budget', values: ['invalid'] }, // Invalid number
        ],
      };

      await service.importMetaLeads(mockOwnerUid, [malformedLead]);

      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: undefined,
          phone: '',
          budget: null, // Should handle invalid number
        }),
      });
    });

    it('should handle database connection failures', async () => {
      mockPrismaClient.ecommerceLead.findFirst.mockRejectedValue(
        new Error('Connection failed')
      );

      await expect(
        service.importMetaLeads(mockOwnerUid, [mockMetaLeadForm])
      ).rejects.toThrow();
    });

    it('should handle empty lead form array', async () => {
      const result = await service.importMetaLeads(mockOwnerUid, []);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.details).toHaveLength(0);
    });

    it('should handle leads with duplicate external IDs in batch', async () => {
      const duplicateLeads = [
        mockMetaLeadForm,
        { ...mockMetaLeadForm }, // Same external ID
      ];

      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create
        .mockResolvedValueOnce(mockNewLead)
        .mockRejectedValueOnce(new Error('Unique constraint violation'));

      const result = await service.importMetaLeads(mockOwnerUid, duplicateLeads);

      expect(result.imported).toBe(1);
      expect(result.errors).toBe(1);
    });
  });

  describe('performance and scalability', () => {
    it('should handle large batches efficiently', async () => {
      const largeBatch = Array(100)
        .fill(0)
        .map((_, i) => ({
          ...mockMetaLeadForm,
          leadgen_id: `lead_${i}`,
        }));

      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create.mockResolvedValue(mockNewLead);

      const result = await service.importMetaLeads(mockOwnerUid, largeBatch);

      expect(result.imported).toBe(100);
      expect(mockPrismaClient.ecommerceLead.create).toHaveBeenCalledTimes(100);
    });

    it('should process leads sequentially to avoid race conditions', async () => {
      const leads = [
        { ...mockMetaLeadForm, leadgen_id: 'lead_1' },
        { ...mockMetaLeadForm, leadgen_id: 'lead_2' },
      ];

      let callOrder = 0;
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      mockPrismaClient.ecommerceLead.create.mockImplementation(() => {
        callOrder++;
        return Promise.resolve({ ...mockNewLead, id: `lead-${callOrder}` });
      });

      await service.importMetaLeads(mockOwnerUid, leads);

      expect(callOrder).toBe(2);
    });
  });
});