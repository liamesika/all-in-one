import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin.server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);

    // Verify Firebase ID token
    const decodedToken = await adminAuth().verifyIdToken(idToken, true);

    const body = await request.json();
    const { displayName, avatarUrl } = body;

    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json(
        { message: 'Display name is required' },
        { status: 400 }
      );
    }

    // Update Firebase user profile
    await adminAuth().updateUser(decodedToken.uid, {
      displayName: displayName.trim(),
      photoURL: avatarUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      profile: {
        displayName: displayName.trim(),
        avatarUrl: avatarUrl || null,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
