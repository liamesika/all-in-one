// packages/server/db/seed-demo-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Demo users for different verticals
const DEMO_USERS = [
  {
    uid: 'demo-ecommerce-user',
    email: 'demo@ecommerce.effinity.com',
    displayName: 'Sarah Cohen',
    vertical: 'E_COMMERCE' as const,
  },
  {
    uid: 'demo-realestate-user',
    email: 'demo@realestate.effinity.com',
    displayName: 'David Levi',
    vertical: 'REAL_ESTATE' as const,
  },
  {
    uid: 'demo-law-user',
    email: 'demo@law.effinity.com',
    displayName: 'Rachel Goldberg',
    vertical: 'LAW' as const,
  },
];

// E-commerce leads with realistic data
const ECOMMERCE_LEADS = [
  // Hot leads (recent, high-value)
  {
    fullName: 'Michael Thompson',
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'michael.thompson@gmail.com',
    phone: '+1-555-0101',
    city: 'New York',
    status: 'QUALIFIED',
    score: 'HOT',
    source: 'FACEBOOK',
    sourceName: 'Summer Sale Campaign',
    budget: 2500,
    interests: ['electronics', 'gaming', 'tech'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    firstContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    utmSource: 'facebook',
    utmMedium: 'social',
    utmCampaign: 'summer-sale-2024',
  },
  {
    fullName: 'Jennifer Martinez',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jen.martinez@yahoo.com',
    phone: '+1-555-0102',
    city: 'Los Angeles',
    status: 'MEETING',
    score: 'HOT',
    source: 'GOOGLE_SHEETS',
    sourceName: 'Partner Referrals',
    budget: 1800,
    interests: ['fashion', 'lifestyle'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    firstContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    fullName: 'Robert Kim',
    firstName: 'Robert',
    lastName: 'Kim',
    email: 'robert.kim@outlook.com',
    phone: '+1-555-0103',
    city: 'Chicago',
    status: 'WON',
    score: 'HOT',
    source: 'INSTAGRAM',
    sourceName: 'Holiday Collection Ad',
    budget: 3200,
    interests: ['home-decor', 'furniture'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    firstContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },

  // Warm leads
  {
    fullName: 'Lisa Wang',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@gmail.com',
    phone: '+1-555-0104',
    city: 'Seattle',
    status: 'CONTACTED',
    score: 'WARM',
    source: 'CSV_UPLOAD',
    sourceName: 'Trade Show Leads',
    budget: 1200,
    interests: ['beauty', 'wellness'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    firstContactAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
  {
    fullName: 'James Wilson',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@hotmail.com',
    phone: '+1-555-0105',
    city: 'Miami',
    status: 'QUALIFIED',
    score: 'WARM',
    source: 'WHATSAPP',
    sourceName: 'Customer Referral',
    budget: 950,
    interests: ['sports', 'outdoor'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },

  // Cold leads and new ones
  {
    fullName: 'Amanda Davis',
    firstName: 'Amanda',
    lastName: 'Davis',
    email: 'amanda.davis@icloud.com',
    phone: '+1-555-0106',
    city: 'Denver',
    status: 'NEW',
    score: 'COLD',
    source: 'FACEBOOK',
    sourceName: 'Brand Awareness Campaign',
    budget: 600,
    interests: ['books', 'education'],
    phoneValid: 'PENDING',
    emailValid: 'VALID',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    fullName: 'Carlos Rodriguez',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos.rodriguez@protonmail.com',
    phone: '+1-555-0107',
    city: 'Phoenix',
    status: 'LOST',
    score: 'COLD',
    source: 'MANUAL',
    sourceName: 'Cold Call',
    budget: 400,
    interests: ['automotive'],
    phoneValid: 'INVALID',
    emailValid: 'VALID',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  },
  {
    fullName: 'Emma Johnson',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@gmail.com',
    phone: '+1-555-0108',
    city: 'Boston',
    status: 'NEW',
    score: 'WARM',
    source: 'INSTAGRAM',
    sourceName: 'Influencer Collaboration',
    budget: 1500,
    interests: ['fitness', 'nutrition'],
    phoneValid: 'VALID',
    emailValid: 'VALID',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
];

// E-commerce campaigns
const ECOMMERCE_CAMPAIGNS = [
  {
    name: 'Summer Sale 2024',
    platform: 'META',
    status: 'ACTIVE',
    goal: 'CONVERSIONS',
    budget: 5000,
    dailyBudget: 200,
    audience: {
      demographics: { age: '25-45', gender: 'all' },
      interests: ['shopping', 'electronics', 'fashion'],
      locations: ['US', 'CA', 'UK'],
    },
    creative: {
      headline: 'Summer Sale - Up to 50% Off!',
      description: 'Don\'t miss our biggest sale of the year',
      imageUrl: 'https://example.com/summer-sale.jpg',
    },
    spend: 2340,
    clicks: 1250,
    impressions: 45680,
    conversions: 89,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
  {
    name: 'Holiday Collection Launch',
    platform: 'INSTAGRAM',
    status: 'PAUSED',
    goal: 'BRAND_AWARENESS',
    budget: 3000,
    dailyBudget: 150,
    audience: {
      demographics: { age: '18-35', gender: 'female' },
      interests: ['fashion', 'lifestyle', 'shopping'],
      locations: ['US'],
    },
    creative: {
      headline: 'New Holiday Collection Available Now',
      description: 'Discover our latest styles for the season',
      imageUrl: 'https://example.com/holiday-collection.jpg',
    },
    spend: 1890,
    clicks: 890,
    impressions: 32450,
    conversions: 45,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  },
  {
    name: 'Retargeting - Abandoned Cart',
    platform: 'FACEBOOK',
    status: 'READY',
    goal: 'CONVERSIONS',
    budget: 2500,
    dailyBudget: 100,
    audience: {
      demographics: { age: '25-55', gender: 'all' },
      interests: ['previous visitors', 'abandoned cart'],
      locations: ['US', 'CA'],
    },
    creative: {
      headline: 'Complete Your Purchase - 10% Off',
      description: 'Your items are waiting! Complete your order now',
      imageUrl: 'https://example.com/retargeting.jpg',
    },
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    preflightChecks: {
      hasName: true,
      hasBudget: true,
      hasConnection: true,
      hasAudience: true,
      hasCreative: true,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

// Real Estate properties for the other vertical
const REAL_ESTATE_PROPERTIES = [
  {
    title: 'Modern 3BR Apartment in Downtown',
    description: 'Stunning modern apartment with city views, premium finishes, and rooftop access',
    propertyType: 'APARTMENT',
    status: 'PUBLISHED',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    address: '123 Main St, Downtown',
    city: 'Tel Aviv',
    neighborhood: 'City Center',
    latitude: 32.0853,
    longitude: 34.7818,
    amenities: ['parking', 'elevator', 'balcony', 'air-conditioning'],
    images: ['https://example.com/apt1.jpg', 'https://example.com/apt2.jpg'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    title: 'Luxury Villa with Pool',
    description: 'Spacious villa with private pool, garden, and premium location',
    propertyType: 'VILLA',
    status: 'PUBLISHED',
    price: 2400000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    address: '456 Garden Ave',
    city: 'Herzliya',
    neighborhood: 'Herzliya Pituach',
    latitude: 32.1624,
    longitude: 34.8096,
    amenities: ['pool', 'garden', 'garage', 'security'],
    images: ['https://example.com/villa1.jpg', 'https://example.com/villa2.jpg'],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  },
  {
    title: 'Cozy 2BR Near Beach',
    description: 'Charming apartment just 5 minutes walk from the beach',
    propertyType: 'APARTMENT',
    status: 'PUBLISHED',
    price: 620000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 900,
    address: '789 Coastal Rd',
    city: 'Netanya',
    neighborhood: 'City Center',
    latitude: 32.3215,
    longitude: 34.8532,
    amenities: ['near-beach', 'renovated', 'bright'],
    images: ['https://example.com/beach-apt1.jpg'],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
];

// Real Estate leads
const REAL_ESTATE_LEADS = [
  {
    fullName: 'Yossi Abraham',
    email: 'yossi.abraham@gmail.com',
    phone: '+972-52-555-0201',
    budget: 900000,
    lookingFor: 'apartment',
    bedrooms: 3,
    preferredCities: ['Tel Aviv', 'Ramat Gan'],
    status: 'HOT',
    notes: 'Looking for family apartment, needs parking',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    fullName: 'Rachel Cohen',
    email: 'rachel.cohen@outlook.com',
    phone: '+972-54-555-0202',
    budget: 1500000,
    lookingFor: 'house',
    bedrooms: 4,
    preferredCities: ['Herzliya', 'Kfar Saba'],
    status: 'WARM',
    notes: 'Investment property, flexible on location',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
];

export async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  try {
    // Clean existing demo data
    console.log('🧹 Cleaning existing demo data...');
    await prisma.ecommerceLead.deleteMany({
      where: { ownerUid: { in: DEMO_USERS.map(u => u.uid) } }
    });
    await prisma.campaign.deleteMany({
      where: { ownerUid: { in: DEMO_USERS.map(u => u.uid) } }
    });
    await prisma.property.deleteMany({
      where: { ownerUid: { in: DEMO_USERS.map(u => u.uid) } }
    });
    await prisma.realEstateLead.deleteMany({
      where: { ownerUid: { in: DEMO_USERS.map(u => u.uid) } }
    });

    // Seed E-commerce data
    console.log('🛍️ Seeding e-commerce data...');
    const ecommerceOwnerUid = DEMO_USERS[0].uid;

    // Create campaigns first
    const campaigns = [];
    for (const campaignData of ECOMMERCE_CAMPAIGNS) {
      const campaign = await prisma.campaign.create({
        data: {
          ...campaignData,
          ownerUid: ecommerceOwnerUid,
          updatedAt: new Date(),
        }
      });
      campaigns.push(campaign);
    }

    // Create leads and link some to campaigns
    for (const [index, leadData] of ECOMMERCE_LEADS.entries()) {
      await prisma.ecommerceLead.create({
        data: {
          ...leadData,
          ownerUid: ecommerceOwnerUid,
          // Link some leads to campaigns
          campaignId: index < 3 ? campaigns[0].id : index < 6 ? campaigns[1].id : undefined,
          isDuplicate: false,
          updatedAt: leadData.createdAt,
        }
      });
    }

    // Seed Real Estate data
    console.log('🏠 Seeding real estate data...');
    const realEstateOwnerUid = DEMO_USERS[1].uid;

    // Create properties
    for (const propertyData of REAL_ESTATE_PROPERTIES) {
      await prisma.property.create({
        data: {
          ...propertyData,
          ownerUid: realEstateOwnerUid,
          provider: 'MANUAL',
          updatedAt: propertyData.createdAt,
        }
      });
    }

    // Create real estate leads
    for (const leadData of REAL_ESTATE_LEADS) {
      await prisma.realEstateLead.create({
        data: {
          ...leadData,
          ownerUid: realEstateOwnerUid,
          source: 'MANUAL',
          updatedAt: leadData.createdAt,
        }
      });
    }

    console.log('✅ Demo data seeding completed successfully!');
    console.log(`📊 Created:
    - ${ECOMMERCE_LEADS.length} e-commerce leads
    - ${ECOMMERCE_CAMPAIGNS.length} campaigns
    - ${REAL_ESTATE_PROPERTIES.length} properties
    - ${REAL_ESTATE_LEADS.length} real estate leads

    🔑 Demo User IDs:
    - E-commerce: ${ecommerceOwnerUid}
    - Real Estate: ${realEstateOwnerUid}
    - Law: ${DEMO_USERS[2].uid}`);

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}