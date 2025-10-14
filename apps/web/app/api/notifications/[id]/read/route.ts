/**
 * Mark notification as read
 * PATCH /api/notifications/[id]/read
 * Rate limit: 120/min/org
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

export const PATCH = withAuthAndOrg(async (request: NextRequest, { user, orgId, params }) => {
  const { id } = params;

  // Verify notification belongs to org
  const notification = await prisma.notification.findFirst({
    where: { id, orgId },
  });

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  // Mark as read
  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ notification: updated });
});
