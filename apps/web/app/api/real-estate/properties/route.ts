export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

// GET - List all properties for user
export const GET = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);

    const properties = await prisma.property.findMany({
      where: { ownerUid },
      include: {
        photos: {
          orderBy: { sortIndex: 'asc' }
        },
        organization: {
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                user: {
                  select: { id: true, email: true, displayName: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match frontend expectations
    const transformedProperties = properties.map(p => ({
      ...p,
      images: p.photos.map(photo => photo.url),
      assignedAgentName: p.assignedAgentId
        ? p.organization?.memberships.find(m => m.userId === p.assignedAgentId)?.user.displayName || null
        : null
    }));

    return NextResponse.json({ properties: transformedProperties });
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

    // Get user's organization
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: ownerUid },
      include: { defaultOrganization: true }
    });

    const orgId = userProfile?.defaultOrgId || null;

    // Generate slug from name (only for LISTED properties)
    const slug = body.status === 'LISTED'
      ? body.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 60) + '-' + Date.now().toString(36)
      : null;

    // Create property with photos
    const property = await prisma.property.create({
      data: {
        ownerUid,
        orgId,
        name: body.name,
        address: body.address,
        city: body.city,
        price: body.price,
        rooms: body.rooms,
        size: body.size,
        status: body.status || 'DRAFT',
        description: body.description,
        amenities: body.amenities,
        slug,
        publishedAt: body.status === 'LISTED' ? new Date() : null,
        photos: {
          create: (body.images || []).map((url: string, index: number) => ({
            url,
            sortIndex: index
          }))
        }
      },
      include: {
        photos: {
          orderBy: { sortIndex: 'asc' }
        }
      }
    });

    console.log('[Properties API] Created property:', property.id);

    // Transform to match frontend expectations
    const transformedProperty = {
      ...property,
      images: property.photos.map(photo => photo.url),
      assignedAgentName: null
    };

    return NextResponse.json(transformedProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
});
