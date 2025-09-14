// packages/server/db/seed-real-estate-data.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRealEstateData() {
  console.log('🏠 Creating real estate demo data...');

  const demoOwnerUid = 'demo-realestate-user';

  try {
    // Clean existing demo data
    await prisma.realEstateLead.deleteMany({
      where: { ownerUid: demoOwnerUid }
    });
    await prisma.property.deleteMany({
      where: { ownerUid: demoOwnerUid }
    });

    // Create realistic real estate leads (matching actual schema)
    const leads = [
      {
        ownerUid: demoOwnerUid,
        fullName: 'Yossi Abraham',
        email: 'yossi.abraham@gmail.com',
        phone: '+972-52-555-0201',
        message: 'Looking for family apartment in Tel Aviv, 3BR, needs parking',
        source: 'FACEBOOK',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Rachel Cohen',
        email: 'rachel.cohen@outlook.com',
        phone: '+972-54-555-0202',
        message: 'Investment property, looking for 4BR house in Herzliya or Kfar Saba',
        source: 'GOOGLE',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'David Goldberg',
        email: 'david.goldberg@gmail.com',
        phone: '+972-50-555-0203',
        message: 'First-time buyer, looking for 2BR apartment in Netanya',
        source: 'MANUAL',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Sarah Levi',
        email: 'sarah.levi@yahoo.com',
        phone: '+972-53-555-0204',
        message: 'High-end penthouse in Tel Aviv, 5 bedrooms, urgent need',
        source: 'REFERRAL',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        fullName: 'Michael Green',
        email: 'michael.green@gmail.com',
        phone: '+972-52-555-0205',
        message: 'Young professional needs studio in Tel Aviv or Jaffa, close to work',
        source: 'INSTAGRAM',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      }
    ];

    // Create realistic properties (matching actual schema)
    const properties = [
      {
        ownerUid: demoOwnerUid,
        name: 'Modern 3BR Apartment in Downtown Tel Aviv',
        description: 'Stunning modern apartment with city views, premium finishes, and rooftop access',
        status: 'PUBLISHED',
        price: 850000,
        rooms: 3,
        size: 1200,
        address: '123 Dizengoff St, Tel Aviv',
        city: 'Tel Aviv',
        neighborhood: 'City Center',
        amenities: 'parking, elevator, balcony, air-conditioning',
        provider: 'MANUAL',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        name: 'Luxury Villa with Pool in Herzliya',
        description: 'Spacious villa with private pool, garden, and premium location',
        status: 'PUBLISHED',
        price: 2400000,
        rooms: 5,
        size: 3200,
        address: '456 Gordon St, Herzliya',
        city: 'Herzliya',
        neighborhood: 'Herzliya Pituach',
        amenities: 'pool, garden, garage, security',
        provider: 'MANUAL',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        name: 'Cozy 2BR Near Beach in Netanya',
        description: 'Charming apartment just 5 minutes walk from the beach',
        status: 'PUBLISHED',
        price: 620000,
        rooms: 2,
        size: 900,
        address: '789 HaAtzmaut Blvd, Netanya',
        city: 'Netanya',
        neighborhood: 'City Center',
        amenities: 'near-beach, renovated, bright',
        provider: 'MANUAL',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        ownerUid: demoOwnerUid,
        name: 'Penthouse with Panoramic Views',
        description: 'Exclusive penthouse with 360-degree city and sea views',
        status: 'DRAFT',
        price: 3500000,
        rooms: 4,
        size: 2800,
        address: '100 Rothschild Blvd, Tel Aviv',
        city: 'Tel Aviv',
        neighborhood: 'Rothschild',
        amenities: 'penthouse, panoramic-views, luxury-finishes, private-elevator',
        provider: 'MANUAL',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    ];

    // Insert all leads
    for (const leadData of leads) {
      await prisma.realEstateLead.create({ data: leadData });
    }

    // Insert all properties
    for (const propertyData of properties) {
      await prisma.property.create({ data: propertyData });
    }

    console.log(`✅ Created ${leads.length} real estate leads and ${properties.length} properties successfully!`);
    console.log(`🔑 Demo Real Estate User ID: ${demoOwnerUid}`);

  } catch (error) {
    console.error('❌ Error creating real estate demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createRealEstateData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createRealEstateData };