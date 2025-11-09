export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


// Validation schema for creating integrations
const createIntegrationSchema = z.object({
  platform: z.enum([
    'HUBSPOT',
    'ZOHO',
    'MONDAY',
    'SALESFORCE',
    'GOOGLE_CALENDAR',
    'OUTLOOK_CALENDAR',
    'APPLE_CALENDAR',
    'FACEBOOK_LEADS',
    'INSTAGRAM_LEADS',
    'LINKEDIN_LEADS',
    'TIKTOK_LEADS',
    'GUESTY',
    'AIRBNB',
    'YAD2',
    'MADLAN',
    'ZILLOW',
    'ZAPIER',
    'MAKE',
    'CUSTOM_WEBHOOK',
  ]),
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
});

// GET /api/real-estate/integrations - List all integrations for user
export const GET = withAuth(async (request, { user }) => {
  try {
    // Get ownerUid from authenticated user
    const ownerUid = getOwnerUid(user);

    const integrations = await prisma.integration.findMany({
      where: { ownerUid },
      include: {
        syncLogs: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ integrations });
  } catch (error: any) {
    console.error('[Integrations API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
});

// POST /api/real-estate/integrations - Create new integration connection
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();

    // Get ownerUid from authenticated user
    const ownerUid = getOwnerUid(user);
    const orgId = request.headers.get('x-org-id') || null;

    // Validate input
    const result = createIntegrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const { platform, credentials, settings } = result.data;

    // Check if integration already exists for this user
    const existing = await prisma.integration.findFirst({
      where: {
        ownerUid,
        platform,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: 'Integration already exists',
          message: `You already have a ${platform} integration connected`,
        },
        { status: 409 }
      );
    }

    // Create integration
    const integration = await prisma.integration.create({
      data: {
        ownerUid,
        orgId,
        platform,
        status: 'DISCONNECTED', // Will be updated to CONNECTED after successful test
        credentials,
        settings,
      },
    });

    console.log('[Integrations API] Created integration:', integration.id);

    return NextResponse.json(integration, { status: 201 });
  } catch (error: any) {
    console.error('[Integrations API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create integration', details: error.message },
      { status: 500 }
    );
  }
});
