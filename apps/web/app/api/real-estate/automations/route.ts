import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized (skip during build)
if (getApps().length === 0 && process.env.FIREBASE_PROJECT_ID) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      }),
    });
  } catch (error) {
    console.warn('[Firebase Admin] Initialization failed:', error);
  }
}

const prisma = new PrismaClient();

/**
 * GET /api/real-estate/automations
 * List all automations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    const automations = await prisma.automation.findMany({
      where: { ownerUid },
      orderBy: { createdAt: 'desc' },
      include: {
        executions: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    // Calculate stats for each automation
    const automationsWithStats = automations.map((automation) => {
      const stats = (automation.stats as any) || {
        totalRuns: 0,
        successCount: 0,
        failCount: 0,
        lastRunAt: null,
      };

      const successRate =
        stats.totalRuns > 0 ? (stats.successCount / stats.totalRuns) * 100 : 0;

      return {
        ...automation,
        stats: {
          ...stats,
          successRate: Math.round(successRate),
        },
      };
    });

    return NextResponse.json(automationsWithStats);
  } catch (error: any) {
    console.error('Error fetching automations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/real-estate/automations
 * Create a new automation
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    const body = await request.json();
    const { name, description, trigger, actions, conditions, status } = body;

    // Validate required fields
    if (!name || !trigger || !actions || actions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, trigger, actions' },
        { status: 400 }
      );
    }

    const automation = await prisma.automation.create({
      data: {
        ownerUid,
        name,
        description,
        trigger,
        actions,
        conditions: conditions || null,
        status: status || 'PAUSED',
        stats: {
          totalRuns: 0,
          successCount: 0,
          failCount: 0,
          lastRunAt: null,
        },
      },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
