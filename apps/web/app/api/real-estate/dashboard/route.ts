import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    // Return mock data for now to prevent 404
    const mockData = {
      kpis: {
        newLeads: {
          value: 45,
          delta: '+12%',
          trend: [38, 41, 45],
          hotWarmCold: { hot: 8, warm: 23, cold: 14 }
        },
        conversionRates: {
          value: '28%',
          delta: '+3%',
          qualified: '65%',
          viewing: '42%',
          offer: '28%',
          deal: '18%'
        },
        avgDealValue: {
          value: '$485K',
          delta: '+8%',
          breakdown: {
            residential: '$420K',
            commercial: '$850K',
            luxury: '$1.2M'
          }
        },
        avgTimeToClose: {
          value: '34 days',
          delta: '-5 days',
          byProperty: {
            residential: '28 days',
            commercial: '45 days',
            luxury: '52 days'
          }
        }
      },
      recentActivity: [],
      propertyPerformance: [],
      leadSources: [],
      topProperties: []
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Real estate dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});