import { NextRequest, NextResponse } from 'next/server';
import { TransactionType } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';


// GET /api/real-estate/properties/search - Search properties by name, address, or city
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const transactionType = searchParams.get('transactionType') as TransactionType | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get ownerUid from authenticated user
    const ownerUid = getOwnerUid(user);

    // Build where clause
    const where: any = {
      OR: [
        { ownerUid },
        { orgId: { not: null } }, // TODO: Check org membership
      ],
      status: 'PUBLISHED', // Only search published properties
    };

    // Add search filter if provided
    if (search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { neighborhood: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add transaction type filter if provided
    if (transactionType && ['SALE', 'RENT'].includes(transactionType)) {
      where.transactionType = transactionType;
    }

    // Search properties
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        neighborhood: true,
        transactionType: true,
        price: true,
        rooms: true,
        status: true,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      properties,
      count: properties.length,
    });

  } catch (error: any) {
    console.error('[Property Search API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to search properties', details: error.message },
      { status: 500 }
    );
  }
});
