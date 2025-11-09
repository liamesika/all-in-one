export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Approve Review
 * POST: Approve asset/project (locks asset version)
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


const approveSchema = z.object({
  comments: z.string().optional(),
});

/**
 * POST /api/productions/reviews/[id]/approve
 * Approve review - locks asset version if asset review
 */
export const POST = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const { comments } = approveSchema.parse(body);

    // Verify review exists and belongs to org
    const review = await prisma.creativeReview.findFirst({
      where: {
        id,
        project: { orgId },
      },
      include: {
        asset: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Review already decided' },
        { status: 400 }
      );
    }

    // Update review to approved
    const updated = await prisma.creativeReview.update({
      where: { id },
      data: {
        status: 'APPROVED',
        comments,
        decidedAt: new Date(),
      },
      include: {
        project: true,
        asset: true,
      },
    });

    // TODO: Lock asset version if this is an asset review
    // This prevents further edits to this version
    // Implementation depends on asset versioning system

    return NextResponse.json({
      review: updated,
      message: 'Review approved successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error approving review:', error);
    return NextResponse.json(
      { error: 'Failed to approve review', details: error.message },
      { status: 500 }
    );
  }
});
