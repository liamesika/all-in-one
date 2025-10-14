import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

// Import mock leads from import route
// In production, this would query Prisma with filters
const getMockLeads = () => {
  // This would be replaced with Prisma query
  return [
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
};

export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerUid = getOwnerUid(user);

    // Get filter parameters (same as main list)
    const statusFilter = searchParams.get('status');
    const sourceFilter = searchParams.get('source');
    const searchQuery = searchParams.get('search');
    const selectedIds = searchParams.get('selectedIds')?.split(',').filter(Boolean);

    // TODO: Replace with Prisma query
    let leads = getMockLeads().filter((lead) => lead.ownerUid === ownerUid);

    // Apply filters
    if (statusFilter) {
      leads = leads.filter((l) => l.status === statusFilter);
    }

    if (sourceFilter) {
      leads = leads.filter((l) => l.source === sourceFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.phone.includes(query) ||
          l.email?.toLowerCase().includes(query)
      );
    }

    // If specific IDs selected, filter to those
    if (selectedIds && selectedIds.length > 0) {
      leads = leads.filter((l) => selectedIds.includes(l.id));
    }

    // Generate CSV
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Source', 'Notes', 'Created At'];
    const csvRows = [headers.join(',')];

    leads.forEach((lead) => {
      const row = [
        escapeCsvField(lead.name),
        escapeCsvField(lead.phone),
        escapeCsvField(lead.email || ''),
        escapeCsvField(lead.status),
        escapeCsvField(lead.source),
        escapeCsvField(lead.notes || ''),
        escapeCsvField(new Date(lead.createdAt).toISOString()),
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Add UTF-8 BOM for Hebrew support in Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

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
