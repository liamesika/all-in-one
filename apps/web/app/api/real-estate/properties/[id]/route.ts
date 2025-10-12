import { NextRequest, NextResponse } from 'next/server';

// Mock database - same as in route.ts parent
// In production, this would be shared Prisma instance
const getMockProperties = () => {
  // This is a simplified mock - in production use Prisma
  return [
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
  ];
};

// GET - Get single property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

    // TODO: Replace with Prisma query
    // const property = await prisma.property.findFirst({
    //   where: { id, ownerUid }
    // });

    const mockProps = getMockProperties();
    const property = mockProps.find(p => p.id === id && p.ownerUid === ownerUid);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';
    const body = await request.json();

    // TODO: Replace with Prisma update
    // const property = await prisma.property.update({
    //   where: { id, ownerUid },
    //   data: {
    //     ...body,
    //     updatedAt: new Date(),
    //   }
    // });

    // Mock update
    const mockProps = getMockProperties();
    const propertyIndex = mockProps.findIndex(p => p.id === id && p.ownerUid === ownerUid);

    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Update slug if status changed to LISTED
    let slug = mockProps[propertyIndex].slug;
    if (body.status === 'LISTED' && !slug && body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60) + '-' + Date.now().toString(36);
    }

    const updatedProperty = {
      ...mockProps[propertyIndex],
      ...body,
      slug,
      publishedAt: body.status === 'LISTED' && !mockProps[propertyIndex].publishedAt
        ? new Date().toISOString()
        : mockProps[propertyIndex].publishedAt,
      updatedAt: new Date().toISOString(),
    };

    mockProps[propertyIndex] = updatedProperty;

    console.log('[Properties API] Updated property:', id);

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE - Archive/Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerUid = request.headers.get('x-owner-uid') || 'demo-user';

    // TODO: Replace with Prisma soft delete
    // const property = await prisma.property.update({
    //   where: { id, ownerUid },
    //   data: { archived: true, archivedAt: new Date() }
    // });

    // Mock delete
    const mockProps = getMockProperties();
    const propertyIndex = mockProps.findIndex(p => p.id === id && p.ownerUid === ownerUid);

    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    mockProps.splice(propertyIndex, 1);

    console.log('[Properties API] Archived property:', id);

    return NextResponse.json({ success: true, message: 'Property archived' });
  } catch (error) {
    console.error('Error archiving property:', error);
    return NextResponse.json(
      { error: 'Failed to archive property' },
      { status: 500 }
    );
  }
}
