export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { ownerUid };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const leads = await prisma.realEstateLead.findMany({
      where,
      include: {
        property: {
          select: {
            name: true,
          },
        },
        assignedTo: {
          select: {
            fullName: true,
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
      'Created At',
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
      new Date(lead.createdAt).toISOString(),
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const filename = `leads-report-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export leads report error:', error);
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 });
  }
});
