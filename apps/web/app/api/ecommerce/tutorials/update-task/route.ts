import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { verifyAuthToken } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Parse request body
    const { taskId, status, allTasks } = await request.json();

    if (!taskId || !status || !allTasks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Calculate completed count
    const completedCount = allTasks.filter((task: any) => task.status === 'completed').length;

    // Update or create EcomStats
    await prisma.ecomStats.upsert({
      where: { ownerUid },
      update: {
        tutorialTasks: allTasks,
        tutorialsCompleted: completedCount,
      },
      create: {
        ownerUid,
        tutorialTasks: allTasks,
        tutorialsCompleted: completedCount,
        totalTutorials: 10,
        productsUploaded: 0,
        aiImagesGenerated: 0,
        csvSessionsCompleted: 0,
        campaignBriefsCreated: 0,
        shopifyConnected: false,
      },
    });

    return NextResponse.json({
      success: true,
      completed: completedCount,
    });
  } catch (error) {
    console.error('Error updating tutorial task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
