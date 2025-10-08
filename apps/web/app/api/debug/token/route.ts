// apps/web/app/api/debug/token/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('🔍 [DEBUG/TOKEN] Verifying token...');

    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!idToken) {
      console.error('❌ [DEBUG/TOKEN] Missing token');
      return new Response(
        JSON.stringify({ ok: false, error: 'missing token' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    console.log('🔑 [DEBUG/TOKEN] Token prefix:', idToken.substring(0, 15));

    // Import Firebase Admin
    const { adminAuth } = await import('@/lib/firebaseAdmin.server');
    const auth = adminAuth();

    const decoded = await auth.verifyIdToken(idToken, true);

    console.log('✅ [DEBUG/TOKEN] Token verified:', {
      uid: decoded.uid,
      email: decoded.email,
      aud: decoded.aud,
      iss: decoded.iss,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        uid: decoded.uid,
        email: decoded.email,
        aud: decoded.aud,
        iss: decoded.iss,
        email_verified: decoded.email_verified,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (e: any) {
    console.error('❌ [DEBUG/TOKEN] Token verification failed:', {
      message: e.message,
      code: e.code,
    });

    return new Response(
      JSON.stringify({ ok: false, error: e.message, code: e.code }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}
