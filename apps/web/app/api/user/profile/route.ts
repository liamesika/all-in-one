import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile
 * Fetch current user's profile data
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.uid },
      select: {
        id: true,
        email: true,
        fullName: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        lang: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        email: user.email,
        displayName: user.displayName || user.fullName,
        firstName: user.firstName || user.fullName.split(' ')[0] || '',
        lastName: user.lastName || user.fullName.split(' ').slice(1).join(' ') || '',
        avatarUrl: user.avatarUrl,
        language: user.lang,
        timezone: user.timezone,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
      },
    });
  } catch (error) {
    console.error('[GET /api/user/profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile data
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      displayName,
      firstName,
      lastName,
      avatarUrl,
      language,
      timezone,
      emailNotifications,
      pushNotifications,
    } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.uid },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(language !== undefined && { lang: language }),
        ...(timezone !== undefined && { timezone }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        lang: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      profile: {
        email: updatedUser.email,
        displayName: updatedUser.displayName || updatedUser.fullName,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        avatarUrl: updatedUser.avatarUrl,
        language: updatedUser.lang,
        timezone: updatedUser.timezone,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
      },
    });
  } catch (error) {
    console.error('[PUT /api/user/profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
