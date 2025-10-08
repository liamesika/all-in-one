// apps/web/app/api/debug/admin/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 [DEBUG/ADMIN] Starting health check...');

    // Import Firebase Admin
    const { getFirebaseAdmin, adminFirestore } = await import('@/lib/firebaseAdmin.server');
    const app = getFirebaseAdmin();
    const db = adminFirestore();

    console.log('🔍 [DEBUG/ADMIN] Firebase Admin app:', app.name);

    // Try to write to Firestore
    const healthRef = db.collection('health').doc('_ping');
    await healthRef.set({ ts: Date.now(), test: 'health-check' }, { merge: true });

    console.log('✅ [DEBUG/ADMIN] Successfully wrote to Firestore health/_ping');

    // Get the project ID from environment and app options
    const envProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
    const appOptions = app.options as any;

    return new Response(
      JSON.stringify({
        ok: true,
        adminProjectId: appOptions.credential?.projectId || 'unknown',
        envProjectId: envProjectId,
        appName: app.name,
        note: 'Wrote health/_ping successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (e: any) {
    console.error('❌ [DEBUG/ADMIN] Health check failed:', {
      message: e.message,
      code: e.code,
      stack: e.stack,
    });

    return new Response(
      JSON.stringify({
        ok: false,
        error: e.message,
        code: e.code,
        envProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID?.trim(),
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
