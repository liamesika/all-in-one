export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

interface LeadImportRow {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: Array<{ row: number; error: string }>;
  leads?: any[];
}

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
        const existingLead = await prisma.realEstateLead.findFirst({
          where: {
            ownerUid,
            phone: cleanPhone,
          },
        });

        if (existingLead) {
          result.duplicates++;
          continue;
        }

        // Determine qualification status from old status field or default to NEW
        let qualificationStatus: any = 'NEW';
        if (row.status) {
          const statusUpper = row.status.toUpperCase();
          // Map old statuses to new enum values
          if (['HOT', 'WARM', 'COLD'].includes(statusUpper)) {
            qualificationStatus = 'NEW'; // Default mapping for old statuses
          } else if (['NEW', 'CONTACTED', 'IN_PROGRESS', 'MEETING', 'OFFER', 'DEAL', 'CONVERTED', 'DISQUALIFIED'].includes(statusUpper)) {
            qualificationStatus = statusUpper;
          }
        }

        // Create new lead
        const newLead = await prisma.realEstateLead.create({
          data: {
            ownerUid,
            fullName: row.name.trim(),
            phone: cleanPhone,
            email: row.email?.trim() || null,
            source: row.source?.trim() || 'Import',
            qualificationStatus,
            notes: row.notes?.trim() || null,
            message: null,
            propertyId: null,
          },
        });

        // Create import event
        await prisma.realEstateLeadEvent.create({
          data: {
            leadId: newLead.id,
            type: 'IMPORTED',
            payload: {
              importType,
              rowNumber: rowNum,
            },
          },
        });

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

    console.log(`[Leads Import] Imported ${result.imported} leads, ${result.duplicates} duplicates, ${result.errors.length} errors`);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('[Leads Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import leads', details: error.message },
      { status: 500 }
    );
  }
});
