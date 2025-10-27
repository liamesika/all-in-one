import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/cleanup
 * Admin-only route to clean up demo/seed data from the database
 *
 * IMPORTANT: This route should only be accessible to admin users
 * Set ADMIN_UIDS environment variable with comma-separated UIDs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Check if user is admin
    const adminUids = (process.env.ADMIN_UIDS || '').split(',').map(uid => uid.trim());
    if (!adminUids.includes(ownerUid)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log(`[Admin Cleanup] Started by user: ${ownerUid}`);

    // Get cleanup mode from request body
    const body = await request.json();
    const mode = body.mode || 'demo_only'; // 'demo_only' | 'all_seed_data' | 'reset_stats'

    const results = {
      mode,
      deletedUsers: 0,
      deletedOrganizations: 0,
      deletedMemberships: 0,
      deletedStats: 0,
      resetStats: 0,
      timestamp: new Date().toISOString(),
    };

    switch (mode) {
      case 'demo_only':
        // Remove demo@example.com and related data
        const demoUsers = await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: 'demo@example.com' } },
              { email: { contains: 'test@example.com' } },
              { displayName: { contains: 'Demo User' } },
            ],
          },
        });

        for (const user of demoUsers) {
          // Delete user's memberships and organizations
          await prisma.membership.deleteMany({
            where: { userId: user.id },
          });

          // Note: Organizations will cascade delete due to Prisma relations
        }

        // Delete demo users
        results.deletedUsers = await prisma.user.deleteMany({
          where: {
            OR: [
              { email: { contains: 'demo@example.com' } },
              { email: { contains: 'test@example.com' } },
              { displayName: { contains: 'Demo User' } },
            ],
          },
        }).then(res => res.count);

        console.log(`[Admin Cleanup] Deleted ${results.deletedUsers} demo users`);
        break;

      case 'all_seed_data':
        // WARNING: This deletes ALL seed data (use with extreme caution)
        // Only delete organizations with specific seed markers
        const seedOrgs = await prisma.organization.findMany({
          where: {
            OR: [
              { name: { contains: 'Seed' } },
              { name: { contains: 'Demo' } },
              { name: { contains: 'Test' } },
            ],
          },
        });

        results.deletedOrganizations = seedOrgs.length;

        for (const org of seedOrgs) {
          // Delete all related data (memberships, stats, etc.)
          await prisma.membership.deleteMany({
            where: { orgId: org.id },
          });

          // Delete organization (cascade deletes related entities)
          await prisma.organization.delete({
            where: { id: org.id },
          });
        }

        console.log(`[Admin Cleanup] Deleted ${results.deletedOrganizations} seed organizations`);
        break;

      case 'reset_stats':
        // Reset all Stats documents to zero (keeps structure, removes data)
        const statsRecords = await prisma.stats.findMany();

        for (const stat of statsRecords) {
          await prisma.stats.update({
            where: { id: stat.id },
            data: {
              tutorialsCompleted: 0,
              productsUploaded: 0,
              aiImagesGenerated: 0,
              csvSessionsCompleted: 0,
              campaignBriefsCreated: 0,
              shopifyConnected: false,
              tutorialTasks: [],
              // Keep user references intact
            },
          });
        }

        results.resetStats = statsRecords.length;
        console.log(`[Admin Cleanup] Reset ${results.resetStats} stats records to zero`);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cleanup mode. Use: demo_only, all_seed_data, or reset_stats' },
          { status: 400 }
        );
    }

    console.log(`[Admin Cleanup] Completed:`, results);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results,
    });

  } catch (error: any) {
    console.error('[POST /api/admin/cleanup] Error:', error);

    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup
 * Get cleanup status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Check if user is admin
    const adminUids = (process.env.ADMIN_UIDS || '').split(',').map(uid => uid.trim());
    if (!adminUids.includes(ownerUid)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Count demo/test data
    const demoUserCount = await prisma.user.count({
      where: {
        OR: [
          { email: { contains: 'demo@example.com' } },
          { email: { contains: 'test@example.com' } },
          { displayName: { contains: 'Demo User' } },
        ],
      },
    });

    const seedOrgCount = await prisma.organization.count({
      where: {
        OR: [
          { name: { contains: 'Seed' } },
          { name: { contains: 'Demo' } },
          { name: { contains: 'Test' } },
        ],
      },
    });

    const totalStats = await prisma.stats.count();

    return NextResponse.json({
      demo_users: demoUserCount,
      seed_organizations: seedOrgCount,
      total_stats: totalStats,
      cleanup_modes: ['demo_only', 'all_seed_data', 'reset_stats'],
    });

  } catch (error: any) {
    console.error('[GET /api/admin/cleanup] Error:', error);

    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get cleanup status' },
      { status: 500 }
    );
  }
}
