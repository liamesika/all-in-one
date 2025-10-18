import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../../../../../packages/server/db/client';
// טיפוס מקומי כדי לא להסתבך עם גרסאות enum של Prisma
type REStatus = 'NEW' | 'CONTACTED' | 'MEETING' | 'OFFER' | 'DEAL';

type ListArgs = {
  orgId: string;
  q?: string;
  status?: string;
  limit: number;
  includePropertyCount?: boolean;
};

@Injectable()
export class RealEstateLeadsService {
  async list({ orgId, q, status, limit, includePropertyCount }: ListArgs) {
    // עוקפים שגיאות טיפוס בינתיים אם ה-client לא מעודכן
    const db = prisma as any;

    // Prisma ישן? אין mode: 'insensitive' → מסירים אותו
    const orFilter = q
      ? [
          { fullName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { message: { contains: q } },
        ]
      : undefined;

    // Build query options
    const queryOptions: any = {
      where: {
        ownerUid: orgId,
        ...(orFilter ? { OR: orFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, Math.min(1000, limit)),
    };

    // Add property relation if includePropertyCount is true
    if (includePropertyCount) {
      queryOptions.include = {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      };
    }

    const leads = await db.realEstateLead.findMany(queryOptions);

    // If includePropertyCount is requested, add _count field
    if (includePropertyCount) {
      return leads.map((lead: any) => ({
        ...lead,
        _count: {
          properties: lead.propertyId ? 1 : 0, // Each lead can be linked to 0 or 1 property
        },
      }));
    }

    return leads;
  }

  async getOne(id: string) {
    const db = prisma as any;
    const row = await db.realEstateLead.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Lead not found');
    return row;
  }

  async create({ orgId, dto }: { orgId: string; dto: any }) {
    const db = prisma as any;
    const data = {
      ownerUid: orgId,
      clientName: String(dto.clientName || dto.name || '').trim() || '—', // Support both clientName and name
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      propertyType: dto.propertyType ?? null,
      city: dto.city ?? null,
      budgetMin:
        dto.budgetMin !== undefined && dto.budgetMin !== '' ? Number(dto.budgetMin) : null,
      budgetMax:
        dto.budgetMax !== undefined && dto.budgetMax !== '' ? Number(dto.budgetMax) : null,
      source: dto.source ?? null,
      status: (dto.status as REStatus) || 'NEW',
      notes:
  (dto.notes ?? dto.message) != null
    ? String(dto.notes ?? dto.message).trim()
    : null, // Support both notes and message
      propertyId: dto.propertyId ?? null, // Add propertyId field
    };
    return db.realEstateLead.create({ data });
  }

  async update(id: string, dto: any) {
    const db = prisma as any;
    const data: any = { ...dto };
    if ('budgetMin' in data) data.budgetMin = data.budgetMin === '' ? null : Number(data.budgetMin);
    if ('budgetMax' in data) data.budgetMax = data.budgetMax === '' ? null : Number(data.budgetMax);
    return db.realEstateLead.update({ where: { id }, data });
  }

  async hardDelete(id: string) {
    const db = prisma as any;
    return db.realEstateLead.delete({ where: { id } });
  }
}
