import { NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get('ownerUid');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // For demo purposes, return mock job data since we don't have a jobs table yet
    const mockJobs = [
      {
        id: 'job_1',
        type: 'PROPERTY_SCRAPER',
        status: 'COMPLETED',
        title: 'Property Data Import - Yad2',
        description: 'Imported 45 new properties from Yad2',
        progress: 100,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        results: { imported: 45, duplicates: 3, errors: 0 },
        ownerUid: ownerUid || 'demo-user',
      },
      {
        id: 'job_2',
        type: 'LEAD_PROCESSOR',
        status: 'RUNNING',
        title: 'Process Lead Batch #234',
        description: 'Processing 23 new e-commerce leads',
        progress: 67,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        completedAt: null,
        results: null,
        ownerUid: ownerUid || 'demo-user',
      },
      {
        id: 'job_3',
        type: 'CAMPAIGN_SYNC',
        status: 'PENDING',
        title: 'Sync Meta Campaign Data',
        description: 'Synchronizing campaign metrics from Meta Ads',
        progress: 0,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        completedAt: null,
        results: null,
        ownerUid: ownerUid || 'demo-user',
      },
      {
        id: 'job_4',
        type: 'EMAIL_FOLLOWUP',
        status: 'FAILED',
        title: 'Send Follow-up Emails',
        description: 'Send automated follow-ups to warm leads',
        progress: 25,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        completedAt: null,
        results: { sent: 12, failed: 3, error: 'SMTP connection timeout' },
        ownerUid: ownerUid || 'demo-user',
      },
      {
        id: 'job_5',
        type: 'DATA_EXPORT',
        status: 'COMPLETED',
        title: 'Export Leads to CSV',
        description: 'Export Q3 leads data for analysis',
        progress: 100,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        completedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(), // 5.5 hours ago
        results: { exported: 234, fileSize: '1.2MB' },
        ownerUid: ownerUid || 'demo-user',
      },
      {
        id: 'job_6',
        type: 'PROPERTY_ANALYSIS',
        status: 'COMPLETED',
        title: 'Market Analysis - Tel Aviv',
        description: 'AI-powered market analysis for Tel Aviv properties',
        progress: 100,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        completedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        results: { analyzed: 156, avgPrice: 2850000, trend: 'up' },
        ownerUid: ownerUid || 'demo-user',
      },
    ];

    // Filter by ownerUid if provided
    let filteredJobs = ownerUid
      ? mockJobs.filter(job => job.ownerUid === ownerUid)
      : mockJobs;

    // Filter by status if provided
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Filter by type if provided
    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(skip, skip + limit);
    const totalCount = filteredJobs.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Check if client wants just the array (for dashboard compatibility)
    const acceptHeader = req.headers.get('accept');
    if (acceptHeader?.includes('application/json-array')) {
      return NextResponse.json(paginatedJobs);
    }

    return NextResponse.json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Jobs API error:', error);

    // Return empty array for compatible clients, error object for others
    const acceptHeader = req.headers.get('accept');
    if (acceptHeader?.includes('application/json-array')) {
      return NextResponse.json([]);
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerUid, type, title, description, data } = body;

    if (!ownerUid || !type || !title) {
      return NextResponse.json(
        { error: 'ownerUid, type, and title are required' },
        { status: 400 }
      );
    }

    // For now, simulate creating a job
    const newJob = {
      id: `job_${Date.now()}`,
      type,
      status: 'PENDING',
      title,
      description: description || '',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      results: null,
      ownerUid,
      data: data || null,
    };

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job created successfully',
    });
  } catch (error: any) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}