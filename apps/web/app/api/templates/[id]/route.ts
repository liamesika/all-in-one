export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const updateData = body;

    // In a real app, this would update the template in the database
    console.log(`Updating template ${id} for owner ${ownerUid}:`, updateData);

    return NextResponse.json({
      success: true,
      templateId: id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update template API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params as { id: string };
    const ownerUid = getOwnerUid(user);

    // In a real app, this would delete the template from the database
    console.log(`Deleting template ${id} for owner ${ownerUid}`);

    return NextResponse.json({
      success: true,
      templateId: id,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete template API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});