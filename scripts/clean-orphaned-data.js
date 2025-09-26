#!/usr/bin/env node

/**
 * Clean Orphaned Data Script
 *
 * This script identifies and handles orphaned business records that reference
 * users who no longer exist in the system.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function cleanOrphanedData() {
  console.log('🧹 Cleaning Orphaned Data...\n');

  try {
    const cleanupResults = await prisma.$transaction(async (tx) => {
      // Find all orphaned records across business models
      const models = [
        { name: 'Property', table: tx.property },
        { name: 'RealEstateLead', table: tx.realEstateLead },
        { name: 'EcommerceLead', table: tx.ecommerceLead },
        { name: 'Campaign', table: tx.campaign },
        { name: 'AutoFollowupTemplate', table: tx.autoFollowupTemplate },
      ];

      const results = {};

      for (const { name, table } of models) {
        console.log(`🔍 Checking ${name} for orphaned records...`);

        // Find records with ownerUid that don't match any existing user
        const orphanedRecords = await tx.$queryRaw`
          SELECT t.id, t."ownerUid"
          FROM "${name}" t
          LEFT JOIN "User" u ON u.id = t."ownerUid"
          WHERE u.id IS NULL;
        `;

        if (orphanedRecords.length > 0) {
          console.log(`⚠️  Found ${orphanedRecords.length} orphaned ${name} records:`);
          orphanedRecords.forEach(record => {
            console.log(`  - ${record.id} (ownerUid: ${record.ownerUid})`);
          });

          // Delete the orphaned records
          const deleteResult = await tx.$executeRaw`
            DELETE FROM "${name}"
            WHERE "ownerUid" NOT IN (SELECT id FROM "User");
          `;

          console.log(`✅ Deleted ${deleteResult} orphaned ${name} records\n`);
          results[name] = { found: orphanedRecords.length, deleted: deleteResult };
        } else {
          console.log(`✅ No orphaned ${name} records found\n`);
          results[name] = { found: 0, deleted: 0 };
        }
      }

      return results;
    });

    // Summary
    console.log('📊 Cleanup Summary:');
    const totalFound = Object.values(cleanupResults).reduce((sum, result) => sum + result.found, 0);
    const totalDeleted = Object.values(cleanupResults).reduce((sum, result) => sum + result.deleted, 0);

    Object.entries(cleanupResults).forEach(([model, result]) => {
      if (result.found > 0) {
        console.log(`${model}: ${result.deleted}/${result.found} orphaned records cleaned`);
      } else {
        console.log(`${model}: Clean (no orphaned records)`);
      }
    });

    console.log(`\nTotal: ${totalDeleted}/${totalFound} orphaned records cleaned`);

    if (totalDeleted > 0) {
      console.log('\n🎉 Orphaned data cleanup completed successfully!');
      console.log('✅ Database is now consistent and ready for organization migration');
    } else {
      console.log('\n✅ No orphaned data found - database is already clean!');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  cleanOrphanedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { cleanOrphanedData };