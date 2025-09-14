// packages/server/db/simple-seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createDemoLeads() {
  console.log('🌱 Creating demo leads for analytics...');

  const demoOwnerUid = 'demo-ecommerce-user';

  try {
    // Clean existing demo leads
    await prisma.ecommerceLead.deleteMany({
      where: { ownerUid: demoOwnerUid }
    });

    // Create realistic demo leads with different statuses and dates
    const leads = [
      // Hot leads (recent, high-value)
      {
        ownerUid: demoOwnerUid,
        fullName: 'Michael Thompson',
        firstName: 'Michael',
        lastName: 'Thompson',
        email: 'michael@example.com',
        phone: '+1-555-0101',
        city: 'New York',
        status: 'QUALIFIED' as const,
        score: 'HOT' as const,
        source: 'FACEBOOK' as const,
        sourceName: 'Summer Sale Campaign',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        firstContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Jennifer Martinez',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer@example.com',
        phone: '+1-555-0102',
        city: 'Los Angeles',
        status: 'MEETING' as const,
        score: 'HOT' as const,
        source: 'INSTAGRAM' as const,
        sourceName: 'Holiday Campaign',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        firstContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Robert Kim',
        firstName: 'Robert',
        lastName: 'Kim',
        email: 'robert@example.com',
        phone: '+1-555-0103',
        city: 'Chicago',
        status: 'WON' as const,
        score: 'HOT' as const,
        source: 'GOOGLE_SHEETS' as const,
        sourceName: 'Partner Referral',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        firstContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },

      // Warm leads
      {
        ownerUid: demoOwnerUid,
        fullName: 'Lisa Wang',
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa@example.com',
        phone: '+1-555-0104',
        city: 'Seattle',
        status: 'CONTACTED' as const,
        score: 'WARM' as const,
        source: 'CSV_UPLOAD' as const,
        sourceName: 'Trade Show List',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        firstContactAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'James Wilson',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james@example.com',
        phone: '+1-555-0105',
        city: 'Miami',
        status: 'QUALIFIED' as const,
        score: 'WARM' as const,
        source: 'WHATSAPP' as const,
        sourceName: 'Customer Referral',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },

      // Cold leads and new ones
      {
        ownerUid: demoOwnerUid,
        fullName: 'Amanda Davis',
        firstName: 'Amanda',
        lastName: 'Davis',
        email: 'amanda@example.com',
        phone: '+1-555-0106',
        city: 'Denver',
        status: 'NEW' as const,
        score: 'COLD' as const,
        source: 'FACEBOOK' as const,
        sourceName: 'Brand Awareness Campaign',
        phoneValid: 'PENDING' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Carlos Rodriguez',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos@example.com',
        phone: '+1-555-0107',
        city: 'Phoenix',
        status: 'LOST' as const,
        score: 'COLD' as const,
        source: 'MANUAL' as const,
        sourceName: 'Cold Call',
        phoneValid: 'INVALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Emma Johnson',
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma@example.com',
        phone: '+1-555-0108',
        city: 'Boston',
        status: 'NEW' as const,
        score: 'WARM' as const,
        source: 'INSTAGRAM' as const,
        sourceName: 'Influencer Campaign',
        phoneValid: 'VALID' as const,
        emailValid: 'VALID' as const,
        isDuplicate: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];

    // Insert all leads
    for (const leadData of leads) {
      await prisma.ecommerceLead.create({ data: leadData });
    }

    console.log(`✅ Created ${leads.length} demo leads successfully!`);
    console.log(`🔑 Demo User ID: ${demoOwnerUid}`);

  } catch (error) {
    console.error('❌ Error creating demo leads:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createDemoLeads()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}