import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ownerUid = formData.get('ownerUid') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    // Read and parse CSV content
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    // Parse rows (take first 10 for preview)
    const rows = lines.slice(1, 11).map(line => {
      return line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    });

    console.log(`CSV preview for ${file.name}: ${headers.length} columns, ${lines.length - 1} rows (showing ${rows.length} rows)`);

    return NextResponse.json({
      headers,
      rows,
      totalRows: lines.length - 1, // Subtract 1 for header row
      previewRows: rows.length,
      filename: file.name,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error('CSV preview API error:', error);

    if (error.message?.includes('CSV')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to preview CSV file' }, { status: 500 });
  }
});