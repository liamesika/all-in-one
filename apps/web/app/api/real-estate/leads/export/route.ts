export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerUid = getOwnerUid(user);

    // Get filter parameters (same as main list)
    const statusFilter = searchParams.get('status');
    const sourceFilter = searchParams.get('source');
    const searchQuery = searchParams.get('search');
    const selectedIds = searchParams.get('selectedIds')?.split(',').filter(Boolean);

    // Build where clause
    const where: any = { ownerUid };

    if (statusFilter) {
      where.qualificationStatus = statusFilter;
    }

    if (sourceFilter) {
      where.source = sourceFilter;
    }

    if (searchQuery) {
      where.OR = [
        { fullName: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { phone: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // If specific IDs selected, filter to those
    if (selectedIds && selectedIds.length > 0) {
      where.id = { in: selectedIds };
    }

    // Fetch leads from database
    const leads = await prisma.realEstateLead.findMany({
      where,
      include: {
        property: {
          select: {
            name: true,
            address: true,
          }
        },
        assignedTo: {
          select: {
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Source', 'Notes', 'Assigned To', 'Property', 'Created At'];
    const csvRows = [headers.join(',')];

    leads.forEach((lead) => {
      const row = [
        escapeCsvField(lead.fullName || ''),
        escapeCsvField(lead.phone || ''),
        escapeCsvField(lead.email || ''),
        escapeCsvField(lead.qualificationStatus),
        escapeCsvField(lead.source || ''),
        escapeCsvField(lead.notes || ''),
        escapeCsvField(lead.assignedTo?.fullName || ''),
        escapeCsvField(lead.property?.name || ''),
        escapeCsvField(new Date(lead.createdAt).toISOString()),
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Add UTF-8 BOM for Hebrew support in Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    console.log(`[Leads Export] Exported ${leads.length} leads`);

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('[Leads Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export leads', details: error.message },
      { status: 500 }
    );
  }
});

function escapeCsvField(field: string): string {
  if (!field) return '""';

  const stringField = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}
