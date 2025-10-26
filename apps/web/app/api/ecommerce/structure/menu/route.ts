import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { menuItems } = body;

    // Get or create structure
    let structure = await prisma.ecomStructure.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    if (!structure) {
      structure = await prisma.ecomStructure.create({
        data: {
          ownerUid: currentUser.uid,
          collections: [],
          menuItems: menuItems || [],
        },
      });
    } else {
      structure = await prisma.ecomStructure.update({
        where: { ownerUid: currentUser.uid },
        data: { menuItems: menuItems || [] },
      });
    }

    console.log('[Structure] Saved menu with', menuItems?.length || 0, 'items');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/ecommerce/structure/menu] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save menu' },
      { status: 500 }
    );
  }
}
