import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/settings
 * Fetch current user's settings including profile and organization data
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
        memberships: {
          where: { status: 'ACTIVE' },
          take: 1,
          select: {
            organization: {
              select: {
                id: true,
                name: true,
                language: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const organization = user.memberships[0]?.organization;

    return NextResponse.json({
      profile: {
        email: user.email,
        displayName: user.displayName || user.fullName,
        firstName: user.firstName || user.fullName.split(' ')[0] || '',
        lastName: user.lastName || user.fullName.split(' ').slice(1).join(' ') || '',
        avatarUrl: user.avatarUrl,
      },
      preferences: {
        language: user.lang,
        timezone: user.timezone,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
      },
      organization: organization
        ? {
            name: organization.name,
            language: organization.language,
            timezone: organization.timezone,
          }
        : null,
    });
  } catch (error) {
    console.error('[GET /api/user/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings
 * Update current user's settings and organization settings
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile, preferences, organization } = body;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user profile
      const updatedUser = await tx.user.update({
        where: { id: currentUser.uid },
        data: {
          ...(profile?.displayName !== undefined && { displayName: profile.displayName }),
          ...(profile?.firstName !== undefined && { firstName: profile.firstName }),
          ...(profile?.lastName !== undefined && { lastName: profile.lastName }),
          ...(profile?.avatarUrl !== undefined && { avatarUrl: profile.avatarUrl }),
          ...(preferences?.language !== undefined && { lang: preferences.language }),
          ...(preferences?.timezone !== undefined && { timezone: preferences.timezone }),
          ...(preferences?.emailNotifications !== undefined && {
            emailNotifications: preferences.emailNotifications,
          }),
          ...(preferences?.pushNotifications !== undefined && {
            pushNotifications: preferences.pushNotifications,
          }),
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
          memberships: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: {
              organization: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      // Update organization settings if provided
      let updatedOrg = null;
      if (organization && updatedUser.memberships[0]?.organization) {
        updatedOrg = await tx.organization.update({
          where: { id: updatedUser.memberships[0].organization.id },
          data: {
            ...(organization.name !== undefined && { name: organization.name }),
            ...(organization.language !== undefined && { language: organization.language }),
            ...(organization.timezone !== undefined && { timezone: organization.timezone }),
          },
          select: {
            name: true,
            language: true,
            timezone: true,
          },
        });
      }

      return { user: updatedUser, organization: updatedOrg };
    });

    return NextResponse.json({
      profile: {
        email: result.user.email,
        displayName: result.user.displayName || result.user.fullName,
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        avatarUrl: result.user.avatarUrl,
      },
      preferences: {
        language: result.user.lang,
        timezone: result.user.timezone,
        emailNotifications: result.user.emailNotifications,
        pushNotifications: result.user.pushNotifications,
      },
      organization: result.organization,
    });
  } catch (error) {
    console.error('[PUT /api/user/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
