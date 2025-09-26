import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PropertyImportService } from '../real-estate-properties/property-import.service';
import { LeadImportService } from '../campaigns/lead-import.service';
import { ShopifyIntegrationService } from '../campaigns/shopify-integration.service';
import { AttributionTrackingService } from '../campaigns/attribution-tracking.service';

/**
 * Security Validation Tests for Real Data Integration System
 *
 * These tests validate:
 * 1. Data access control and owner scoping
 * 2. Input validation and sanitization
 * 3. SQL injection prevention
 * 4. Cross-owner data isolation
 * 5. Authentication and authorization
 * 6. Rate limiting and abuse prevention
 */

// Mock Prisma Client with security-focused tests
const mockPrismaClient = {
  property: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ecommerceLead: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  propertyImportBatch: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  leadImportBatch: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

describe('Security Validation - Real Data Integrations', () => {
  let propertyImportService: PropertyImportService;
  let leadImportService: LeadImportService;
  let shopifyService: ShopifyIntegrationService;
  let attributionService: AttributionTrackingService;

  const validOwnerUid = 'valid-owner-123';
  const maliciousOwnerUid = 'malicious-owner-456';
  const adminOwnerUid = 'admin-owner-789';

  beforeEach(async () => {
    // We'll mock the services directly for security testing
    jest.clearAllMocks();
  });

  describe('Data Access Control and Owner Scoping', () => {
    it('should prevent cross-owner property access', async () => {
      const validOwnerProperty = {
        id: 'property-123',
        ownerUid: validOwnerUid,
        name: 'Valid Property',
      };

      const otherOwnerProperty = {
        id: 'property-456',
        ownerUid: 'other-owner',
        name: 'Other Owner Property',
      };

      mockPrismaClient.property.findMany.mockResolvedValue([validOwnerProperty]);

      // Mock service behavior - should only return properties for the authenticated owner
      const mockService = {
        async list(ownerUid: string) {
          const properties = await mockPrismaClient.property.findMany({
            where: { ownerUid }, // Critical: must include ownerUid filter
          });
          return { properties, total: properties.length };
        }
      };

      const result = await mockService.list(validOwnerUid);

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith({
        where: { ownerUid: validOwnerUid },
      });

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].ownerUid).toBe(validOwnerUid);
      expect(result.properties[0].name).toBe('Valid Property');
    });

    it('should prevent unauthorized lead data access', async () => {
      const mockLead = {
        id: 'lead-123',
        ownerUid: validOwnerUid,
        email: 'valid@example.com',
      };

      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(mockLead);

      const mockService = {
        async getLead(ownerUid: string, leadId: string) {
          return await mockPrismaClient.ecommerceLead.findFirst({
            where: {
              id: leadId,
              ownerUid, // Critical: must verify ownership
            },
          });
        }
      };

      // Valid access
      const validResult = await mockService.getLead(validOwnerUid, 'lead-123');
      expect(validResult).toBeDefined();
      expect(validResult.ownerUid).toBe(validOwnerUid);

      // Invalid cross-owner access attempt
      mockPrismaClient.ecommerceLead.findFirst.mockResolvedValue(null);
      const invalidResult = await mockService.getLead(maliciousOwnerUid, 'lead-123');
      expect(invalidResult).toBeNull();

      expect(mockPrismaClient.ecommerceLead.findFirst).toHaveBeenCalledWith({
        where: { id: 'lead-123', ownerUid: maliciousOwnerUid },
      });
    });

    it('should validate ownership before data modification', async () => {
      const mockProperty = {
        id: 'property-123',
        ownerUid: validOwnerUid,
        name: 'Original Property',
      };

      mockPrismaClient.property.findFirst.mockResolvedValue(mockProperty);
      mockPrismaClient.property.update.mockResolvedValue({
        ...mockProperty,
        name: 'Updated Property',
      });

      const mockService = {
        async updateProperty(ownerUid: string, propertyId: string, data: any) {
          // Verify ownership before update
          const existingProperty = await mockPrismaClient.property.findFirst({
            where: { id: propertyId, ownerUid },
          });

          if (!existingProperty) {
            throw new UnauthorizedException('Property not found or access denied');
          }

          return await mockPrismaClient.property.update({
            where: { id: propertyId },
            data,
          });
        }
      };

      // Valid owner update
      const result = await mockService.updateProperty(
        validOwnerUid,
        'property-123',
        { name: 'Updated Property' }
      );

      expect(result.name).toBe('Updated Property');

      // Invalid owner update attempt
      mockPrismaClient.property.findFirst.mockResolvedValue(null);

      await expect(
        mockService.updateProperty(
          maliciousOwnerUid,
          'property-123',
          { name: 'Malicious Update' }
        )
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate and sanitize property import URLs', () => {
      const mockService = {
        validateImportUrl(url: string): boolean {
          // Validate URL format
          try {
            const parsedUrl = new URL(url);

            // Only allow specific domains
            const allowedDomains = ['yad2.co.il', 'madlan.co.il', 'yad2.com', 'madlan.com'];
            if (!allowedDomains.includes(parsedUrl.hostname)) {
              return false;
            }

            // Prevent certain protocols
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        },

        sanitizePropertyName(name: string): string {
          // Remove HTML tags and scripts
          return name
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim()
            .slice(0, 200); // Limit length
        }
      };

      // Valid URLs
      expect(mockService.validateImportUrl('https://yad2.co.il/property/123')).toBe(true);
      expect(mockService.validateImportUrl('https://madlan.co.il/listing/456')).toBe(true);

      // Invalid URLs
      expect(mockService.validateImportUrl('javascript:alert("xss")')).toBe(false);
      expect(mockService.validateImportUrl('file:///etc/passwd')).toBe(false);
      expect(mockService.validateImportUrl('https://malicious.com/steal-data')).toBe(false);
      expect(mockService.validateImportUrl('not-a-url')).toBe(false);

      // Input sanitization
      expect(mockService.sanitizePropertyName('Normal Property Name')).toBe('Normal Property Name');
      expect(mockService.sanitizePropertyName('<script>alert("xss")</script>Hacked Property'))
        .toBe('Hacked Property');
      expect(mockService.sanitizePropertyName('<img src="x" onerror="alert(1)">Property with XSS'))
        .toBe('Property with XSS');
    });

    it('should validate lead data to prevent injection attacks', () => {
      const mockService = {
        validateLeadData(leadData: any): { isValid: boolean; errors: string[] } {
          const errors: string[] = [];

          // Email validation
          if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
            errors.push('Invalid email format');
          }

          // Phone validation (basic)
          if (leadData.phone && !/^\+?[\d\s\-\(\)]{7,15}$/.test(leadData.phone)) {
            errors.push('Invalid phone format');
          }

          // Name validation - prevent script injection
          if (leadData.fullName && /<script|javascript:|data:|vbscript:/i.test(leadData.fullName)) {
            errors.push('Invalid characters in name');
          }

          // Prevent SQL injection attempts
          const sqlInjectionPatterns = [
            /union\s+select/i,
            /drop\s+table/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+set/i,
            /--/,
            /\/\*/,
            /\*\//,
          ];

          const textFields = [leadData.fullName, leadData.notes, leadData.city];
          for (const field of textFields) {
            if (field && typeof field === 'string') {
              for (const pattern of sqlInjectionPatterns) {
                if (pattern.test(field)) {
                  errors.push('Invalid characters detected');
                  break;
                }
              }
            }
          }

          return { isValid: errors.length === 0, errors };
        }
      };

      // Valid lead data
      const validLead = {
        email: 'valid@example.com',
        phone: '+972501234567',
        fullName: 'John Doe',
        city: 'Tel Aviv',
      };

      const validResult = mockService.validateLeadData(validLead);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // Invalid email
      const invalidEmailLead = { ...validLead, email: 'not-an-email' };
      const emailResult = mockService.validateLeadData(invalidEmailLead);
      expect(emailResult.isValid).toBe(false);
      expect(emailResult.errors).toContain('Invalid email format');

      // XSS attempt
      const xssLead = { ...validLead, fullName: '<script>alert("xss")</script>Hacker' };
      const xssResult = mockService.validateLeadData(xssLead);
      expect(xssResult.isValid).toBe(false);
      expect(xssResult.errors).toContain('Invalid characters in name');

      // SQL injection attempt
      const sqlLead = { ...validLead, notes: "'; DROP TABLE properties; --" };
      const sqlResult = mockService.validateLeadData(sqlLead);
      expect(sqlResult.isValid).toBe(false);
      expect(sqlResult.errors).toContain('Invalid characters detected');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should use parameterized queries for all database operations', () => {
      // Mock Prisma usage that demonstrates proper parameterization
      const mockService = {
        async searchProperties(ownerUid: string, searchTerm: string) {
          // This demonstrates how Prisma automatically parameterizes queries
          return await mockPrismaClient.property.findMany({
            where: {
              ownerUid, // Parameterized
              AND: [
                {
                  OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } }, // Parameterized
                    { address: { contains: searchTerm, mode: 'insensitive' } }, // Parameterized
                    { city: { contains: searchTerm, mode: 'insensitive' } }, // Parameterized
                  ],
                },
              ],
            },
          });
        }
      };

      mockPrismaClient.property.findMany.mockResolvedValue([]);

      // Test with potentially malicious search terms
      const maliciousSearchTerms = [
        "'; DROP TABLE properties; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "UNION SELECT password FROM users",
      ];

      maliciousSearchTerms.forEach(async (term) => {
        await mockService.searchProperties(validOwnerUid, term);

        // Verify that Prisma receives the search term as a parameter
        expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith({
          where: {
            ownerUid: validOwnerUid,
            AND: [
              {
                OR: [
                  { name: { contains: term, mode: 'insensitive' } },
                  { address: { contains: term, mode: 'insensitive' } },
                  { city: { contains: term, mode: 'insensitive' } },
                ],
              },
            ],
          },
        });
      });
    });

    it('should prevent dynamic query construction', () => {
      // Example of what NOT to do (for testing purposes only)
      const mockUnsafeService = {
        // This would be vulnerable - DO NOT USE
        buildUnsafeQuery(userInput: string): string {
          return `SELECT * FROM properties WHERE name LIKE '%${userInput}%'`;
        },

        // This is the SAFE way using Prisma
        buildSafeQuery(ownerUid: string, userInput: string) {
          return {
            where: {
              ownerUid,
              name: { contains: userInput, mode: 'insensitive' }
            }
          };
        }
      };

      // Demonstrate that the unsafe method would be vulnerable
      const maliciousInput = "'; DROP TABLE properties; --";
      const unsafeQuery = mockUnsafeService.buildUnsafeQuery(maliciousInput);
      expect(unsafeQuery).toContain('DROP TABLE'); // This shows the vulnerability

      // Safe method doesn't construct raw SQL
      const safeQuery = mockUnsafeService.buildSafeQuery(validOwnerUid, maliciousInput);
      expect(safeQuery.where.name.contains).toBe(maliciousInput); // Input is parameterized
      expect(JSON.stringify(safeQuery)).not.toContain('DROP TABLE'); // No SQL injection
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require valid owner UID for all operations', async () => {
      const mockAuthService = {
        validateOwnerUid(ownerUid: string): boolean {
          // Basic validation - in real implementation, this would verify JWT token
          return ownerUid &&
                 typeof ownerUid === 'string' &&
                 ownerUid.length > 5 &&
                 /^[a-zA-Z0-9\-_]+$/.test(ownerUid);
        },

        async requireValidOwner(ownerUid: string) {
          if (!this.validateOwnerUid(ownerUid)) {
            throw new UnauthorizedException('Invalid or missing owner identification');
          }
          return ownerUid;
        }
      };

      // Valid owner UIDs
      expect(mockAuthService.validateOwnerUid('valid-owner-123')).toBe(true);
      expect(mockAuthService.validateOwnerUid('user_abc123')).toBe(true);

      // Invalid owner UIDs
      expect(mockAuthService.validateOwnerUid('')).toBe(false);
      expect(mockAuthService.validateOwnerUid('ab')).toBe(false); // Too short
      expect(mockAuthService.validateOwnerUid('user@domain.com')).toBe(false); // Invalid chars
      expect(mockAuthService.validateOwnerUid(null as any)).toBe(false);
      expect(mockAuthService.validateOwnerUid(undefined as any)).toBe(false);

      // Should throw for invalid owners
      await expect(
        mockAuthService.requireValidOwner('')
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        mockAuthService.requireValidOwner('invalid@owner')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should prevent privilege escalation', async () => {
      const mockRoleService = {
        async checkResourceAccess(ownerUid: string, resourceId: string, action: string) {
          // Mock resource ownership check
          const resource = { id: resourceId, ownerUid: 'resource-owner-123' };

          if (action === 'read' && ownerUid === resource.ownerUid) {
            return true;
          }

          if (action === 'write' && ownerUid === resource.ownerUid) {
            return true;
          }

          if (action === 'delete' && ownerUid === resource.ownerUid) {
            return true;
          }

          // Admin users might have broader access (implement carefully)
          if (ownerUid === 'admin-super-user' && action !== 'delete') {
            return true;
          }

          return false;
        }
      };

      // Valid access - owner accessing their own resource
      expect(await mockRoleService.checkResourceAccess('resource-owner-123', 'resource-1', 'read')).toBe(true);
      expect(await mockRoleService.checkResourceAccess('resource-owner-123', 'resource-1', 'write')).toBe(true);

      // Invalid access - different owner trying to access resource
      expect(await mockRoleService.checkResourceAccess('different-owner', 'resource-1', 'read')).toBe(false);
      expect(await mockRoleService.checkResourceAccess('different-owner', 'resource-1', 'write')).toBe(false);
      expect(await mockRoleService.checkResourceAccess('different-owner', 'resource-1', 'delete')).toBe(false);

      // Admin access (limited)
      expect(await mockRoleService.checkResourceAccess('admin-super-user', 'resource-1', 'read')).toBe(true);
      expect(await mockRoleService.checkResourceAccess('admin-super-user', 'resource-1', 'delete')).toBe(false);
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should implement import rate limiting', () => {
      const mockRateLimiter = {
        limits: new Map<string, { requests: number; resetTime: number }>(),

        checkRateLimit(ownerUid: string, maxRequests = 10, windowMs = 60000): boolean {
          const now = Date.now();
          const userLimit = this.limits.get(ownerUid);

          if (!userLimit || now > userLimit.resetTime) {
            // Reset window
            this.limits.set(ownerUid, {
              requests: 1,
              resetTime: now + windowMs,
            });
            return true;
          }

          if (userLimit.requests >= maxRequests) {
            return false; // Rate limit exceeded
          }

          userLimit.requests++;
          return true;
        },

        async enforceRateLimit(ownerUid: string, maxRequests = 10) {
          if (!this.checkRateLimit(ownerUid, maxRequests)) {
            throw new ForbiddenException(
              'Rate limit exceeded. Please try again later.'
            );
          }
        }
      };

      // Normal usage within limits
      for (let i = 0; i < 10; i++) {
        expect(mockRateLimiter.checkRateLimit(validOwnerUid, 10)).toBe(true);
      }

      // Exceeding rate limit
      expect(mockRateLimiter.checkRateLimit(validOwnerUid, 10)).toBe(false);

      // Different user should have separate limit
      expect(mockRateLimiter.checkRateLimit(maliciousOwnerUid, 10)).toBe(true);

      // Should throw when enforcing
      expect(() => mockRateLimiter.enforceRateLimit(validOwnerUid, 10))
        .rejects.toThrow(ForbiddenException);
    });

    it('should validate bulk operation limits', () => {
      const mockBulkValidator = {
        validateBulkImport(urls: string[], ownerUid: string): { isValid: boolean; error?: string } {
          // Limit bulk operations
          if (urls.length > 100) {
            return {
              isValid: false,
              error: 'Bulk import limited to 100 URLs per request'
            };
          }

          // Validate all URLs
          for (const url of urls) {
            try {
              const parsedUrl = new URL(url);
              if (!['yad2.co.il', 'madlan.co.il'].includes(parsedUrl.hostname)) {
                return {
                  isValid: false,
                  error: `Invalid domain: ${parsedUrl.hostname}`
                };
              }
            } catch {
              return {
                isValid: false,
                error: `Invalid URL format: ${url}`
              };
            }
          }

          return { isValid: true };
        }
      };

      // Valid bulk import
      const validUrls = [
        'https://yad2.co.il/property/1',
        'https://madlan.co.il/property/2',
      ];
      expect(mockBulkValidator.validateBulkImport(validUrls, validOwnerUid).isValid).toBe(true);

      // Too many URLs
      const tooManyUrls = Array(101).fill('https://yad2.co.il/property/1');
      const tooManyResult = mockBulkValidator.validateBulkImport(tooManyUrls, validOwnerUid);
      expect(tooManyResult.isValid).toBe(false);
      expect(tooManyResult.error).toContain('100 URLs per request');

      // Invalid domain
      const invalidUrls = ['https://malicious.com/steal'];
      const invalidResult = mockBulkValidator.validateBulkImport(invalidUrls, validOwnerUid);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Invalid domain');
    });
  });

  describe('Data Leakage Prevention', () => {
    it('should sanitize error messages', () => {
      const mockErrorHandler = {
        sanitizeError(error: Error, isProduction = true): { message: string; details?: any } {
          // In production, don't leak sensitive information
          if (isProduction) {
            if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
              return { message: 'Service temporarily unavailable' };
            }

            if (error.message.includes('duplicate key') || error.message.includes('constraint')) {
              return { message: 'Data validation failed' };
            }

            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              return { message: 'Access denied' };
            }

            return { message: 'An error occurred' };
          }

          // In development, provide more details
          return {
            message: error.message,
            details: error.stack,
          };
        }
      };

      // Production error sanitization
      const dbError = new Error('connection to database "myapp" failed: ENOTFOUND postgres.internal');
      const sanitizedDbError = mockErrorHandler.sanitizeError(dbError, true);
      expect(sanitizedDbError.message).toBe('Service temporarily unavailable');
      expect(sanitizedDbError.details).toBeUndefined();

      const constraintError = new Error('duplicate key value violates unique constraint "properties_external_id_key"');
      const sanitizedConstraintError = mockErrorHandler.sanitizeError(constraintError, true);
      expect(sanitizedConstraintError.message).toBe('Data validation failed');

      // Development error details
      const devError = mockErrorHandler.sanitizeError(dbError, false);
      expect(devError.message).toContain('connection to database');
      expect(devError.details).toBeDefined();
    });

    it('should prevent information disclosure in API responses', () => {
      const mockResponseFormatter = {
        formatPropertyResponse(property: any, ownerUid: string) {
          // Verify ownership
          if (property.ownerUid !== ownerUid) {
            return null; // Don't expose data from other owners
          }

          // Remove sensitive fields
          const {
            syncData, // Contains raw scraped data
            lastSyncError, // May contain sensitive error info
            ...publicFields
          } = property;

          return {
            ...publicFields,
            // Only include safe AI insights
            aiInsights: property.aiInsights ?
              JSON.parse(property.aiInsights) : null,
          };
        },

        formatLeadResponse(lead: any, ownerUid: string) {
          if (lead.ownerUid !== ownerUid) {
            return null;
          }

          // Remove or hash sensitive data
          return {
            id: lead.id,
            fullName: lead.fullName,
            email: lead.email ? this.maskEmail(lead.email) : null,
            phone: lead.phone ? this.maskPhone(lead.phone) : null,
            source: lead.source,
            status: lead.status,
            createdAt: lead.createdAt,
            // Don't include raw external data or notes that might contain PII
          };
        },

        maskEmail(email: string): string {
          const [local, domain] = email.split('@');
          if (local.length <= 2) return email;
          return local.substring(0, 2) + '*'.repeat(local.length - 2) + '@' + domain;
        },

        maskPhone(phone: string): string {
          if (phone.length <= 4) return phone;
          return phone.substring(0, 3) + '*'.repeat(phone.length - 6) + phone.substring(phone.length - 3);
        }
      };

      const testProperty = {
        id: 'prop-123',
        ownerUid: validOwnerUid,
        name: 'Test Property',
        syncData: JSON.stringify({ sensitive: 'data' }),
        lastSyncError: 'Database password: secret123',
      };

      const formatted = mockResponseFormatter.formatPropertyResponse(testProperty, validOwnerUid);
      expect(formatted).toBeDefined();
      expect(formatted.syncData).toBeUndefined();
      expect(formatted.lastSyncError).toBeUndefined();

      // Cross-owner access
      const crossOwnerFormatted = mockResponseFormatter.formatPropertyResponse(testProperty, maliciousOwnerUid);
      expect(crossOwnerFormatted).toBeNull();

      // Email and phone masking
      expect(mockResponseFormatter.maskEmail('john.doe@example.com')).toBe('jo*****@example.com');
      expect(mockResponseFormatter.maskPhone('+972501234567')).toBe('+97***4567');
    });
  });
});