import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import prisma from '@/lib/prisma';

// GET - Get single property
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);

    const property = await prisma.property.findFirst({
      where: {
        id,
        ownerUid
      },
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
      }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Transform to match frontend expectations
    const transformedProperty = {
      ...property,
      images: property.photos.map(photo => photo.url),
      assignedAgentName: property.assignedAgentId
        ? property.organization?.memberships.find(m => m.userId === property.assignedAgentId)?.user.displayName || null
        : null
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
});

// PUT - Update property
export const PUT = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Verify ownership
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        ownerUid
      }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name || !body.address || !body.city || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, price' },
        { status: 400 }
      );
    }

    // Generate slug if status changed to LISTED and no slug exists
    let slug = existingProperty.slug;
    if (body.status === 'LISTED' && !slug) {
      slug = body.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60) + '-' + Date.now().toString(36);
    }

    // Delete existing photos
    await prisma.propertyPhoto.deleteMany({
      where: { propertyId: id }
    });

    // Update property with new photos
    const property = await prisma.property.update({
      where: { id },
      data: {
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
        publishedAt: body.status === 'LISTED' && !existingProperty.publishedAt ? new Date() : existingProperty.publishedAt,
        updatedAt: new Date(),
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
      }
    });

    console.log('[Properties API] Updated property:', property.id);

    // Transform to match frontend expectations
    const transformedProperty = {
      ...property,
      images: property.photos.map(photo => photo.url),
      assignedAgentName: property.assignedAgentId
        ? property.organization?.memberships.find(m => m.userId === property.assignedAgentId)?.user.displayName || null
        : null
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
});

// DELETE - Delete property
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        ownerUid
      }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete property (photos will cascade delete)
    await prisma.property.delete({
      where: { id }
    });

    console.log('[Properties API] Deleted property:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
});
