#!/usr/bin/env node

/**
 * Verification Script for Organization Mode Migration
 *
 * This script validates the organization migration status and ensures data integrity
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function verifyMigration() {
  console.log('🔍 Verifying Organization Mode Migration Status\n');

  try {
    const verification = await prisma.$transaction(async (tx) => {
      // Check organizations
      const organizations = await tx.organization.findMany({
        include: { _count: { select: { memberships: true } } }
      });

      // Check memberships
      const memberships = await tx.membership.findMany({
        include: { user: { select: { email: true } } }
      });

      // Check business data migration status
      const businessDataStatus = {};

      try {
        businessDataStatus.properties = {
          total: await tx.property.count(),
          migrated: await tx.property.count({ where: { orgId: { not: null } } }),
          unmigrated: await tx.property.count({ where: { orgId: null } })
        };
      } catch (error) {
        businessDataStatus.properties = { error: 'orgId field not available yet' };
      }

      try {
        businessDataStatus.realEstateLeads = {
          total: await tx.realEstateLead.count(),
          migrated: await tx.realEstateLead.count({ where: { orgId: { not: null } } }),
          unmigrated: await tx.realEstateLead.count({ where: { orgId: null } })
        };
      } catch (error) {
        businessDataStatus.realEstateLeads = { error: 'orgId field not available yet' };
      }

      try {
        businessDataStatus.ecommerceLeads = {
          total: await tx.ecommerceLead.count(),
          migrated: await tx.ecommerceLead.count({ where: { orgId: { not: null } } }),
          unmigrated: await tx.ecommerceLead.count({ where: { orgId: null } })
        };
      } catch (error) {
        businessDataStatus.ecommerceLeads = { error: 'orgId field not available yet' };
      }

      try {
        businessDataStatus.campaigns = {
          total: await tx.campaign.count(),
          migrated: await tx.campaign.count({ where: { orgId: { not: null } } }),
          unmigrated: await tx.campaign.count({ where: { orgId: null } })
        };
      } catch (error) {
        businessDataStatus.campaigns = { error: 'orgId field not available yet' };
      }

      try {
        businessDataStatus.templates = {
          total: await tx.autoFollowupTemplate.count(),
          migrated: await tx.autoFollowupTemplate.count({ where: { orgId: { not: null } } }),
          unmigrated: await tx.autoFollowupTemplate.count({ where: { orgId: null } })
        };
      } catch (error) {
        businessDataStatus.templates = { error: 'orgId field not available yet' };
      }

      return { organizations, memberships, businessDataStatus };
    });

    // Report organizations
    console.log(`🏢 Organizations: ${verification.organizations.length}`);
    if (verification.organizations.length > 0) {
      console.log('\nOrganization Details:');
      verification.organizations.forEach(org => {
        console.log(`  - ${org.name} (${org.id})`);
        console.log(`    Slug: ${org.slug}`);
        console.log(`    Plan: ${org.planTier}`);
        console.log(`    Seats: ${org.usedSeats}/${org.seatLimit}`);
        console.log(`    Members: ${org._count.memberships}`);
        console.log('');
      });
    }

    // Report memberships
    console.log(`👥 Memberships: ${verification.memberships.length}`);
    if (verification.memberships.length > 0) {
      console.log('\nMembership Details:');
      verification.memberships.forEach(membership => {
        console.log(`  - ${membership.user.email}: ${membership.role} in ${membership.orgId}`);
      });
      console.log('');
    }

    // Report business data migration status
    console.log('📦 Business Data Migration Status:');
    Object.entries(verification.businessDataStatus).forEach(([model, status]) => {
      if (status.error) {
        console.log(`  ${model}: ⏳ Migration pending (${status.error})`);
      } else {
        const { total, migrated, unmigrated } = status;
        const percentage = total > 0 ? Math.round((migrated / total) * 100) : 0;
        console.log(`  ${model}: ${migrated}/${total} migrated (${percentage}%) - ${unmigrated} remaining`);
      }
    });

    // Migration status summary
    const allMigrated = Object.values(verification.businessDataStatus).every(status =>
      status.error || status.unmigrated === 0
    );

    console.log('\n📊 Migration Status Summary:');
    console.log(`Organizations: ${verification.organizations.length > 0 ? '✅' : '❌'}`);
    console.log(`Memberships: ${verification.memberships.length > 0 ? '✅' : '❌'}`);
    console.log(`Business Data: ${allMigrated ? '✅' : '⏳'}`);

    if (verification.organizations.length === 0) {
      console.log('\n⚠️  No organizations found. Run the backfill script first.');
      return false;
    }

    if (!allMigrated) {
      console.log('\n⚠️  Business data migration incomplete. Some records still need orgId assignment.');
      return false;
    }

    console.log('\n🎉 Organization mode migration verification complete!');
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('Error details:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyMigration()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = { verifyMigration };