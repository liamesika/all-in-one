import { NextRequest, NextResponse } from 'next/server';
import { CreateLeadSchema, CreateLeadRequest } from '@/lib/validation/leads';

// Mock data for development
const mockLeads = [
  {
    id: '1',
    fullName: 'יוסי כהן',
    firstName: 'יוסי',
    lastName: 'כהן',
    email: 'yossi@example.com',
    phone: '+972-50-123-4567',
    city: 'תל אביב',
    source: 'FACEBOOK' as const,
    sourceName: 'Facebook Ad Campaign',
    status: 'NEW' as const,
    score: 'HOT' as const,
    budget: 5000,
    interests: ['דירה', 'תל אביב'],
    notes: 'מחפש דירה 3 חדרים בתל אביב',
    phoneValid: 'VALID' as const,
    emailValid: 'VALID' as const,
    isDuplicate: false,
    firstContactAt: null,
    lastContactAt: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    campaignId: 'camp-1',
    platformAdSetId: 'adset-123',
    utmSource: 'facebook',
    utmMedium: 'paid',
    utmCampaign: 'real-estate-spring',
    campaign: {
      id: 'camp-1',
      name: 'Spring Real Estate Campaign',
      platform: 'META',
      status: 'ACTIVE'
    }
  },
  {
    id: '2',
    fullName: 'Sarah Miller',
    firstName: 'Sarah',
    lastName: 'Miller',
    email: 'sarah.miller@email.com',
    phone: '+972-52-987-6543',
    city: 'Jerusalem',
    source: 'GOOGLE_SHEETS' as const,
    sourceName: 'Lead Import Batch #5',
    status: 'CONTACTED' as const,
    score: 'WARM' as const,
    budget: 3000,
    interests: ['apartment', 'jerusalem'],
    notes: 'Looking for 2BR apartment in Jerusalem, budget 3K',
    phoneValid: 'VALID' as const,
    emailValid: 'VALID' as const,
    isDuplicate: false,
    firstContactAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastContactAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    utmSource: 'google',
    utmMedium: 'import',
    campaign: null
  },
  {
    id: '3',
    fullName: 'מרים לוי',
    firstName: 'מרים',
    lastName: 'לוי',
    email: 'miriam.levi@gmail.com',
    phone: '+972-54-555-1234',
    city: 'חיפה',
    source: 'MANUAL' as const,
    sourceName: 'Walk-in inquiry',
    status: 'QUALIFIED' as const,
    score: 'HOT' as const,
    budget: 8000,
    interests: ['בית', 'חיפה', 'גן'],
    notes: 'מחפשת בית עם גן בחיפה, תקציב גבוה',
    phoneValid: 'VALID' as const,
    emailValid: 'VALID' as const,
    isDuplicate: false,
    firstContactAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    lastContactAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    campaign: null
  }
];

let nextId = 4;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const score = searchParams.get('score');
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const hasFirstContact = searchParams.get('hasFirstContact');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // Filter leads based on query parameters
    let filteredLeads = [...mockLeads];

    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }

    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    if (score) {
      filteredLeads = filteredLeads.filter(lead => lead.score === score);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.fullName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchLower) ||
        lead.city?.toLowerCase().includes(searchLower)
      );
    }

    if (platform) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.campaign?.platform === platform
      );
    }

    if (hasFirstContact !== null && hasFirstContact !== undefined) {
      const hasContact = hasFirstContact === 'true';
      filteredLeads = filteredLeads.filter(lead =>
        hasContact ? !!lead.firstContactAt : !lead.firstContactAt
      );
    }

    // Pagination
    const totalLeads = filteredLeads.length;
    const totalPages = Math.ceil(totalLeads / limit);
    const offset = (page - 1) * limit;
    const paginatedLeads = filteredLeads.slice(offset, offset + limit);

    return NextResponse.json({
      leads: paginatedLeads,
      totalPages,
      currentPage: page,
      totalLeads
    });
  } catch (error) {
    console.error('Get leads API error:', error);
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

    // Validate request body
    const validatedData = CreateLeadSchema.parse(body);

    // Create new lead
    const newLead = {
      id: nextId.toString(),
      ...validatedData,
      phoneValid: 'PENDING' as const,
      emailValid: 'PENDING' as const,
      isDuplicate: false,
      firstContactAt: null,
      lastContactAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      campaign: null
    };

    // Add to mock data
    mockLeads.unshift(newLead);
    nextId++;

    return NextResponse.json({
      id: newLead.id,
      createdAt: newLead.createdAt,
      success: true
    });
  } catch (error: any) {
    console.error('Create lead API error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid lead data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create lead'
    }, { status: 500 });
  }
}