import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { ownerUid, ...updateData } = body;

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

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
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

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
}