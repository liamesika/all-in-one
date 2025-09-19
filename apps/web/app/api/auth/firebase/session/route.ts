import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'No idToken provided' },
        { status: 400 }
      );
    }

    // For now, decode the token to get email (in production, verify with Firebase Admin SDK)
    try {
      // Basic JWT decode to extract email from payload
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      const email = payload.email;

      if (email) {
        // Fetch user with profile to get default vertical
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            userProfile: true
          }
        });

        if (user?.userProfile?.defaultVertical) {
          // Log the user's default vertical type to console
          console.log(`User ${email} logged in with default vertical: ${user.userProfile.defaultVertical.toLowerCase().replace('_', '-')}`);
        }
      }
    } catch (tokenError) {
      console.error('Error decoding token for user lookup:', tokenError);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Session created successfully',
      hasToken: !!idToken
    });

    // Set a session cookie
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5 // 5 days
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}