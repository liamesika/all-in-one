import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

// OAuth configuration for different platforms
const OAUTH_CONFIG: Record<
  string,
  {
    authUrl: string;
    scope: string;
    clientId?: string;
  }
> = {
  HUBSPOT: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    scope: 'contacts crm.objects.contacts.read crm.objects.contacts.write',
    clientId: process.env.HUBSPOT_CLIENT_ID,
  },
  GOOGLE_CALENDAR: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  FACEBOOK_LEADS: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scope: 'leads_retrieval pages_manage_ads',
    clientId: process.env.META_APP_ID,
  },
  INSTAGRAM_LEADS: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scope: 'instagram_basic instagram_manage_messages leads_retrieval',
    clientId: process.env.META_APP_ID,
  },
  ZOHO: {
    authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    scope: 'ZohoCRM.modules.ALL',
    clientId: process.env.ZOHO_CLIENT_ID,
  },
  SALESFORCE: {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    scope: 'api refresh_token',
    clientId: process.env.SALESFORCE_CLIENT_ID,
  },
  LINKEDIN_LEADS: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'r_liteprofile r_emailaddress w_member_social',
    clientId: process.env.LINKEDIN_CLIENT_ID,
  },
};

// GET /api/real-estate/integrations/oauth/[platform] - Initiate OAuth flow
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { platform } = params as { platform: string };
    const ownerUid = getOwnerUid(user);

    const config = OAUTH_CONFIG[platform.toUpperCase()];

    if (!config || !config.clientId) {
      return NextResponse.json(
        { error: 'OAuth not configured for this platform' },
        { status: 400 }
      );
    }

    // Build OAuth URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/real-estate/integrations/oauth/callback`;

    const params_obj = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: callbackUrl,
      scope: config.scope,
      response_type: 'code',
      state: JSON.stringify({ platform, ownerUid }), // Pass platform and user context
    });

    const authUrl = `${config.authUrl}?${params_obj.toString()}`;

    // Return redirect URL to client
    return NextResponse.json({
      authUrl,
      platform,
    });
  } catch (error: any) {
    console.error('[OAuth] Initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow', details: error.message },
      { status: 500 }
    );
  }
});
