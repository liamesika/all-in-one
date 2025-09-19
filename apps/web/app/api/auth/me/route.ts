import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix

    try {
      // Basic JWT decode to extract email from payload
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const email = payload.email;

      if (!email) {
        return NextResponse.json(
          { error: 'Invalid token: no email found' },
          { status: 401 }
        );
      }

      // Fetch user with profile to get default vertical
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userProfile: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        defaultVertical: user.userProfile?.defaultVertical,
        message: 'User data retrieved successfully'
      });

    } catch (tokenError) {
      console.error('Error decoding token:', tokenError);
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}