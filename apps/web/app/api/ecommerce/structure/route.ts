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

    const structure = await prisma.ecomStructure.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    if (!structure) {
      return NextResponse.json({
        collections: [],
        menuItems: [],
      });
    }

    return NextResponse.json({
      collections: structure.collections || [],
      menuItems: structure.menuItems || [],
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/structure] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structure' },
      { status: 500 }
    );
  }
}
