/**
 * Database test utilities for managing test data isolation
 */

import { PrismaService } from '../lib/prisma.service';

export class DatabaseTestHelper {
  constructor(private prisma: PrismaService) {}

  /**
   * Clean up all test data - use with caution!
   */
  async cleanupTestData(): Promise<void> {
    // Order matters due to foreign key constraints
    const cleanupOrder = [
      'leadEvent',
      'leadActivity', 
      'ecommerceLead',
      'realEstateLead',
      'searchJob',
      'listing',
      'savedSearch',
      'membership',
      'userProfile',
      'emailVerification',
      'organization',
      'user'
    ];

    for (const model of cleanupOrder) {
      await (this.prisma as any)[model].deleteMany({});
    }
  }

  /**
   * Create a test user with organization and profile
   */
  async createTestUser(overrides: Partial<{
    id: string;
    email: string;
    fullName: string;
    lang: string;
    passwordHash: string;
    vertical: string;
  }> = {}) {
    const userData = {
      id: overrides.id || 'test-user-id',
      email: overrides.email || 'test@example.com',
      fullName: overrides.fullName || 'Test User',
      lang: overrides.lang || 'en',
      passwordHash: overrides.passwordHash || '$2b$04$test.hash.for.testing.purposes',
      ...overrides
    };

    const user = await this.prisma.user.create({
      data: userData
    });

    const organization = await this.prisma.organization.create({
      data: {
        ownerUid: user.id,
        name: `${userData.fullName}'s Organization`
      }
    });

    await this.prisma.membership.create({
      data: {
        userId: user.id,
        ownerUid: organization.id,
        role: 'OWNER'
      }
    });

    const userProfile = await this.prisma.userProfile.create({
      data: {
        userId: user.id,
        defaultVertical: overrides.vertical || 'E_COMMERCE',
        termsConsentAt: new Date(),
        termsVersion: '1.0'
      }
    });

    return { user, organization, userProfile };
  }

  /**
   * Create test real estate leads
   */
  async createTestRealEstateLeads(ownerUid: string, count: number = 3) {
    const leads = [];
    for (let i = 0; i < count; i++) {
      const lead = await (this.prisma as any).realEstateLead.create({
        data: {
          ownerUid,
          clientName: `Test Client ${i + 1}`,
          email: `client${i + 1}@test.com`,
          phone: `+1234567890${i}`,
          propertyType: i % 2 === 0 ? 'APARTMENT' : 'HOUSE',
          city: i % 2 === 0 ? 'Tel Aviv' : 'Jerusalem',
          budgetMin: 500000 + (i * 100000),
          budgetMax: 800000 + (i * 100000),
          status: i === 0 ? 'NEW' : i === 1 ? 'CONTACTED' : 'MEETING',
          source: 'TEST',
          notes: `Test lead ${i + 1} notes`
        }
      });
      leads.push(lead);
    }
    return leads;
  }

  /**
   * Create test e-commerce leads
   */
  async createTestEcommerceLeads(ownerUid: string, count: number = 3) {
    const leads = [];
    for (let i = 0; i < count; i++) {
      const lead = await this.prisma.ecommerceLead.create({
        data: {
          ownerUid,
          firstName: `Test${i + 1}`,
          lastName: `User${i + 1}`,
          email: `ecom${i + 1}@test.com`,
          phone: `+1234567890${i}`,
          status: i === 0 ? 'NEW' : i === 1 ? 'CONTACTED' : 'CONVERTED',
          source: 'TEST',
          notes: `E-commerce lead ${i + 1} notes`
        }
      });
      leads.push(lead);
    }
    return leads;
  }

  /**
   * Verify data isolation - ensure user can only see their own data
   */
  async verifyDataIsolation(userAId: string, userBId: string): Promise<boolean> {
    // Create test data for user A
    await this.createTestRealEstateLeads(userAId, 2);
    await this.createTestEcommerceLeads(userAId, 2);

    // Create test data for user B
    await this.createTestRealEstateLeads(userBId, 1);
    await this.createTestEcommerceLeads(userBId, 1);

    // Verify user A can only see their data
    const userAReLeads = await (this.prisma as any).realEstateLead.findMany({
      where: { ownerUid: userAId }
    });
    const userAEcomLeads = await this.prisma.ecommerceLead.findMany({
      where: { ownerUid: userAId }
    });

    // Verify user B can only see their data
    const userBReLeads = await (this.prisma as any).realEstateLead.findMany({
      where: { ownerUid: userBId }
    });
    const userBEcomLeads = await this.prisma.ecommerceLead.findMany({
      where: { ownerUid: userBId }
    });

    return userAReLeads.length === 2 && 
           userAEcomLeads.length === 2 && 
           userBReLeads.length === 1 && 
           userBEcomLeads.length === 1;
  }
}