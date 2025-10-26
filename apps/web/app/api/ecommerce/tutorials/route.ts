import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tutorials = await prisma.ecomTutorialProgress.findMany({
      where: { ownerUid: currentUser.uid },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      tutorials: tutorials.map(t => ({
        id: t.tutorialId,
        title: t.title,
        stepIndex: t.stepIndex,
        totalSteps: t.totalSteps,
        completed: t.completed,
        progress: t.progress,
      })),
    });
  } catch (error) {
    console.error('[GET /api/ecommerce/tutorials] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}
