#!/usr/bin/env node

/**
 * Backfill Script for Organization Mode Migration
 *
 * This script migrates existing data to the organization-scoped model:
 * 1. Creates personal organizations for existing users
 * 2. Creates owner memberships for each user
 * 3. Migrates business data to be organization-scoped
 * 4. Maintains backward compatibility with ownerUid
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🚀 Starting Organization Mode Migration...\n');

  try {
    // Step 1: Get all existing users
    console.log('📊 Analyzing existing data...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    console.log(`Found ${users.length} users to migrate\n`);

    // Step 2: Create personal organizations for users who don't have one
    console.log('🏢 Creating personal organizations...');
    let organizationsCreated = 0;
    let membershipsCreated = 0;

    for (const user of users) {
      const tx = await prisma.$transaction(async (tx) => {
        // Check if user already has an organization
        const existingOrg = await tx.organization.findFirst({
          where: { ownerUserId: user.id }
        });

        if (existingOrg) {
          console.log(`⚠️  Organization already exists for user ${user.email}`);
          return { orgId: existingOrg.id, created: false };
        }

        // Create personal organization
        const slug = `personal-${user.id}`;
        const organization = await tx.organization.create({
          data: {
            id: `org_${user.id}`,
            ownerUid: user.id, // Backward compatibility
            name: `${user.fullName}'s Organization`,
            slug,
            seatLimit: 1,
            usedSeats: 1,
            planTier: 'PERSONAL',
            ownerUserId: user.id,
            domainAllowlist: [],
          },
        });

        // Create owner membership
        await tx.membership.create({
          data: {
            id: `mem_${user.id}`,
            userId: user.id,
            orgId: organization.id,
            ownerUid: user.id, // Backward compatibility
            role: 'OWNER',
            status: 'ACTIVE',
            acceptedAt: new Date(),
          },
        });

        return { orgId: organization.id, created: true };
      });

      if (tx.created) {
        organizationsCreated++;
        membershipsCreated++;
        console.log(`✅ Created organization for ${user.email}`);
      }
    }

    console.log(`\n📈 Organizations created: ${organizationsCreated}`);
    console.log(`📈 Memberships created: ${membershipsCreated}\n`);

    // Step 3: Migrate business data
    console.log('📦 Migrating business data to organization scope...\n');

    // Migrate Properties using raw SQL
    console.log('🏠 Migrating Properties...');
    const propertiesResult = await prisma.$executeRaw`
      UPDATE "Property"
      SET "orgId" = CONCAT('org_', "ownerUid")
      WHERE "orgId" IS NULL;
    `;
    console.log(`✅ Updated ${propertiesResult} properties\n`);

    // Migrate RealEstateLeads
    console.log('🎯 Migrating Real Estate Leads...');
    const realEstateLeadsResult = await prisma.$executeRaw`
      UPDATE "RealEstateLead"
      SET "orgId" = CONCAT('org_', "ownerUid")
      WHERE "orgId" IS NULL;
    `;
    console.log(`✅ Updated ${realEstateLeadsResult} real estate leads\n`);

    // Migrate EcommerceLeads
    console.log('🛒 Migrating E-commerce Leads...');
    const ecommerceLeadsResult = await prisma.$executeRaw`
      UPDATE "EcommerceLead"
      SET "orgId" = CONCAT('org_', "ownerUid")
      WHERE "orgId" IS NULL;
    `;
    console.log(`✅ Updated ${ecommerceLeadsResult} e-commerce leads\n`);

    // Migrate Campaigns
    console.log('📢 Migrating Campaigns...');
    const campaignsResult = await prisma.$executeRaw`
      UPDATE "Campaign"
      SET "orgId" = CONCAT('org_', "ownerUid")
      WHERE "orgId" IS NULL;
    `;
    console.log(`✅ Updated ${campaignsResult} campaigns\n`);

    // Migrate AutoFollowupTemplates
    console.log('📧 Migrating Auto-followup Templates...');
    const templatesResult = await prisma.$executeRaw`
      UPDATE "AutoFollowupTemplate"
      SET "orgId" = CONCAT('org_', "ownerUid")
      WHERE "orgId" IS NULL;
    `;
    console.log(`✅ Updated ${templatesResult} followup templates\n`);

    // Step 4: Validate migration
    console.log('🔍 Validating migration...');

    const validation = await prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count();
      const totalOrganizations = await tx.organization.count();
      const totalMemberships = await tx.membership.count();

      const unmigrated = {
        properties: await tx.property.count({ where: { orgId: null } }),
        realEstateLeads: await tx.realEstateLead.count({ where: { orgId: null } }),
        ecommerceLeads: await tx.ecommerceLead.count({ where: { orgId: null } }),
        campaigns: await tx.campaign.count({ where: { orgId: null } }),
        templates: await tx.autoFollowupTemplate.count({ where: { orgId: null } }),
      };

      return { totalUsers, totalOrganizations, totalMemberships, unmigrated };
    });

    console.log('\n📊 Migration Summary:');
    console.log(`👥 Total Users: ${validation.totalUsers}`);
    console.log(`🏢 Total Organizations: ${validation.totalOrganizations}`);
    console.log(`👥 Total Memberships: ${validation.totalMemberships}`);

    console.log('\n🔍 Unmigrated Records:');
    Object.entries(validation.unmigrated).forEach(([model, count]) => {
      if (count > 0) {
        console.log(`❌ ${model}: ${count} records still need migration`);
      } else {
        console.log(`✅ ${model}: All migrated`);
      }
    });

    const totalUnmigrated = Object.values(validation.unmigrated).reduce((sum, count) => sum + count, 0);

    if (totalUnmigrated === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('✅ All data has been migrated to organization scope');
      console.log('✅ Backward compatibility maintained with ownerUid');
    } else {
      console.log(`\n⚠️  Migration incomplete: ${totalUnmigrated} records still need migration`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative migration strategy using raw SQL for better performance
async function migrateWithRawSQL() {
  console.log('🚀 Starting Organization Mode Migration with Raw SQL...\n');

  try {
    // Step 1: Create organizations for users who don't have them
    await prisma.$executeRaw`
      INSERT INTO "Organization" (id, "ownerUid", name, slug, "seatLimit", "usedSeats", "planTier", "ownerUserId", "domainAllowlist", "createdAt", "updatedAt")
      SELECT
        CONCAT('org_', u.id),
        u.id,
        CONCAT(u."fullName", '''s Organization'),
        CONCAT('personal-', u.id),
        1,
        1,
        'PERSONAL'::"OrganizationTier",
        u.id,
        ARRAY[]::text[],
        NOW(),
        NOW()
      FROM "User" u
      LEFT JOIN "Organization" o ON o."ownerUserId" = u.id
      WHERE o.id IS NULL;
    `;

    // Step 2: Create owner memberships
    await prisma.$executeRaw`
      INSERT INTO "Membership" (id, "userId", "orgId", "ownerUid", role, status, "acceptedAt", "createdAt", "updatedAt")
      SELECT
        CONCAT('mem_', u.id),
        u.id,
        CONCAT('org_', u.id),
        u.id,
        'OWNER'::"MembershipRole",
        'ACTIVE'::"MembershipStatus",
        NOW(),
        NOW(),
        NOW()
      FROM "User" u
      LEFT JOIN "Membership" m ON m."userId" = u.id AND m."orgId" = CONCAT('org_', u.id)
      WHERE m.id IS NULL;
    `;

    // Step 3: Migrate business data
    console.log('Migrating Property...');
    await prisma.$executeRaw`UPDATE "Property" SET "orgId" = CONCAT('org_', "ownerUid") WHERE "orgId" IS NULL;`;

    console.log('Migrating RealEstateLead...');
    await prisma.$executeRaw`UPDATE "RealEstateLead" SET "orgId" = CONCAT('org_', "ownerUid") WHERE "orgId" IS NULL;`;

    console.log('Migrating EcommerceLead...');
    await prisma.$executeRaw`UPDATE "EcommerceLead" SET "orgId" = CONCAT('org_', "ownerUid") WHERE "orgId" IS NULL;`;

    console.log('Migrating Campaign...');
    await prisma.$executeRaw`UPDATE "Campaign" SET "orgId" = CONCAT('org_', "ownerUid") WHERE "orgId" IS NULL;`;

    console.log('Migrating AutoFollowupTemplate...');
    await prisma.$executeRaw`UPDATE "AutoFollowupTemplate" SET "orgId" = CONCAT('org_', "ownerUid") WHERE "orgId" IS NULL;`;

    console.log('\n🎉 Raw SQL Migration completed successfully!');

  } catch (error) {
    console.error('❌ Raw SQL Migration failed:', error);
    throw error;
  }
}

// Dry-run function for validation
async function dryRun() {
  console.log('🔍 DRY RUN: Organization Mode Migration Analysis\n');

  try {
    // Step 1: Analyze existing data
    console.log('📊 Analyzing existing data...');
    const analysis = await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        select: { id: true, email: true, fullName: true, createdAt: true },
      });

      // Check if organization tables exist (they may not exist yet)
      let existingOrgs = 0;
      let existingMemberships = 0;

      try {
        existingOrgs = await tx.organization.count();
        existingMemberships = await tx.membership.count();
      } catch (error) {
        console.log('ℹ️  Organization tables don\'t exist yet - migration will create them');
      }

      // Count business data (without orgId filtering since it may not exist yet)
      const businessData = {
        properties: await tx.property.count(),
        realEstateLeads: await tx.realEstateLead.count(),
        ecommerceLeads: await tx.ecommerceLead.count(),
        campaigns: await tx.campaign.count(),
        templates: await tx.autoFollowupTemplate.count(),
      };

      return { users, existingOrgs, existingMemberships, businessData };
    });

    console.log(`\n📈 Current State:`);
    console.log(`👥 Total Users: ${analysis.users.length}`);
    console.log(`🏢 Existing Organizations: ${analysis.existingOrgs}`);
    console.log(`👥 Existing Memberships: ${analysis.existingMemberships}`);

    console.log(`\n📦 Business Data (to be migrated):`);
    Object.entries(analysis.businessData).forEach(([key, value]) => {
      console.log(`${key}: ${value} records need organization assignment`);
    });

    // Step 2: Migration preview
    console.log(`\n🔮 Migration Preview:`);
    const usersNeedingOrgs = analysis.users.filter(user => {
      // If no organizations exist yet, all users need one
      if (analysis.existingOrgs === 0) return true;
      // Otherwise, more complex logic would be needed to check existing assignments
      return true;
    });

    console.log(`📋 Will create ${usersNeedingOrgs.length} personal organizations`);
    console.log(`📋 Will create ${usersNeedingOrgs.length} owner memberships`);

    console.log('\n👥 User Examples:');
    usersNeedingOrgs.slice(0, 5).forEach(user => {
      console.log(`  - org_${user.id}: "${user.fullName}'s Organization" for ${user.email}`);
    });
    if (usersNeedingOrgs.length > 5) {
      console.log(`  ... and ${usersNeedingOrgs.length - 5} more`);
    }

    // Step 3: Migration readiness check
    console.log(`\n🔧 Migration Readiness:`);
    console.log(`✅ Database connection established`);
    console.log(`✅ ${analysis.users.length} users found for personal org creation`);
    console.log(`✅ ${Object.values(analysis.businessData).reduce((sum, count) => sum + count, 0)} business records ready for org assignment`);

    console.log('\n✅ Dry run completed successfully!');
    console.log('🚀 Ready to apply database migration and run backfill');
    console.log('\nNext steps:');
    console.log('1. Apply database migration: yarn prisma migrate deploy');
    console.log('2. Run backfill script: node scripts/backfill-organization-data.js');

  } catch (error) {
    console.error('❌ Dry run failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  const useRawSQL = process.argv.includes('--raw-sql');
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    dryRun()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (useRawSQL) {
    migrateWithRawSQL()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    main()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { main, migrateWithRawSQL };