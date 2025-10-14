import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (request, { user }) => {
  return NextResponse.json({ success: true });
});
