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

    const versions = await prisma.ecomCampaignVersion.findMany({
      where: { ownerUid: currentUser.uid },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      versions: versions.map(v => ({
        id: v.id,
        brief: v.brief,
        audiences: v.audiences,
        adCopies: v.adCopies,
        createdAt: v.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/campaigns/assistant/history] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign history' },
      { status: 500 }
    );
  }
}
