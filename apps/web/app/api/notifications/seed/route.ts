/**
 * Seed demo notifications (dev-only)
 * POST /api/notifications/seed
 * Creates sample notifications for QA testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndOrg } from '@/lib/apiAuth';
import prisma from '@/lib/prisma.server';

export const POST = withAuthAndOrg(async (request: NextRequest, { user, orgId }) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' && process.env.FEATURE_NOTIFICATION_SEED !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Create diverse demo notifications
  const demoNotifications = [
    // Alerts
    {
      orgId,
      userId: null,
      type: 'LEAD_SLA' as const,
      severity: 'WARN' as const,
      title: 'Lead SLA Breach',
      body: '3 leads have exceeded 24h response time SLA',
      entityType: 'lead',
      actionUrl: '/dashboard/real-estate/leads?filter=overdue',
    },
    {
      orgId,
      userId: null,
      type: 'EXPORT_FAILED' as const,
      severity: 'ERROR' as const,
      title: 'Export Pack Failed',
      body: 'Summer Campaign export failed due to missing assets',
      entityType: 'export',
      entityId: 'exp_demo123',
      actionUrl: '/dashboard/productions/exports/exp_demo123',
    },
    {
      orgId,
      userId: null,
      type: 'AUTOMATION_FAILED' as const,
      severity: 'ERROR' as const,
      title: 'Automation Failed',
      body: 'Lead Auto-Assignment workflow failed for 12 leads',
      entityType: 'automation',
      entityId: 'auto_demo456',
      actionUrl: '/dashboard/real-estate/automations/auto_demo456',
    },

    // Reviews
    {
      orgId,
      userId: user.uid,
      type: 'REVIEW_APPROVED' as const,
      severity: 'SUCCESS' as const,
      title: 'Creative Approved',
      body: 'Downtown Condo Tour video has been approved by Sarah Chen',
      entityType: 'review',
      entityId: 'rev_demo789',
      actionUrl: '/dashboard/productions/reviews/rev_demo789',
    },
    {
      orgId,
      userId: user.uid,
      type: 'REVIEW_CHANGES_REQUESTED' as const,
      severity: 'WARN' as const,
      title: 'Changes Requested',
      body: 'Property Listing Ad needs color correction and shorter runtime',
      entityType: 'review',
      entityId: 'rev_demo101',
      actionUrl: '/dashboard/productions/reviews/rev_demo101',
    },

    // Export Pack
    {
      orgId,
      userId: null,
      type: 'EXPORT_READY' as const,
      severity: 'SUCCESS' as const,
      title: 'Export Pack Ready',
      body: 'Spring Campaign export pack (12 assets) is ready for download',
      entityType: 'export',
      entityId: 'exp_demo202',
      actionUrl: '/dashboard/productions/exports/exp_demo202',
    },

    // System
    {
      orgId,
      userId: null,
      type: 'SYSTEM_RELEASE' as const,
      severity: 'INFO' as const,
      title: 'New Feature: Saved Views',
      body: 'Save your filter combinations and share them with your team',
      actionUrl: '/dashboard/real-estate/leads',
    },
    {
      orgId,
      userId: null,
      type: 'SYSTEM_BILLING' as const,
      severity: 'INFO' as const,
      title: 'Invoice Ready',
      body: 'Your January invoice ($2,850) is now available',
      actionUrl: '/dashboard/billing',
    },
    {
      orgId,
      userId: null,
      type: 'SYSTEM_QUOTA' as const,
      severity: 'WARN' as const,
      title: 'AI Credits Running Low',
      body: 'You have used 850/1000 AI credits this month',
      actionUrl: '/dashboard/billing',
    },

    // Mention
    {
      orgId,
      userId: user.uid,
      type: 'MENTION' as const,
      severity: 'INFO' as const,
      title: 'David mentioned you',
      body: '@you Can you follow up with the Waterfront property lead?',
      entityType: 'lead',
      entityId: 'lead_demo303',
      actionUrl: '/dashboard/real-estate/leads/lead_demo303',
    },

    // Automation Success
    {
      orgId,
      userId: null,
      type: 'AUTOMATION_SUCCESS' as const,
      severity: 'SUCCESS' as const,
      title: 'Automation Complete',
      body: 'Weekly lead distribution completed: 45 leads assigned',
      entityType: 'automation',
      entityId: 'auto_demo404',
      actionUrl: '/dashboard/real-estate/automations/auto_demo404',
    },
  ];

  const created = await prisma.notification.createMany({
    data: demoNotifications,
  });

  return NextResponse.json({
    success: true,
    count: created.count,
    message: `Created ${created.count} demo notifications`,
  });
});
