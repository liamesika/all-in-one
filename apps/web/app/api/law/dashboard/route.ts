export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (request, { user }) => {
  try {
    // Return mock data for law dashboard to prevent 404
    const mockData = {
      kpis: {
        newCases: {
          value: 23,
          delta: '+8%',
          trend: [18, 20, 23],
          byType: { civil: 12, criminal: 6, corporate: 5 }
        },
        billableHours: {
          value: '1,247',
          delta: '+15%',
          target: '1,400',
          efficiency: '89%'
        },
        revenue: {
          value: '$124,700',
          delta: '+12%',
          outstanding: '$45,200',
          collections: '85%'
        },
        caseResolution: {
          value: '18 days',
          delta: '-3 days',
          successRate: '94%',
          satisfaction: '4.8/5'
        }
      },
      recentActivity: [],
      casePerformance: [],
      clientSources: [],
      topMatters: []
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Law dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});