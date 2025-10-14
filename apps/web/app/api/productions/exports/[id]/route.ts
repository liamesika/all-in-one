import { NextResponse } from 'next/server';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma.server';

export const GET = withAuthAndOrg(async (request, { user, orgId, params }) => {
  const { id } = params as { id: string };

  const exportPack = await prisma.creativeExportPack.findFirst({
    where: {
      id,
      project: { orgId },
    },
    include: {
      project: { select: { id: true, name: true, status: true } },
      campaign: { select: { id: true, name: true, status: true } },
    },
  });

  if (!exportPack) {
    return NextResponse.json({ error: 'Export pack not found' }, { status: 404 });
  }

  return NextResponse.json({ exportPack });
});

export const DELETE = withAuthAndOrg(async (request, { user, orgId, params }) => {
  const { id } = params as { id: string };

  const exportPack = await prisma.creativeExportPack.findFirst({
    where: {
      id,
      project: { orgId },
    },
  });

  if (!exportPack) {
    return NextResponse.json({ error: 'Export pack not found' }, { status: 404 });
  }

  await prisma.creativeExportPack.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: 'Export pack deleted successfully',
  });
});
