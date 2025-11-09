export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Reviews API
 * GET: List pending reviews
 * POST: Create new review request
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeReviewStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


const createReviewSchema = z.object({
  projectId: z.string().cuid(),
  assetId: z.string().cuid().optional().nullable(),
  reviewerUid: z.string(),
  comments: z.string().optional().nullable(),
});

/**
 * GET /api/productions/reviews
 * List reviews (defaults to pending, can filter by status/project)
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CreativeReviewStatus | null;
    const projectId = searchParams.get('projectId');
    const reviewerUid = searchParams.get('reviewerUid');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      project: { orgId }, // Scope to org
    };

    if (status) {
      where.status = status;
    } else {
      where.status = 'PENDING'; // Default to pending reviews
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (reviewerUid) {
      where.reviewerUid = reviewerUid;
    }

    const reviews = await prisma.creativeReview.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        asset: {
          select: {
            id: true,
            title: true,
            type: true,
            storageUrl: true,
            version: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('[Productions API] Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions/reviews
 * Create a new review request
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    // Verify project belongs to org
    const project = await prisma.creativeProject.findFirst({
      where: { id: validated.projectId, orgId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If assetId provided, verify it belongs to org
    if (validated.assetId) {
      const asset = await prisma.creativeAsset.findFirst({
        where: { id: validated.assetId, orgId },
        select: { id: true },
      });

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }
    }

    const review = await prisma.creativeReview.create({
      data: validated,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        asset: {
          select: {
            id: true,
            title: true,
            type: true,
            storageUrl: true,
            version: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
});
