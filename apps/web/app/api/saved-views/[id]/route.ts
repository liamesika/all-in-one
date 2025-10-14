/**
 * Saved View by ID API
 * GET, PATCH, DELETE individual saved views
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

const updateSavedViewSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  filters: z.record(z.any()).optional(),
  sorts: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/saved-views/[id]
 * Get a single saved view by ID
 */
export const GET = withAuthAndOrg(async (request: NextRequest, { user, orgId, params }) => {
  const { id } = params;

  const view = await prisma.savedView.findFirst({
    where: {
      id,
      OR: [
        { userId: user.uid, scope: 'user' },
        { orgId, scope: 'org' },
      ],
    },
  });

  if (!view) {
    return NextResponse.json({ error: 'Saved view not found' }, { status: 404 });
  }

  return NextResponse.json({ view });
});

/**
 * PATCH /api/saved-views/[id]
 * Update a saved view (user can only update their own user-scoped views)
 */
export const PATCH = withAuthAndOrg(async (request: NextRequest, { user, orgId, params }) => {
  const { id } = params;
  const body = await request.json();
  const validated = updateSavedViewSchema.parse(body);

  // Check ownership
  const existing = await prisma.savedView.findFirst({
    where: { id, userId: user.uid }, // Can only edit own views
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Saved view not found or you do not have permission to edit it' },
      { status: 404 }
    );
  }

  // If setting as default, unset other defaults
  if (validated.isDefault) {
    if (existing.scope === 'user') {
      await prisma.savedView.updateMany({
        where: { userId: user.uid, page: existing.page, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    } else {
      await prisma.savedView.updateMany({
        where: { orgId, page: existing.page, scope: 'org', isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
  }

  const view = await prisma.savedView.update({
    where: { id },
    data: validated,
  });

  return NextResponse.json({ view });
});

/**
 * DELETE /api/saved-views/[id]
 * Delete a saved view (user can only delete their own user-scoped views)
 */
export const DELETE = withAuthAndOrg(async (request: NextRequest, { user, orgId, params }) => {
  const { id } = params;

  // Check ownership
  const existing = await prisma.savedView.findFirst({
    where: { id, userId: user.uid }, // Can only delete own views
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Saved view not found or you do not have permission to delete it' },
      { status: 404 }
    );
  }

  await prisma.savedView.delete({ where: { id } });

  return NextResponse.json({ success: true });
});
