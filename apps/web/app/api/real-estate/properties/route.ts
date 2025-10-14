import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

// Mock database - replace with Prisma in production
let mockProperties: any[] = [
  {
    id: '1',
    name: 'Luxury Penthouse - Tel Aviv',
    city: 'Tel Aviv',
    address: 'Rothschild Blvd 10',
    price: 4500000,
    rooms: 5,
    size: 180,
    status: 'LISTED',
    description: 'Stunning luxury penthouse in the heart of Tel Aviv.',
    amenities: 'Parking (2 spaces), Storage, Elevator, Gym, Pool',
    publishedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    slug: 'luxury-penthouse-tel-aviv',
    images: [],
    ownerUid: 'demo-user',
  },
  {
    id: '2',
    name: 'Modern Apartment - Ramat Aviv',
    city: 'Tel Aviv',
    address: 'Einstein St 25',
    price: 2800000,
    rooms: 4,
    size: 120,
    status: 'LISTED',
    description: 'Beautifully renovated apartment in prestigious Ramat Aviv.',
    amenities: 'Parking, Elevator, Balcony, Storage',
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    slug: 'modern-apartment-ramat-aviv',
    images: [],
    ownerUid: 'demo-user',
  },
  {
    id: '3',
    name: 'Garden House - Herzliya',
    city: 'Herzliya',
    address: 'Sokolov St 45',
    price: 5200000,
    rooms: 6,
    size: 220,
    status: 'DRAFT',
    description: 'Spacious garden house with private pool.',
    amenities: 'Private Garden, Pool, Parking (3 spaces)',
    publishedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    slug: null,
    images: [],
    ownerUid: 'demo-user',
  },
];

// GET - List all properties for user
export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);

    // TODO: Replace with Prisma query
    // const properties = await prisma.property.findMany({
    //   where: { ownerUid },
    //   orderBy: { createdAt: 'desc' }
    // });

    const properties = mockProperties.filter(p => p.ownerUid === ownerUid);

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
});

// POST - Create new property
export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.address || !body.city || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, price' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60) + '-' + Date.now().toString(36);

    // TODO: Replace with Prisma create
    // const property = await prisma.property.create({
    //   data: {
    //     ...body,
    //     ownerUid,
    //     slug,
    //     createdAt: new Date(),
    //   }
    // });

    const newProperty = {
      id: Date.now().toString(),
      ...body,
      ownerUid,
      slug: body.status === 'LISTED' ? slug : null,
      createdAt: new Date().toISOString(),
      publishedAt: body.status === 'LISTED' ? new Date().toISOString() : null,
    };

    mockProperties.push(newProperty);

    console.log('[Properties API] Created property:', newProperty.id);

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
});
