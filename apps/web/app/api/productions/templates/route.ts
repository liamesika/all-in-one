export const dynamic = 'force-dynamic';
/**
 * Creative Productions - Templates API
 * GET: List templates with filters
 * POST: Create new template
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeTemplateKind, CreativeLocale } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


// Validation schema for creating/updating templates
const templateSchema = z.object({
  title: z.string().min(1).max(200),
  kind: z.nativeEnum(CreativeTemplateKind),
  content: z.any(), // JSON content - flexible structure
  locale: z.nativeEnum(CreativeLocale).default('EN'),
  locked: z.boolean().default(false),
});

/**
 * GET /api/productions/templates
 * List templates with pagination and filters
 */
export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind') as CreativeTemplateKind | null;
    const locale = searchParams.get('locale') as CreativeLocale | null;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { orgId };

    if (kind) {
      where.kind = kind;
    }

    if (locale) {
      where.locale = locale;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [templates, total] = await Promise.all([
      prisma.creativeTemplate.findMany({
        where,
        orderBy: [{ locked: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.creativeTemplate.count({ where }),
    ]);

    return NextResponse.json({
      templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[Productions API] Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/productions/templates
 * Create a new template
 */
export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = templateSchema.parse(body);

    const template = await prisma.creativeTemplate.create({
      data: {
        ...validated,
        orgId,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error.message },
      { status: 500 }
    );
  }
});
