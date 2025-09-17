import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Mock data snapshot for AI Coach analysis
    // In a real implementation, this would fetch actual user data from the database
    const mockDataSnapshot = {
      leads: {
        total: 25,
        staleList: [
          { id: '1', name: 'John Doe', lastContact: '2024-01-10', source: 'Facebook' },
          { id: '2', name: 'Jane Smith', lastContact: '2024-01-09', source: 'Google' }
        ],
        newCount: 5,
        qualifiedCount: 8,
        conversionRate: 0.32
      },
      campaigns: {
        active: 3,
        issues: [
          {
            campaignName: 'Summer Sale',
            issue: 'low_ctr',
            severity: 'high',
            ctr: 0.8,
            spend: 1200
          }
        ],
        totalSpend: 5600,
        averageCTR: 1.2
      },
      tasks: {
        overdue: 4,
        pending: 12,
        completed: 23
      },
      connections: {
        total: 6,
        active: 4,
        errorCount: 2,
        errors: [
          { platform: 'Facebook', error: 'Token expired' },
          { platform: 'Google Ads', error: 'Authentication failed' }
        ]
      },
      revenue: {
        thisMonth: 12500,
        lastMonth: 10800,
        growth: 0.157
      },
      properties: {
        total: 18,
        sold: 3,
        pending: 7,
        averageDaysOnMarket: 45
      }
    };

    return NextResponse.json(mockDataSnapshot);
  } catch (error) {
    console.error('Error fetching data snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data snapshot' },
      { status: 500 }
    );
  }
}