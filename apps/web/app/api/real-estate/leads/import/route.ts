import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

interface LeadImportRow {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: Array<{ row: number; error: string }>;
  leads?: any[];
}

// In-memory storage for leads (TODO: Replace with Prisma)
let mockLeads: any[] = [
  {
    id: '1',
    ownerUid: 'demo-user',
    name: 'David Cohen',
    phone: '0501234567',
    email: 'david@example.com',
    status: 'HOT',
    source: 'Website',
    notes: 'Interested in 3-room apartment',
    propertyId: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    ownerUid: 'demo-user',
    name: 'Rachel Levi',
    phone: '0529876543',
    email: 'rachel@example.com',
    status: 'WARM',
    source: 'Facebook',
    notes: 'Looking for investment property',
    propertyId: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { rows, importType = 'csv' } = body;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Invalid request: rows array is required' },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      duplicates: 0,
      errors: [],
      leads: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as LeadImportRow;
      const rowNum = i + 1;

      try {
        // Validate required fields
        if (!row.name || !row.name.trim()) {
          result.errors.push({ row: rowNum, error: 'Name is required' });
          continue;
        }

        if (!row.phone || !row.phone.trim()) {
          result.errors.push({ row: rowNum, error: 'Phone is required' });
          continue;
        }

        // Validate phone format (Israeli phone: 10 digits starting with 05)
        const cleanPhone = row.phone.replace(/\D/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 10) {
          result.errors.push({
            row: rowNum,
            error: 'Invalid phone format (expected 9-10 digits)',
          });
          continue;
        }

        // Validate email if provided
        if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          result.errors.push({ row: rowNum, error: 'Invalid email format' });
          continue;
        }

        // Check for duplicates (unique by ownerUid + phone)
        const isDuplicate = mockLeads.some(
          (l) => l.ownerUid === ownerUid && l.phone === cleanPhone
        );

        if (isDuplicate) {
          result.duplicates++;
          continue;
        }

        // Create new lead
        const newLead = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ownerUid,
          name: row.name.trim(),
          phone: cleanPhone,
          email: row.email?.trim() || null,
          source: row.source?.trim() || 'Import',
          status: 'WARM', // Default status for imported leads
          notes: row.notes?.trim() || '',
          propertyId: null,
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockLeads.push(newLead);
        result.leads!.push(newLead);
        result.imported++;
      } catch (error: any) {
        result.errors.push({
          row: rowNum,
          error: error.message || 'Unknown error',
        });
      }
    }

    // If all rows failed, mark as failed
    if (result.imported === 0 && result.errors.length > 0) {
      result.success = false;
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('[Leads Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import leads', details: error.message },
      { status: 500 }
    );
  }
});

// Export mock leads for use in other routes
export { mockLeads };
