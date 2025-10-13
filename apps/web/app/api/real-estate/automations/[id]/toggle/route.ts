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
 * POST /api/real-estate/automations/[id]/toggle
 * Toggle automation status between ACTIVE and PAUSED
 */
export async function POST(
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

    // Toggle status
    const newStatus = existing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    const automation = await prisma.automation.update({
      where: { id: params.id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      automation,
      message: `Automation ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`,
    });
  } catch (error: any) {
    console.error('Error toggling automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
