/**
 * Creative Productions - Request Changes
 * POST: Request changes on review (comments required)
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


const requestChangesSchema = z.object({
  comments: z.string().min(1, 'Comments are required when requesting changes'),
});

/**
 * POST /api/productions/reviews/[id]/request-changes
 * Request changes - requires comment explaining what needs to change
 */
export const POST = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const { comments } = requestChangesSchema.parse(body);

    // Verify review exists and belongs to org
    const review = await prisma.creativeReview.findFirst({
      where: {
        id,
        project: { orgId },
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

    // Update review to changes requested
    const updated = await prisma.creativeReview.update({
      where: { id },
      data: {
        status: 'CHANGES_REQUESTED',
        comments,
        decidedAt: new Date(),
      },
      include: {
        project: true,
        asset: true,
      },
    });

    return NextResponse.json({
      review: updated,
      message: 'Changes requested successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error requesting changes:', error);
    return NextResponse.json(
      { error: 'Failed to request changes', details: error.message },
      { status: 500 }
    );
  }
});
