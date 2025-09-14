// apps/api/src/modules/real-estate-properties/real-estate-properties.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { UpdatePropertyDto } from './dtos/update-property.dto';
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

type ListQuery = { 
  q?: string; 
  status?: string; 
  provider?: string; 
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

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
async getBySlug(slug: string) {
  const row = await this.prisma.property.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { photos: true },
  });
  if (!row) throw new NotFoundException('Property not found');
  return row;
}

  async list(ownerUid: string, args: ListQuery = {}) {
    // Pagination parameters
    const limit = Math.max(1, Math.min(100, Number(args.limit || 20))); // Reduced default from 50 to 20
    const page = Math.max(1, Number(args.page || 1));
    const offset = args.offset !== undefined ? Number(args.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    // Build where clause
    const where: any = { ownerUid };

    if (args.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(args.status)) {
      where.status = args.status;
    }
    if (args.provider && ['MANUAL', 'YAD2', 'MADLAN'].includes(args.provider)) {
      where.provider = args.provider;
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

    // Build orderBy clause
    let orderBy: any[] = [{ createdAt: 'desc' }]; // Default sort
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'city', 'status'];
    if (args.sortBy && validSortFields.includes(args.sortBy)) {
      const sortOrder = args.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [args.sortBy]: sortOrder }];
    }

    // Execute queries in parallel for better performance
    const [rows, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { 
          photos: {
            orderBy: { sortIndex: 'asc' },
            take: 3 // Only load first 3 photos for list view performance
          }
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    // Pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      total,
      rows,
      pagination: {
        page,
        limit,
        offset: skip,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      meta: {
        count: rows.length,
        took: Date.now(), // Can be used for performance monitoring
      }
    };
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
      bedrooms: dto.rooms ?? null, // Map 'rooms' from frontend to 'bedrooms' in DB
      areaSqm: dto.size ?? null,   // Map 'size' from frontend to 'areaSqm' in DB  
      price: dto.price ?? null,
      agentName: dto.agentName ?? null,
      agentPhone: dto.agentPhone ?? null,
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

    const uploaded: { url: string }[] = [];
    for (const file of files) {
      const key = `real-estate/properties/${id}/${Date.now()}_${file.originalname}`;
      const url = await this.storage.uploadPublic(key, file.buffer, file.mimetype);
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
