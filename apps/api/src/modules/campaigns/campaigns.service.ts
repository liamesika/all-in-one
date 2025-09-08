import { Injectable, NotFoundException } from '@nestjs/common';
const { PrismaClient } = require('@prisma/client');

type ListQuery = { q?: string; status?: string; limit?: number };

@Injectable()
export class CampaignsService {
  private prisma = new PrismaClient();

  async list(ownerUid: string, query?: ListQuery) {
    const where: any = { ownerUid };
    if (query?.status) where.status = query.status;
    if (query?.q) {
      where.OR = [
        { goal: { contains: query.q, mode: 'insensitive' } },
        { copy: { contains: query.q, mode: 'insensitive' } },
        { platform: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const take = Math.max(1, Math.min(200, Number(query?.limit || 100)));
    return this.prisma.campaign.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take,
    });
  }

  async get(ownerUid: string, id: string) {
    const row = await this.prisma.campaign.findFirst({ where: { id, ownerUid } });
    if (!row) throw new NotFoundException('Campaign not found');
    return row;
  }

  async create(ownerUid: string, dto: any) {
    return this.prisma.campaign.create({
      data: {
        ownerUid,
        goal: dto?.goal ?? 'sales',
        copy: dto?.copy ?? '',
        image: dto?.image ?? null,
        audience: dto?.audience ?? undefined, // JSON
        platform: dto?.platform ?? null,
        status: dto?.status ?? 'DRAFT',
      },
    });
  }

  async update(ownerUid: string, id: string, dto: any) {
    // validate ownership
    const existing = await this.prisma.campaign.findFirst({ where: { id, ownerUid } });
    if (!existing) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: {
        goal: dto?.goal ?? undefined,
        copy: dto?.copy ?? undefined,
        image: dto?.image ?? undefined,
        audience: dto?.audience ?? undefined,
        platform: dto?.platform ?? undefined,
        status: dto?.status ?? undefined,
      },
    });
  }

  async hardDelete(ownerUid: string, id: string): Promise<boolean> {
    const existing = await this.prisma.campaign.findFirst({
      where: { id, ownerUid },
      select: { id: true },
    });
    if (!existing) return false;
    await this.prisma.campaign.delete({ where: { id } });
    return true;
  }
}
