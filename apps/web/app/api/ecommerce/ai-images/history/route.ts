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

    const images = await prisma.ecomAIImage.findMany({
      where: { ownerUid: currentUser.uid },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      images: images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        prompt: img.prompt,
        createdAt: img.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/ai-images/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image history' },
      { status: 500 }
    );
  }
}
