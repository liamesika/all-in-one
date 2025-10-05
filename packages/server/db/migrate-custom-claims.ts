#!/usr/bin/env node
/**
 * Migration Script: Add Firebase Custom Claims for Existing Users
 *
 * This script migrates existing users by setting their vertical as a Firebase custom claim.
 * This enables faster login routing by reading vertical from the token instead of querying the database.
 *
 * Usage:
 *   npx ts-node packages/server/db/migrate-custom-claims.ts
 *
 * Environment Variables Required:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - FIREBASE_* variables for Firebase Admin SDK
 */

import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';

const prisma = new PrismaClient();

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin initialized');
  }
  return admin;
}

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ userId: string; email: string; error: string }>;
}

async function migrateCustomClaims(): Promise<MigrationStats> {
  console.log('🔄 Starting Firebase Custom Claims Migration...\n');

  const stats: MigrationStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const firebaseAdmin = initializeFirebaseAdmin();

    // Fetch all users with their profiles
    console.log('📊 Fetching users from database...');
    const users = await prisma.user.findMany({
      include: {
        userProfile: true,
      },
    });

    stats.total = users.length;
    console.log(`Found ${stats.total} users to migrate\n`);

    // Migrate each user
    for (const user of users) {
      try {
        // Skip users without a profile or vertical
        if (!user.userProfile || !user.userProfile.defaultVertical) {
          console.log(`⏭️  Skipping user ${user.email} (no profile/vertical)`);
          stats.skipped++;
          continue;
        }

        const vertical = user.userProfile.defaultVertical;
        console.log(`🔄 Processing: ${user.email} (${vertical})...`);

        // Verify user exists in Firebase
        let firebaseUser;
        try {
          firebaseUser = await firebaseAdmin.auth().getUser(user.id);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            console.log(`⚠️  User ${user.email} not found in Firebase - skipping`);
            stats.skipped++;
            continue;
          }
          throw error;
        }

        // Check if custom claims already set
        if (firebaseUser.customClaims?.vertical === vertical) {
          console.log(`✓  User ${user.email} already has correct custom claims - skipping`);
          stats.skipped++;
          continue;
        }

        // Set custom claims
        await firebaseAdmin.auth().setCustomUserClaims(user.id, {
          vertical: vertical,
        });

        console.log(`✅ Success: ${user.email} → vertical: ${vertical}`);
        stats.success++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`❌ Failed: ${user.email} - ${error.message}`);
        stats.failed++;
        stats.errors.push({
          userId: user.id,
          email: user.email,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total Users:      ${stats.total}`);
    console.log(`✅ Successful:    ${stats.success}`);
    console.log(`⏭️  Skipped:       ${stats.skipped}`);
    console.log(`❌ Failed:        ${stats.failed}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    }

    return stats;

  } catch (error) {
    console.error('\n❌ Migration failed with critical error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  migrateCustomClaims()
    .then((stats) => {
      if (stats.failed > 0) {
        console.log('\n⚠️  Migration completed with errors');
        process.exit(1);
      } else {
        console.log('\n✅ Migration completed successfully');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateCustomClaims };
