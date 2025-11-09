export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

// Mock source health data
const mockSourceHealth = [
  {
    source: 'FACEBOOK' as const,
    lastEventAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isHealthy: true,
    lastError: null,
    lastErrorAt: null,
    totalLeads: 245,
    todayLeads: 12
  },
  {
    source: 'INSTAGRAM' as const,
    lastEventAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isHealthy: true,
    lastError: null,
    lastErrorAt: null,
    totalLeads: 89,
    todayLeads: 3
  },
  {
    source: 'CSV_UPLOAD' as const,
    lastEventAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isHealthy: true,
    lastError: null,
    lastErrorAt: null,
    totalLeads: 156,
    todayLeads: 0
  },
  {
    source: 'GOOGLE_SHEETS' as const,
    lastEventAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isHealthy: false,
    lastError: 'Failed to authenticate with Google Sheets API',
    lastErrorAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    totalLeads: 67,
    todayLeads: 0
  },
  {
    source: 'WHATSAPP' as const,
    lastEventAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isHealthy: true,
    lastError: null,
    lastErrorAt: null,
    totalLeads: 34,
    todayLeads: 2
  },
  {
    source: 'MANUAL' as const,
    lastEventAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isHealthy: true,
    lastError: null,
    lastErrorAt: null,
    totalLeads: 123,
    todayLeads: 5
  }
];

export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // In a real app, this would filter by ownerUid and calculate real health metrics
    return NextResponse.json({
      sources: mockSourceHealth,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Source health API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});