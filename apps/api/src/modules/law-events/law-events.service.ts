
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLawEventDto } from './dtos/create-law-event.dto';
import { UpdateLawEventDto } from './dtos/update-law-event.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  eventType?: string;
  caseId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawEventsService {
  constructor() {}
    private prisma = new PrismaClient();
  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    const where: any = { ownerUid, organizationId };

    if (query.eventType) where.eventType = query.eventType;
    if (query.caseId) where.caseId = query.caseId;

    if (query.startDate || query.endDate) {
      where.eventDate = {};
      if (query.startDate) where.eventDate.gte = new Date(query.startDate);
      if (query.endDate) where.eventDate.lte = new Date(query.endDate);
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any[] = [{ eventDate: 'asc' }];
    const validSortFields = ['eventDate', 'createdAt', 'updatedAt', 'title'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    const [data, total] = await Promise.all([
      this.prisma.lawEvent.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.lawEvent.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        offset: skip,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async get(ownerUid: string, organizationId: string, id: string) {
    const event = await this.prisma.lawEvent.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        case: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(ownerUid: string, organizationId: string, dto: CreateLawEventDto) {
    if (dto.caseId) {
      const caseExists = await this.prisma.lawCase.findFirst({
        where: { id: dto.caseId, ownerUid, organizationId },
      });
      if (!caseExists) {
        throw new BadRequestException('Case not found');
      }
    }

    const event = await this.prisma.lawEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        eventDate: new Date(dto.eventDate),
        duration: dto.duration,
        location: dto.location,
        caseId: dto.caseId,
        attendeeIds: dto.attendeeIds || [],
        status: dto.status || 'scheduled',
        ownerUid,
        organizationId,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
    });

    return event;
  }

  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawEventDto) {
    const existing = await this.prisma.lawEvent.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.eventType !== undefined) data.eventType = dto.eventType;
    if (dto.eventDate !== undefined) data.eventDate = new Date(dto.eventDate);
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.caseId !== undefined) data.caseId = dto.caseId;
    if (dto.attendeeIds !== undefined) data.attendeeIds = dto.attendeeIds;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.lawEvent.update({
      where: { id },
      data,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
    });
  }

  async delete(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawEvent.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.lawEvent.delete({ where: { id } });

    return { success: true, id };
  }

  async getCalendarView(ownerUid: string, organizationId: string, startDate: string, endDate: string) {
    const events = await this.prisma.lawEvent.findMany({
      where: {
        ownerUid,
        organizationId,
        eventDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { eventDate: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
    });

    return { events };
  }
}
