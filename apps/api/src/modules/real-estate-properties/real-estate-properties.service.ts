// apps/api/src/modules/real-estate-properties/real-estate-properties.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

/** RTL-friendly slugify that keeps Hebrew letters */
function slugifyLite(input: string): string {
  const s = (input || '')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
  return s || `${Date.now()}`;
}

type CreatePropertyDto = {
  name: string;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  description?: string | null;
  status?: string | null;   // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'  (נשלח רק אם סופק)
  type?: string | null;     // enum בפריזמה – לא נשלח אם לא סופק
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  price?: number | null;
  currency?: string | null; // enum/טקסט – לא נשלח אם לא סופק
  amenities?: string | null;
  agentName?: string | null;
  agentPhone?: string | null;
  coverImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  slug?: string | null;
  photos?: string[];
};

type UpdatePropertyDto = Partial<CreatePropertyDto>;
type ListQuery = { q?: string; status?: string; limit?: number };

@Injectable()
export class RealEstatePropertiesService {
  private prisma = new PrismaClient();

  constructor(private readonly storage: StorageService) {}

  private async ensureUniqueSlug(base: string, ownerUid: string): Promise<string> {
    const baseSlug = slugifyLite(base);
    let slug = baseSlug || `${Date.now()}`;
    let n = 1;
    while (true) {
      const exists = await this.prisma.property.findFirst({ where: { ownerUid, slug } });
      if (!exists) return slug;
      slug = `${baseSlug}-${n++}`;
    }
  }

