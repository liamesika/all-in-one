/**
 * Creative Productions - Localize Template
 * POST: Create a localized version of a template
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { CreativeLocale } from '@prisma/client';
import { prisma } from '@/lib/prisma.server';
import { z } from 'zod';


const localizeSchema = z.object({
  targetLocale: z.nativeEnum(CreativeLocale),
});

/**
 * POST /api/productions/templates/[id]/localize
 * Create a localized version (EN ↔ HE)
 */
export const POST = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const { targetLocale } = localizeSchema.parse(body);

    const existing = await prisma.creativeTemplate.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.locale === targetLocale) {
      return NextResponse.json(
        { error: 'Template is already in target locale' },
        { status: 400 }
      );
    }

    // Create localized version
    const localized = await prisma.creativeTemplate.create({
      data: {
        orgId,
        title: `${existing.title} (${targetLocale})`,
        kind: existing.kind,
        content: existing.content, // Content remains same - user will translate
        locale: targetLocale,
        locked: false,
      },
    });

    return NextResponse.json({ template: localized }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error localizing template:', error);
    return NextResponse.json(
      { error: 'Failed to localize template', details: error.message },
      { status: 500 }
    );
  }
});
