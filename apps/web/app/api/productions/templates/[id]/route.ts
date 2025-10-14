/**
 * Creative Productions - Single Template API
 * GET: Fetch template by ID
 * PATCH: Update template (respects locked status)
 * DELETE: Delete template (if not locked)
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { PrismaClient, CreativeTemplateKind, CreativeLocale } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateTemplateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  kind: z.nativeEnum(CreativeTemplateKind).optional(),
  content: z.any().optional(),
  locale: z.nativeEnum(CreativeLocale).optional(),
  locked: z.boolean().optional(),
});

/**
 * GET /api/productions/templates/[id]
 */
export const GET = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };

    const template = await prisma.creativeTemplate.findFirst({
      where: { id, orgId },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('[Productions API] Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/productions/templates/[id]
 * Update template (cannot edit locked templates unless unlocking)
 */
export const PATCH = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };
    const body = await request.json();
    const validated = updateTemplateSchema.parse(body);

    const existing = await prisma.creativeTemplate.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If template is locked and we're not unlocking it, prevent edits
    if (existing.locked && validated.locked !== false) {
      return NextResponse.json(
        { error: 'Cannot edit locked template. Unlock it first.' },
        { status: 403 }
      );
    }

    const template = await prisma.creativeTemplate.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Productions API] Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/productions/templates/[id]
 * Delete template (cannot delete locked templates)
 */
export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };

    const existing = await prisma.creativeTemplate.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.locked) {
      return NextResponse.json(
        { error: 'Cannot delete locked template' },
        { status: 403 }
      );
    }

    await prisma.creativeTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error: any) {
    console.error('[Productions API] Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: error.message },
      { status: 500 }
    );
  }
});
