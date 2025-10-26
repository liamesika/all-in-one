import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tutorialId, stepIndex } = body;

    // Find or create tutorial progress
    let tutorial = await prisma.ecomTutorialProgress.findFirst({
      where: {
        ownerUid: currentUser.uid,
        tutorialId,
      },
    });

    const totalSteps = 10; // Default, should match tutorial data
    const completed = stepIndex >= totalSteps - 1;

    if (tutorial) {
      tutorial = await prisma.ecomTutorialProgress.update({
        where: { id: tutorial.id },
        data: {
          stepIndex,
          completed,
          lastViewedAt: new Date(),
          ...(completed && !tutorial.completed ? { completedAt: new Date() } : {}),
        },
      });
    } else {
      tutorial = await prisma.ecomTutorialProgress.create({
        data: {
          ownerUid: currentUser.uid,
          tutorialId,
          title: tutorialId,
          stepIndex,
          totalSteps,
          completed,
          ...(completed ? { completedAt: new Date() } : {}),
        },
      });
    }

    // Update stats if newly completed
    if (completed && !tutorial.completed) {
      await prisma.ecomStats.upsert({
        where: { ownerUid: currentUser.uid },
        create: {
          ownerUid: currentUser.uid,
          tutorialsCompleted: 1,
        },
        update: {
          tutorialsCompleted: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      stepIndex: tutorial.stepIndex,
      completed: tutorial.completed,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/tutorials/progress] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
