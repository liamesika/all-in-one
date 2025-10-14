/**
 * Notifications API - Sprint A2
 * GET: List notifications with filtering and pagination
 * Rate limit: 60/min/org
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';
import { NotificationType } from '@prisma/client';

const querySchema = z.object({
  tab: z.enum(['all', 'alerts', 'mentions', 'system']).optional().default('all'),
  unreadOnly: z.string().optional().transform(val => val === 'true'),
  since: z.string().optional(), // ISO timestamp for polling
  limit: z.string().optional().transform(val => parseInt(val || '50')),
  offset: z.string().optional().transform(val => parseInt(val || '0')),
});

// Tab to type mapping
const ALERT_TYPES: NotificationType[] = [
  'LEAD_SLA',
  'EXPORT_FAILED',
  'AUTOMATION_FAILED',
  'EXPORT_FAILED_PACK',
  'AUTOMATION_FAILURE',
];

const SYSTEM_TYPES: NotificationType[] = [
  'SYSTEM_RELEASE',
  'SYSTEM_BILLING',
  'SYSTEM_QUOTA',
];

/**
 * GET /api/notifications
 * List notifications with tab filtering, pagination, ETag support
 */
export const GET = withAuthAndOrg(async (request: NextRequest, { user, orgId }) => {
  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse(Object.fromEntries(searchParams));

  const now = new Date();

  // Base where clause: org-scoped, not dismissed, not snoozed (or snooze expired)
  const where: any = {
    orgId,
    dismissedAt: null,
    OR: [
      { snoozeUntil: null },
      { snoozeUntil: { lte: now } },
    ],
  };

  // Apply tab filtering
  if (validated.tab === 'alerts') {
    where.type = { in: ALERT_TYPES };
  } else if (validated.tab === 'mentions') {
    where.type = 'MENTION';
    where.userId = user.uid; // Mentions are user-specific
  } else if (validated.tab === 'system') {
    where.type = { in: SYSTEM_TYPES };
  }

  // Unread filter
  if (validated.unreadOnly) {
    where.readAt = null;
  }

  // Since filter (for polling)
  if (validated.since) {
    where.createdAt = { gt: new Date(validated.since) };
  }

  // Fetch notifications
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: validated.limit,
      skip: validated.offset,
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        body: true,
        entityType: true,
        entityId: true,
        actionUrl: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
  ]);

  // Calculate unread count (excluding snoozed/dismissed)
  const unreadCount = await prisma.notification.count({
    where: {
      orgId,
      readAt: null,
      dismissedAt: null,
      OR: [
        { snoozeUntil: null },
        { snoozeUntil: { lte: now } },
      ],
    },
  });

  // ETag support for efficient polling
  const etag = notifications.length > 0
    ? `"${notifications[0].id}-${notifications[0].createdAt.getTime()}"`
    : '"empty"';

  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 }); // Not Modified
  }

  return NextResponse.json(
    {
      notifications,
      pagination: {
        total,
        limit: validated.limit,
        offset: validated.offset,
        hasMore: validated.offset + validated.limit < total,
      },
      unreadCount,
    },
    {
      headers: {
        'ETag': etag,
        'Cache-Control': 'private, max-age=15', // 15s cache for polling
      },
    }
  );
});
