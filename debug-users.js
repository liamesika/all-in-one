const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_YMBkwuxOog39@ep-ancient-forest-abbm91ja-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function main() {
  try {
    console.log('🔍 Checking users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        userProfile: {
          select: {
            defaultVertical: true
          }
        }
      },
      take: 10
    });

    console.log('📊 Found users:', users);

    console.log('\n🔍 Checking organizations...');
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        ownerUid: true,
        name: true
      },
      take: 10
    });

    console.log('📊 Found organizations:', orgs);

    console.log('\n🔍 Checking e-commerce leads...');
    const leads = await prisma.ecommerceLead.findMany({
      select: {
        id: true,
        ownerUid: true,
        email: true,
        createdAt: true
      },
      take: 5
    });

    console.log('📊 Found leads:', leads);

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();