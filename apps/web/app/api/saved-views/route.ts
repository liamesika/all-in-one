export const dynamic = 'force-dynamic';
/**
 * Saved Views API
 * Save current filters/sorts as named views, set defaults, share via URL
 * Sprint A1 - Quick win feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

const createSavedViewSchema = z.object({
  name: z.string().min(1).max(100),
  page: z.enum(['leads', 'properties', 'campaigns', 'projects', 'reviews', 'templates']),
  vertical: z.enum(['real-estate', 'e-commerce', 'law']).optional(),
  filters: z.record(z.any()), // JSON object of filter state
  sorts: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  isDefault: z.boolean().optional().default(false),
  scope: z.enum(['user', 'org']).optional().default('user'), // User-only or org-wide
});

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
 * GET /api/saved-views
 * List all saved views for current user/org filtered by page
 */
export const GET = withAuthAndOrg(async (request: NextRequest, { user, orgId }) => {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page'); // Required filter
  const vertical = searchParams.get('vertical');

  if (!page) {
    return NextResponse.json({ error: 'page parameter is required' }, { status: 400 });
  }

  const where: any = {
    page,
    OR: [
      { userId: user.uid, scope: 'user' }, // User's own views
      { orgId, scope: 'org' }, // Org-wide views
    ],
  };

  if (vertical) {
    where.vertical = vertical;
  }

  const views = await prisma.savedView.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' }, // Default views first
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      name: true,
      page: true,
      vertical: true,
      filters: true,
      sorts: true,
      isDefault: true,
      scope: true,
      userId: true,
      orgId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ views });
});

/**
 * POST /api/saved-views
 * Create a new saved view
 */
export const POST = withAuthAndOrg(async (request: NextRequest, { user, orgId }) => {
  const body = await request.json();
  const validated = createSavedViewSchema.parse(body);

  // If setting as default, unset other defaults for this page/user
  if (validated.isDefault) {
    if (validated.scope === 'user') {
      await prisma.savedView.updateMany({
        where: { userId: user.uid, page: validated.page, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // Org scope - unset org defaults
      await prisma.savedView.updateMany({
        where: { orgId, page: validated.page, scope: 'org', isDefault: true },
        data: { isDefault: false },
      });
    }
  }

  const view = await prisma.savedView.create({
    data: {
      name: validated.name,
      page: validated.page,
      vertical: validated.vertical,
      filters: validated.filters,
      sorts: validated.sorts || [],
      isDefault: validated.isDefault,
      scope: validated.scope,
      userId: user.uid,
      orgId,
    },
  });

  return NextResponse.json({ view }, { status: 201 });
});
