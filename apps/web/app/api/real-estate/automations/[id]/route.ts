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
 * GET /api/real-estate/automations/[id]
 * Fetch a specific automation with execution history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    const automation = await prisma.automation.findFirst({
      where: {
        id: params.id,
        ownerUid,
      },
      include: {
        executions: {
          take: 50,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json(automation);
  } catch (error: any) {
    console.error('Error fetching automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/real-estate/automations/[id]
 * Update an automation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: {
        id: params.id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, trigger, actions, conditions, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (actions !== undefined) updateData.actions = actions;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (status !== undefined) updateData.status = status;

    const automation = await prisma.automation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(automation);
  } catch (error: any) {
    console.error('Error updating automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/real-estate/automations/[id]
 * Delete an automation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: {
        id: params.id,
        ownerUid,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    await prisma.automation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
