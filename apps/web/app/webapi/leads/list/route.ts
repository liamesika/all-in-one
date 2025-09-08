import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const status = searchParams.get('status') || undefined;
    const bucket = searchParams.get('bucket') || undefined;
    const ownerId = searchParams.get('owner') || undefined;
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));

    const where: any = {
      ...(status ? { status } : {}),
      ...(bucket ? { bucket } : {}),
      ...(ownerId ? { ownerId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true,
        interest: true, budget: true, score: true, status: true,
        bucket: true, ownerId: true, createdAt: true,
      },
    });

    return NextResponse.json({ items: leads });
  } catch (e: any) {
    console.error('leads/list error:', e);
    return NextResponse.json({ error: e?.message || 'list_failed' }, { status: 500 });
  }
}
