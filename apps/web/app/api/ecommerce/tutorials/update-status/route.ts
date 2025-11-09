export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { verifyAuthToken } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decodedToken = await verifyAuthToken(request);
    const ownerUid = decodedToken.uid;

    // Parse request body
    const { tutorialId, status } = await request.json();

    if (!tutorialId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get or create tutorial progress record
    // Note: We'll store this in a JSON field or create a new model
    // For now, let's use EcomStats to store tutorial statuses as JSON
    const stats = await prisma.ecomStats.findUnique({
      where: { ownerUid },
    });

    let tutorialStatuses: Record<string, string> = {};
    if (stats && stats.tutorialTasks) {
      // Extract statuses from existing data
      const tasks = stats.tutorialTasks as any;
      if (Array.isArray(tasks)) {
        tasks.forEach((task: any) => {
          if (task.id) tutorialStatuses[task.id] = task.status || 'not_started';
        });
      } else if (typeof tasks === 'object') {
        tutorialStatuses = tasks as Record<string, string>;
      }
    }

    // Update status for this tutorial
    tutorialStatuses[tutorialId] = status;

    // Update database
    await prisma.ecomStats.upsert({
      where: { ownerUid },
      update: {
        tutorialTasks: tutorialStatuses,
      },
      create: {
        ownerUid,
        tutorialTasks: tutorialStatuses,
        tutorialsCompleted: status === 'completed' ? 1 : 0,
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
      tutorialId,
      status,
    });
  } catch (error) {
    console.error('Error updating tutorial status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
