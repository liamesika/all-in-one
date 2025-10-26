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
    const { name, type, rules, productCount } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Get or create structure
    let structure = await prisma.ecomStructure.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    const newCollection = {
      id: `col-${Date.now()}`,
      name,
      type,
      rules: rules || [],
      productCount: productCount || 0,
    };

    if (!structure) {
      structure = await prisma.ecomStructure.create({
        data: {
          ownerUid: currentUser.uid,
          collections: [newCollection],
          menuItems: [],
        },
      });
    } else {
      const collections = Array.isArray(structure.collections)
        ? [...(structure.collections as any[]), newCollection]
        : [newCollection];

      structure = await prisma.ecomStructure.update({
        where: { ownerUid: currentUser.uid },
        data: { collections },
      });
    }

    return NextResponse.json({ collection: newCollection });
  } catch (error) {
    console.error('[POST /api/ecommerce/structure/collections] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const structure = await prisma.ecomStructure.findUnique({
      where: { ownerUid: currentUser.uid },
    });

    if (!structure) {
      return NextResponse.json({ error: 'Structure not found' }, { status: 404 });
    }

    const collections = Array.isArray(structure.collections)
      ? (structure.collections as any[]).filter((c: any) => c.id !== id)
      : [];

    await prisma.ecomStructure.update({
      where: { ownerUid: currentUser.uid },
      data: { collections },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/ecommerce/structure/collections] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
