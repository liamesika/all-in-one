/**
 * Snooze notification (hide temporarily)
 * PATCH /api/notifications/[id]/snooze
 * Rate limit: 120/min/org
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

const snoozeSchema = z.object({
  duration: z.enum(['1h', '24h']),
});

export const PATCH = withAuthAndOrg(async (request: NextRequest, { user, orgId, params }) => {
  const { id } = params;
  const body = await request.json();
  const validated = snoozeSchema.parse(body);

  // Verify notification belongs to org
  const notification = await prisma.notification.findFirst({
    where: { id, orgId },
  });

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  // Calculate snooze until
  const now = new Date();
  const snoozeUntil = new Date(now);
  if (validated.duration === '1h') {
    snoozeUntil.setHours(snoozeUntil.getHours() + 1);
  } else {
    snoozeUntil.setHours(snoozeUntil.getHours() + 24);
  }

  // Snooze
  const updated = await prisma.notification.update({
    where: { id },
    data: { snoozeUntil },
  });

  return NextResponse.json({ notification: updated });
});
