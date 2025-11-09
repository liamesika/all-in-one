export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

// Mock property storage - in production this would use Prisma
// Import from parent route
const mockProperties: any[] = [];

// Generate URL-safe slug from property name
function generateSlug(name: string, id: string): string {
  // Remove Hebrew characters, special chars, keep only alphanumeric and spaces
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0590-\u05FF]/g, '') // Remove Hebrew characters
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 60); // Limit length

  // Append first 8 chars of ID for uniqueness
  const shortId = id.substring(0, 8);

  return baseSlug ? `${baseSlug}-${shortId}` : `property-${shortId}`;
}

// POST - Generate or regenerate slug for a property
export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id } = await params;
    const ownerUid = getOwnerUid(user);

    // TODO: Replace with actual Prisma query
    // const property = await prisma.property.findFirst({
    //   where: { id, ownerUid }
    // });
    //
    // if (!property) {
    //   return NextResponse.json(
    //     { error: 'Property not found' },
    //     { status: 404 }
    //   );
    // }
    //
    // const slug = generateSlug(property.name, property.id);
    //
    // // Check if slug already exists
    // const existingProperty = await prisma.property.findUnique({
    //   where: { slug }
    // });
    //
    // if (existingProperty && existingProperty.id !== id) {
    //   // Slug collision - append random suffix
    //   const randomSuffix = Math.random().toString(36).substring(2, 6);
    //   slug = `${slug}-${randomSuffix}`;
    // }
    //
    // // Update property with slug
    // const updatedProperty = await prisma.property.update({
    //   where: { id },
    //   data: {
    //     slug,
    //     status: 'PUBLISHED', // Auto-publish when creating landing page
    //     publishedAt: property.publishedAt || new Date()
    //   }
    // });
    //
    // return NextResponse.json({
    //   success: true,
    //   slug: updatedProperty.slug,
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/property/${updatedProperty.slug}`
    // });

    // Mock implementation for development - simulating database update
    // In a real scenario, you would fetch from Prisma and update
    const mockProperty = {
      id,
      name: 'Luxury Penthouse - Tel Aviv', // This should come from DB
      slug: null
    };

    const slug = generateSlug(mockProperty.name, id);

    console.log('[Properties API] Generated slug:', slug, 'for property:', id);

    // Return success with the generated slug
    return NextResponse.json({
      success: true,
      slug,
      propertyId: id,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/property/${slug}`,
      message: 'Landing page URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating slug:', error);
    return NextResponse.json(
      { error: 'Failed to generate slug' },
      { status: 500 }
    );
  }
});
