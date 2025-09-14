import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');

    // For demo purposes, return mock summary data
    const summary = {
      total: 15,
      running: 2,
      pending: 3,
      completed: 8,
      failed: 2,
      recentActivity: [
        {
          id: 'job_recent_1',
          type: 'PROPERTY_SCRAPER',
          status: 'COMPLETED',
          title: 'Property Data Import',
          completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        },
        {
          id: 'job_recent_2',
          type: 'LEAD_PROCESSOR',
          status: 'RUNNING',
          title: 'Process New Leads',
          startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
        },
        {
          id: 'job_recent_3',
          type: 'EMAIL_FOLLOWUP',
          status: 'FAILED',
          title: 'Send Follow-ups',
          failedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
          error: 'SMTP timeout',
        },
      ],
      stats: {
        avgCompletionTime: 12.5, // minutes
        successRate: 85.7, // percentage
        totalProcessed: 1247,
        lastHour: 3,
        last24Hours: 18,
      },
    };

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Jobs summary API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch jobs summary' },
      { status: 500 }
    );
  }
}