  async list(ownerUid: string, args: ListQuery = {}) {
    const take = Math.max(1, Math.min(100, Number(args.limit || 50)));
    const where: any = { ownerUid };

    if (args.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(args.status)) {
      where.status = args.status;
    }
    if (args.q) {
      where.OR = [
        { name: { contains: args.q, mode: 'insensitive' } },
        { city: { contains: args.q, mode: 'insensitive' } },
        { address: { contains: args.q, mode: 'insensitive' } },
        { neighborhood: { contains: args.q, mode: 'insensitive' } },
        { description: { contains: args.q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.property.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take,
      include: { photos: true },
    });
    const total = await this.prisma.property.count({ where });
    return { total, rows };
  }

  async get(ownerUid: string, id: string) {
    const row = await this.prisma.property.findFirst({
      where: { ownerUid, id },
      include: { photos: true, leads: true },
    });
    if (!row) throw new NotFoundException('Property not found');
    return row;
  }

  async create(ownerUid: string, dto: CreatePropertyDto) {
    if (!dto?.name?.trim()) throw new BadRequestException('name is required');

    // שדות טקסט – אם הסכמה שלך לא מאפשרת NULL, נספק מחרוזת ריקה כברירת מחדל.
    const address = (dto.address ?? '').trim();
    const city = (dto.city ?? '').trim();
    const neighborhood = (dto.neighborhood ?? '').trim();
    const description = (dto.description ?? '').trim();

    const baseForSlug = [dto.slug, dto.name, city, address].filter(Boolean).join('-');
    const slug = await this.ensureUniqueSlug(baseForSlug, ownerUid);

    // נבנה data בצורה דינמית ונשאיר ערכים שלא סופקו כ-undefined (כדי לא לגעת ב-defaults/Enums)
    const data: any = {
      ownerUid,
      name: dto.name.trim(),
      slug,
      address,
      city,
      neighborhood,
      description,
      bedrooms: dto.bedrooms ?? null,
      bathrooms: dto.bathrooms ?? null,
      areaSqm: dto.areaSqm ?? null,
      floor: dto.floor ?? null,
      yearBuilt: dto.yearBuilt ?? null,
      price: dto.price ?? null,
      amenities: dto.amenities ?? null,
      agentName: dto.agentName ?? null,
      agentPhone: dto.agentPhone ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    };

    // enums/שדות עם ולידציית ערכים — נשלח רק אם סופק כדי לא לטעות בערך
    if (dto.status) data.status = dto.status;
    if (dto.type) data.type = dto.type;
    if (dto.currency) data.currency = dto.currency;

    // photos nested (רק אם נשלחו)
    if (dto.photos && dto.photos.length) {
      data.photos = {
        create: dto.photos.map((url, idx) => ({ url, sortIndex: idx })),
      };
    }

    return this.prisma.property.create({
      data,
      include: { photos: true },
    });
  }

  async update(ownerUid: string, id: string, dto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findFirst({ where: { ownerUid, id } });
    if (!existing) throw new NotFoundException('Property not found');

    let nextSlug = existing.slug as string | null;
    if (dto.slug || dto.name || dto.city || dto.address) {
      const baseForSlug = [
        dto.slug ?? existing.slug ?? '',
        dto.name ?? existing.name,
        dto.city ?? existing.city ?? '',
        dto.address ?? existing.address ?? '',
      ]
        .filter(Boolean)
        .join('-');
      nextSlug = await this.ensureUniqueSlug(baseForSlug, ownerUid);
    }

    const data: any = {
      name: dto.name?.trim(),
      slug: nextSlug ?? undefined,
      address: dto.address !== undefined ? (dto.address ?? '') : undefined,
      city: dto.city !== undefined ? (dto.city ?? '') : undefined,
      neighborhood: dto.neighborhood !== undefined ? (dto.neighborhood ?? '') : undefined,
      description: dto.description !== undefined ? (dto.description ?? '') : undefined,
      bedrooms: dto.bedrooms ?? undefined,
      bathrooms: dto.bathrooms ?? undefined,
      areaSqm: dto.areaSqm ?? undefined,
      floor: dto.floor ?? undefined,
      yearBuilt: dto.yearBuilt ?? undefined,
      price: dto.price ?? undefined,
      amenities: dto.amenities ?? undefined,
      agentName: dto.agentName ?? undefined,
      agentPhone: dto.agentPhone ?? undefined,
      coverImageUrl: dto.coverImageUrl ?? undefined,
      seoTitle: dto.seoTitle ?? undefined,
      seoDescription: dto.seoDescription ?? undefined,
    };

    if (dto.status !== undefined && dto.status !== null) data.status = dto.status;
    if (dto.type !== undefined && dto.type !== null) data.type = dto.type;
    if (dto.currency !== undefined && dto.currency !== null) data.currency = dto.currency;

    return this.prisma.property.update({
      where: { id },
      data,
      include: { photos: true },
    });
  }

  async remove(ownerUid: string, id: string) {
    const existing = await this.prisma.property.findFirst({ where: { ownerUid, id } });
    if (!existing) throw new NotFoundException('Property not found');
    await this.prisma.property.delete({ where: { id } });
    return { ok: true, id };
  }

  async hardDelete(ownerUid: string, id: string) {
    return this.remove(ownerUid, id);
  }

  async uploadAndAttachPhotos(ownerUid: string, id: string, files: Express.Multer.File[]) {
    const prop = await this.prisma.property.findFirst({
      where: { ownerUid, id },
      include: { photos: true },
    });
    if (!prop) throw new NotFoundException('Property not found');
    if (!files?.length) throw new BadRequestException('no files uploaded');

    if (!this.storage || typeof (this.storage as any).uploadPublic !== 'function') {
      throw new BadRequestException('storage upload not available');
    }

    const uploaded: { url: string }[] = [];
    for (const file of files) {
      const key = `real-estate/properties/${id}/${Date.now()}_${file.originalname}`;
      const url = await (this.storage as any).uploadPublic(key, file.buffer, file.mimetype);
      uploaded.push({ url });
    }

    const maxIndex =
      (prop.photos?.length ? Math.max(...prop.photos.map((p: any) => p.sortIndex || 0)) : -1) | 0;

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        photos: {
          create: uploaded.map((u, i) => ({
            url: u.url,
            sortIndex: maxIndex + 1 + i,
          })),
        },
      },
      include: { photos: true },
    });

    return { ok: true, count: uploaded.length, property: updated };
  }

  async analytics(ownerUid: string) {
    const [total, drafts, published, archived] = await Promise.all([
      this.prisma.property.count({ where: { ownerUid } }),
      this.prisma.property.count({ where: { ownerUid, status: 'DRAFT' } }),
      this.prisma.property.count({ where: { ownerUid, status: 'PUBLISHED' } }),
      this.prisma.property.count({ where: { ownerUid, status: 'ARCHIVED' } }),
    ]);
    return { total, byStatus: { DRAFT: drafts, PUBLISHED: published, ARCHIVED: archived } };
  }
}
