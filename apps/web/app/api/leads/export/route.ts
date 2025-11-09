import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const leadIds = searchParams.get('ids')?.split(',').filter(Boolean);

    const where: any = { ownerUid };
    if (leadIds && leadIds.length > 0) {
      where.id = { in: leadIds };
    }

    const leads = await prisma.realEstateLead.findMany({
      where,
      include: {
        property: {
          select: {
            name: true,
            address: true,
          },
        },
        assignedTo: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const csvHeaders = [
      'ID',
      'Full Name',
      'Phone',
      'Email',
      'Status',
      'Source',
      'Property',
      'Assigned To',
      'Notes',
      'Created At',
      'Updated At',
    ];

    const csvRows = leads.map((lead) => [
      lead.id,
      lead.fullName || '',
      lead.phone || '',
      lead.email || '',
      lead.qualificationStatus,
      lead.source || '',
      lead.property?.name || '',
      lead.assignedTo?.fullName || '',
      (lead.notes || '').replace(/[\r\n]/g, ' '),
      new Date(lead.createdAt).toISOString(),
      new Date(lead.updatedAt).toISOString(),
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const filename = `leads-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export leads API error:', error);
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 });
  }
});
