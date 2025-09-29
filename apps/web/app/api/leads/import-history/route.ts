import { NextRequest, NextResponse } from 'next/server';

// Mock import history data
const mockImportHistory = [
  {
    id: 'batch-1',
    filename: 'facebook_leads_2025_09_28.csv',
    totalRows: 150,
    processedRows: 150,
    successCount: 142,
    errorCount: 8,
    duplicateCount: 3,
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    errors: [
      { row: 15, error: 'Invalid email format' },
      { row: 23, error: 'Missing required field: fullName' },
      { row: 47, error: 'Invalid phone number format' }
    ]
  },
  {
    id: 'batch-2',
    filename: 'google_leads_batch_2.csv',
    totalRows: 89,
    processedRows: 89,
    successCount: 89,
    errorCount: 0,
    duplicateCount: 0,
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    errors: []
  },
  {
    id: 'batch-3',
    filename: 'instagram_leads_sept.csv',
    totalRows: 67,
    processedRows: 35,
    successCount: 0,
    errorCount: 35,
    duplicateCount: 0,
    status: 'FAILED' as const,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    errors: [
      { row: 1, error: 'Invalid CSV format - missing headers' }
    ]
  },
  {
    id: 'batch-4',
    filename: 'property_inquiries.csv',
    totalRows: 234,
    processedRows: 180,
    successCount: 165,
    errorCount: 15,
    duplicateCount: 23,
    status: 'PROCESSING' as const,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: null,
    errors: []
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
    return NextResponse.json({
      batches: mockImportHistory,
      total: mockImportHistory.length
    });
  } catch (error) {
    console.error('Import history API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}