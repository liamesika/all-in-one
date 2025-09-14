import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status') || undefined;
    const bucket = searchParams.get('bucket') || undefined;   // UI-only for now
    const ownerId = searchParams.get('owner') || undefined;   // UI param
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));

    // Build WHERE with fields we know are stable; keep this as 'any' to avoid type friction
    const where: any = {
      ...(status ? { status } : {}),
      ...(ownerId ? { ownerUid: ownerId } : {}),
    };

    if (q) {
      // Be conservative: search only columns that we’re confident exist across revisions
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        // If your schema has preferredCity, this will work; if not, Prisma will complain at runtime — remove if needed.
        { preferredCity: { contains: q, mode: 'insensitive' } },
      ];
    }

    // No 'select' → avoid TS errors about unknown columns
    const rows = await prisma.realEstateLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Map defensively to your UI shape
    const items = (rows as any[]).map((r) => {
      const name = r.clientName ?? r.name ?? null;
      const city = r.preferredCity ?? r.city ?? null;

      let budget = null as null | { min: number | null; max: number | null };
      if (r.budgetMin != null || r.budgetMax != null) {
        budget = { min: r.budgetMin ?? null, max: r.budgetMax ?? null };
      } else if (r.budget != null) {
        // if old schema had a single 'budget' field
        budget = { min: r.budget, max: r.budget };
      }

      return {
        id: r.id,
        name,
        email: r.email ?? null,
        phone: r.phone ?? null,
        interest: r.propertyType ?? r.interest ?? null, // fallback if your schema has it
        budget,
        score: r.score ?? null,
        status: r.status,
        bucket: bucket ?? r.bucket ?? r.status,
        ownerId: r.ownerUid ?? r.ownerId ?? null,
        createdAt: r.createdAt,
        city,
        // property: r.property ? { id: r.property.id, name: r.property.name } : null, // if you include relation later
      };
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error('leads/list error:', e);
    return NextResponse.json({ error: e?.message || 'list_failed' }, { status: 500 });
  }
}
