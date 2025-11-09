import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [properties, totalProperties] = await Promise.all([
      prisma.property.findMany({
        where: { ownerUid },
        include: {
          photos: {
            orderBy: {
              sortIndex: 'asc',
            },
            take: 1,
          },
          leads: {
            select: {
              id: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.property.count({ where: { ownerUid } }),
    ]);

    const totalPages = Math.ceil(totalProperties / limit);

    return NextResponse.json({
      properties,
      totalPages,
      currentPage: page,
      totalProperties,
    });
  } catch (error) {
    console.error('Get properties API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    const {
      name,
      address,
      city,
      neighborhood,
      type,
      transactionType,
      price,
      rentPriceMonthly,
      rooms,
      size,
      description,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Property name is required' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        ownerUid,
        name,
        address: address || null,
        city: city || null,
        neighborhood: neighborhood || null,
        type: type || null,
        transactionType: transactionType || 'SALE',
        price: price || null,
        rentPriceMonthly: rentPriceMonthly || null,
        rooms: rooms || null,
        size: size || null,
        description: description || null,
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error: any) {
    console.error('Create property API error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
});
