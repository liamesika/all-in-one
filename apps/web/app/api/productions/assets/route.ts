/**
 * Creative Productions - Assets API
 * GET: List assets
 * POST: Create new asset record
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeAssetType } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


// Validation schema for creating an asset
const createAssetSchema = z.object({
  projectId: z.string().cuid().optional().nullable(),
  title: z.string().min(1).max(200),
  type: z.nativeEnum(CreativeAssetType),
  storageUrl: z.string().url(),
  size: z.number().int().positive().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  version: z.number().int().positive().default(1),
});

/**
 * GET /api/productions/assets
 * List assets with filters
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type') as CreativeAssetType | null;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { orgId };

    if (projectId) {
      // Verify project belongs to org
      const project = await prisma.creativeProject.findFirst({
        where: { id: projectId, orgId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      where.projectId = projectId;
    }

    if (type) {
      where.type = type;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const [assets, total] = await Promise.all([
      prisma.creativeAsset.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.creativeAsset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[Productions API] Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions/assets
 * Create a new asset record
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createAssetSchema.parse(body);

    // If projectId is provided, verify it belongs to org
    if (validated.projectId) {
      const project = await prisma.creativeProject.findFirst({
        where: { id: validated.projectId, orgId },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    const asset = await prisma.creativeAsset.create({
      data: {
        ...validated,
        orgId,
        createdByUid: user.uid,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset', details: error.message },
      { status: 500 }
    );
  }
});
