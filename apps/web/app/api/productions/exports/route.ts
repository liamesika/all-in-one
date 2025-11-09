export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';
import { getChannelSpec } from '@/lib/exportChannelSpecs';

const createExportSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  channels: z.array(z.string()).min(1),
  assetIds: z.array(z.string().uuid()).min(1),
  includeHandoff: z.boolean().default(true),
});

export const GET = withAuthAndOrg(async (request, { user, orgId }) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');

  const where: any = {
    project: { orgId },
  };

  if (projectId) {
    where.projectId = projectId;
  }

  if (status) {
    where.status = status;
  }

  const exports = await prisma.creativeExportPack.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ exports });
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  try {
    const body = await request.json();
    const validated = createExportSchema.parse(body);

    // Verify project belongs to org
    const project = await prisma.creativeProject.findFirst({
      where: { id: validated.projectId, orgId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify all assets belong to project
    const assets = await prisma.creativeAsset.findMany({
      where: {
        id: { in: validated.assetIds },
        projectId: validated.projectId,
      },
    });

    if (assets.length !== validated.assetIds.length) {
      return NextResponse.json(
        { error: 'Some assets not found or do not belong to project' },
        { status: 400 }
      );
    }

    // Build export specifications
    const specs = validated.channels.map((channelKey) => {
      const spec = getChannelSpec(channelKey);
      if (!spec) {
        throw new Error(`Unknown channel: ${channelKey}`);
      }
      return {
        channel: channelKey,
        ...spec,
      };
    });

    // Generate canonical filenames
    const filenames = validated.channels.map((channelKey, idx) => {
      const spec = getChannelSpec(channelKey);
      const sanitizedName = validated.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = spec?.fileFormat[0].toLowerCase() || 'mp4';
      return `${sanitizedName}_${channelKey}.${extension}`;
    });

    // Create export pack record
    const exportPack = await prisma.creativeExportPack.create({
      data: {
        projectId: validated.projectId,
        name: validated.name,
        channels: validated.channels,
        assetIds: validated.assetIds,
        specs: specs as any,
        filenames,
        status: 'PENDING',
        includeHandoff: validated.includeHandoff,
      },
      include: {
        project: true,
      },
    });

    // TODO: Queue job to generate zip file
    // In production, this would:
    // 1. Download assets from storage
    // 2. Process/resize for each channel spec
    // 3. Generate PDF handoff document
    // 4. Create zip archive
    // 5. Upload to storage
    // 6. Update status to READY with downloadUrl

    return NextResponse.json(
      {
        exportPack,
        message: 'Export pack created successfully. Processing will begin shortly.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create export pack', message: error.message },
      { status: 500 }
    );
  }
});
