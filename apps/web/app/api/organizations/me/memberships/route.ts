import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'demo-membership',
      orgId: 'demo-org',
      role: 'OWNER',
      status: 'ACTIVE',
      userId: 'demo-user',
      organization: {
        id: 'demo-org',
        name: 'Demo Production Company',
        slug: 'demo-production',
        planTier: 'pro',
        seatLimit: 10,
        usedSeats: 1,
        ownerUserId: 'demo-user',
      },
    },
  ]);
}