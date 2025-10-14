/**
 * Creative Productions - Duplicate Template
 * POST: Create a copy of an existing template
 */

import { withAuthAndOrg } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/productions/templates/[id]/duplicate
 * Duplicate a template (creates unlocked copy)
 */
export const POST = withAuthAndOrg(async (request, { user, orgId, params }) => {
  try {
    const { id } = params as { id: string };

    const existing = await prisma.creativeTemplate.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create duplicate with modified title
    const duplicate = await prisma.creativeTemplate.create({
      data: {
        orgId,
        title: `${existing.title} (Copy)`,
        kind: existing.kind,
        content: existing.content,
        locale: existing.locale,
        locked: false, // Always create unlocked copy
      },
    });

    return NextResponse.json({ template: duplicate }, { status: 201 });
  } catch (error: any) {
    console.error('[Productions API] Error duplicating template:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate template', details: error.message },
      { status: 500 }
    );
  }
});
