export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request, { user }) => {
  return NextResponse.json([
    {
      id: 'demo-membership',
      orgId: 'demo-org',
      role: 'OWNER',
      status: 'ACTIVE',
      userId: user.uid,
      organization: {
        id: 'demo-org',
        name: 'Demo Production Company',
        slug: 'demo-production',
        planTier: 'pro',
        seatLimit: 10,
        usedSeats: 1,
        ownerUserId: user.uid,
      },
    },
  ]);
});
