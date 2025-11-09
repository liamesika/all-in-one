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

    const properties = await prisma.property.findMany({
      where,
      include: {
        leads: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const csvHeaders = [
      'ID',
      'Name',
      'Address',
      'City',
      'Neighborhood',
      'Type',
      'Transaction Type',
      'Price',
      'Rent Price',
      'Rooms',
      'Size',
      'Status',
      'Total Leads',
      'Created At',
    ];

    const csvRows = properties.map((prop) => [
      prop.id,
      prop.name,
      prop.address || '',
      prop.city || '',
      prop.neighborhood || '',
      prop.type || '',
      prop.transactionType,
      prop.price || '',
      prop.rentPriceMonthly || '',
      prop.rooms || '',
      prop.size || '',
      prop.status,
      prop.leads.length,
      new Date(prop.createdAt).toISOString(),
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const filename = `properties-report-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export properties report error:', error);
    return NextResponse.json({ error: 'Failed to export properties' }, { status: 500 });
  }
});
