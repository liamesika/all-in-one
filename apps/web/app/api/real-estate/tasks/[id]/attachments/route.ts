export const dynamic = 'force-dynamic';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';


export const GET = withAuth(async (request, { user, params }) => {
  try {
    const tenantId = getOwnerUid(user);
    const taskId = params.id;

    const task = await prisma.agentTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const attachments = await prisma.agentTaskAttachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user, params }) => {
  try {
    const tenantId = getOwnerUid(user);
    const userId = user.uid;
    const taskId = params.id;
    const body = await request.json();
    const { fileName, fileUrl, fileSize, mimeType } = body;

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'fileName and fileUrl are required' },
        { status: 400 }
      );
    }

    const task = await prisma.agentTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let actor = await prisma.agent.findFirst({
      where: { tenantId, userId },
    });

    if (!actor) {
      actor = await prisma.agent.create({
        data: {
          tenantId,
          userId,
          name: user.email || 'Unknown',
          email: user.email || 'unknown@effinity.com',
          role: 'MANAGER',
        },
      });
    }

    const attachment = await prisma.agentTaskAttachment.create({
      data: {
        taskId,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        uploadedBy: actor.id,
      },
    });

    await prisma.agentTask.update({
      where: { id: taskId },
      data: { hasAttachments: true },
    });

    await prisma.agentTaskActivity.create({
      data: {
        taskId,
        actorId: actor.id,
        type: 'FILE_UPLOADED',
        message: `Uploaded file: ${fileName}`,
      },
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error) {
    console.error('Upload attachment error:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
});
