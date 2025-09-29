import { NextRequest, NextResponse } from 'next/server';

// Mock campaigns data for development
const mockCampaigns = [
  {
    id: '1',
    name: 'Spring Real Estate Campaign',
    platform: 'META' as const,
    status: 'ACTIVE' as const,
    goal: 'LEADS' as const,
    budget: 5000,
    dailyBudget: 200,
    audience: {
      locations: ['Israel'],
      ages: [25, 55],
      interests: ['Real Estate', 'Property Investment']
    },
    creative: {
      headline: 'Find Your Dream Home',
      description: 'Browse thousands of properties in Israel',
      imageUrl: '/campaign-image-1.jpg'
    },
    platformCampaignId: 'meta-camp-123',
    platformAdSetId: 'meta-adset-456',
    spend: 2450,
    clicks: 1235,
    impressions: 45600,
    conversions: 89,
    startDate: '2025-09-01T00:00:00Z',
    endDate: '2025-12-01T00:00:00Z',
    preflightChecks: {
      audience: 'passed',
      creative: 'passed',
      budget: 'passed'
    },
    lastCheckAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    connection: {
      id: 'conn-1',
      platform: 'META' as const,
      status: 'CONNECTED',
      accountName: 'Effinity Real Estate'
    },
    _count: {
      leads: 89
    }
  },
  {
    id: '2',
    name: 'Google Search - Property Leads',
    platform: 'GOOGLE' as const,
    status: 'READY' as const,
    goal: 'CONVERSIONS' as const,
    budget: 3000,
    dailyBudget: 100,
    audience: {
      locations: ['Tel Aviv', 'Jerusalem'],
      keywords: ['apartment for sale', 'buy property israel']
    },
    creative: {
      headline: 'Properties in Tel Aviv',
      description: 'Best deals on apartments and houses',
      landingPageUrl: '/properties'
    },
    platformCampaignId: null,
    platformAdSetId: null,
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    startDate: null,
    endDate: null,
    preflightChecks: {
      audience: 'passed',
      creative: 'passed',
      budget: 'passed'
    },
    lastCheckAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    connection: {
      id: 'conn-2',
      platform: 'GOOGLE' as const,
      status: 'CONNECTED',
      accountName: 'Google Ads Account'
    },
    _count: {
      leads: 0
    }
  },
  {
    id: '3',
    name: 'TikTok Property Showcase',
    platform: 'TIKTOK' as const,
    status: 'DRAFT' as const,
    goal: 'BRAND_AWARENESS' as const,
    budget: 2000,
    dailyBudget: 80,
    audience: {
      locations: ['Israel'],
      ages: [18, 35],
      interests: ['Real Estate', 'Home Decor']
    },
    creative: {
      headline: 'Modern Apartments in Israel',
      description: 'Discover trendy properties',
      videoUrl: '/campaign-video-1.mp4'
    },
    platformCampaignId: null,
    platformAdSetId: null,
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    startDate: null,
    endDate: null,
    preflightChecks: null,
    lastCheckAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    connection: {
      id: 'conn-3',
      platform: 'TIKTOK' as const,
      status: 'EXPIRED',
      accountName: 'TikTok Business Account'
    },
    _count: {
      leads: 0
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // In a real app, this would filter by ownerUid
    const campaigns = mockCampaigns;

    return NextResponse.json({
      campaigns,
      total: campaigns.length
    });
  } catch (error) {
    console.error('Get campaigns API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ownerUid = request.headers.get('x-org-id');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Create new campaign (simplified validation)
    const newCampaign = {
      id: `${mockCampaigns.length + 1}`,
      ...body,
      status: 'DRAFT',
      spend: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      platformCampaignId: null,
      platformAdSetId: null,
      preflightChecks: null,
      lastCheckAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        leads: 0
      }
    };

    // Add to mock data
    mockCampaigns.push(newCampaign);

    return NextResponse.json({
      id: newCampaign.id,
      createdAt: newCampaign.createdAt,
      success: true
    });
  } catch (error: any) {
    console.error('Create campaign API error:', error);
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create campaign'
    }, { status: 500 });
  }
}