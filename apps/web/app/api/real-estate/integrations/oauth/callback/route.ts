import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/real-estate/integrations/oauth/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[OAuth Callback] Error:', error);
      return NextResponse.redirect(
        new URL(
          `/dashboard/real-estate/integrations?error=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Parse state to get platform and user context
    const { platform, ownerUid } = JSON.parse(state);

    // TODO: Exchange authorization code for access token
    // This would be platform-specific and require API calls to each platform
    // For MVP, we'll just mark the integration as connected

    // Find or create integration
    let integration = await prisma.integration.findFirst({
      where: {
        ownerUid,
        platform,
      },
    });

    if (integration) {
      // Update existing integration
      integration = await prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: 'CONNECTED',
          credentials: {
            code, // Store authorization code temporarily
            connectedAt: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });
    } else {
      // Create new integration
      integration = await prisma.integration.create({
        data: {
          ownerUid,
          platform,
          status: 'CONNECTED',
          credentials: {
            code,
            connectedAt: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });
    }

    console.log('[OAuth Callback] Connected integration:', integration.id);

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      new URL(
        `/dashboard/real-estate/integrations?success=true&platform=${platform}`,
        request.url
      )
    );
  } catch (error: any) {
    console.error('[OAuth Callback] Error:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/real-estate/integrations?error=callback_failed`,
        request.url
      )
    );
  }
}
