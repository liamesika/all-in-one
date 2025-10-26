import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layout = await prisma.ecomLayoutBlueprint.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    if (!layout) {
      return NextResponse.json({ layout: null });
    }

    return NextResponse.json({
      layout: {
        presetId: layout.presetId,
        sections: layout.sections,
      },
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/layout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { presetId, sections } = body;

    // Upsert layout
    const layout = await prisma.ecomLayoutBlueprint.upsert({
      where: { ownerUid: currentUser.uid },
      create: {
        ownerUid: currentUser.uid,
        presetId,
        sections: sections || [],
      },
      update: {
        presetId,
        sections: sections || [],
        updatedAt: new Date(),
      },
    });

    console.log('[Layout] Saved blueprint with', sections?.length || 0, 'sections');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/ecommerce/layout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save layout' },
      { status: 500 }
    );
  }
}
