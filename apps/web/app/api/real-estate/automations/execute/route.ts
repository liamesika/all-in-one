export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { AutomationEngine, AutomationContext } from '@/lib/automation-engine';

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

/**
 * POST /api/real-estate/automations/execute
 * Internal endpoint to execute automations
 * Called by event triggers throughout the application
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const ownerUid = decodedToken.uid;

    const body = await request.json();
    const { automationId, context } = body;

    if (!automationId || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: automationId, context' },
        { status: 400 }
      );
    }

    const engine = new AutomationEngine();
    const executionContext: AutomationContext = {
      ...context,
      ownerUid,
    };

    await engine.execute(automationId, executionContext);

    return NextResponse.json({
      success: true,
      message: 'Automation executed successfully',
    });
  } catch (error: any) {
    console.error('Error executing automation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
