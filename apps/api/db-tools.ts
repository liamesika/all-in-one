#!/usr/bin/env ts-node

// Database management tools for development and testing
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;
const TERMS_VERSION = '1.0';

async function showUsage() {
  console.log(`
🛠️  Database Tools Usage:

npx ts-node db-tools.ts <command>

Commands:
  users               - List all users in database
  test-user           - Create/update test user with known password  
  test-login <email>  - Test login for specific user with common passwords
  help               - Show this help

Examples:
  npx ts-node db-tools.ts users
  npx ts-node db-tools.ts test-user
  npx ts-node db-tools.ts test-login test@example.com
`);
}

async function listUsers() {
  console.log('📊 Users in database:\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      userProfile: {
        select: {
          defaultVertical: true,
          termsConsentAt: true
        }
      }
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found in database!');
    return;
  }

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.fullName}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   🏭 Vertical: ${user.userProfile?.defaultVertical || 'Unknown'}`);
    console.log(`   📅 Created: ${user.createdAt}`);
    console.log('');
  });
}

async function createTestUser() {
  console.log('🔍 Creating/updating test user...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testFullName = 'Test User';

  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { userProfile: true, ownedOrgs: true }
  });

  if (existingUser) {
    const passwordHash = await bcrypt.hash(testPassword, BCRYPT_ROUNDS);
    
    await prisma.user.update({
      where: { email: testEmail },
      data: { passwordHash }
    });

    console.log('✅ Test user password updated!');
  } else {
    const passwordHash = await bcrypt.hash(testPassword, BCRYPT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: testFullName,
          email: testEmail,
          passwordHash,
          lang: 'en',
        },
      });

      const organization = await tx.organization.create({
        data: {
          ownerUid: user.id,
          name: `${testFullName}'s Organization`,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          ownerUid: organization.id,
          role: 'OWNER',
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
          defaultVertical: 'E_COMMERCE',
          termsConsentAt: new Date(),
          termsVersion: TERMS_VERSION,
        },
      });

      return { user, organization };
    });

    console.log('✅ Test user created!');
  }

  console.log(`\n📧 Email: ${testEmail}`);
  console.log(`🔑 Password: ${testPassword}`);
  console.log('\n🚀 You can now test login with these credentials!');
}

async function testLogin(email: string) {
  console.log(`🔍 Testing login for: ${email}\n`);
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      userProfile: { select: { defaultVertical: true } }
    }
  });

  if (!user) {
    console.log('❌ User not found!');
    return;
  }

  console.log(`👤 Found user: ${user.fullName}`);
  
  const commonPasswords = [
    'password', 'password123', '123456', 'admin', 'test',
    '1234', '12345678', 'qwerty', 'abc123', 'test123'
  ];

  console.log('🔑 Testing common passwords...\n');

  for (const password of commonPasswords) {
    try {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (isMatch) {
        console.log(`✅ PASSWORD FOUND: "${password}"`);
        console.log(`🏭 Vertical: ${user.userProfile?.defaultVertical}`);
        return;
      }
    } catch (error) {
      // Continue testing other passwords
    }
  }

  console.log('❌ No matching password found from common list');
  console.log('💡 Use "test-user" command to reset password to "password123"');
}

async function main() {
  const command = process.argv[2];
  const param = process.argv[3];

  try {
    switch (command) {
      case 'users':
        await listUsers();
        break;
      case 'test-user':
        await createTestUser();
        break;
      case 'test-login':
        if (!param) {
          console.log('❌ Please provide email: npx ts-node db-tools.ts test-login <email>');
          return;
        }
        await testLogin(param);
        break;
      case 'help':
        await showUsage();
        break;
      default:
        await showUsage();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}