
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLawClientDto } from './dtos/create-law-client.dto';
import { UpdateLawClientDto } from './dtos/update-law-client.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  clientType?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawClientsService {
  constructor() {}
    private prisma = new PrismaClient();
  /**
   * List clients with pagination, search, and filters
   */
  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    // Build where clause
    const where: any = { ownerUid, organizationId };

    // Client type filter
    if (query.clientType && ['individual', 'corporate'].includes(query.clientType)) {
      where.clientType = query.clientType;
    }

    // Search query
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { phone: { contains: query.q, mode: 'insensitive' } },
        { company: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any[] = [{ createdAt: 'desc' }];
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'clientType'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.lawClient.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              cases: true,
            },
          },
        },
      }),
      this.prisma.lawClient.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        offset: skip,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get single client with related cases and invoices
   */
  async get(ownerUid: string, organizationId: string, id: string) {
    const client = await this.prisma.lawClient.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
              },
            },
            _count: {
              select: {
                documents: true,
                tasks: true,
                events: true,
                invoices: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Get invoices across all cases for this client
    const invoices = await this.prisma.lawInvoice.findMany({
      where: {
        ownerUid,
        organizationId,
        case: {
          clientId: id,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      ...client,
      invoices,
    };
  }

  /**
   * Create a new client
   */
  async create(ownerUid: string, organizationId: string, dto: CreateLawClientDto) {
    // Check for duplicate email
    const existing = await this.prisma.lawClient.findFirst({
      where: {
        ownerUid,
        organizationId,
        email: dto.email,
      },
    });

    if (existing) {
      throw new BadRequestException('Client with this email already exists');
    }

    const client = await this.prisma.lawClient.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        clientType: dto.clientType,
        tags: dto.tags || [],
        notes: dto.notes,
        ownerUid,
        organizationId,
      },
    });

    return client;
  }

  /**
   * Update a client
   */
  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawClientDto) {
    const existing = await this.prisma.lawClient.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Client not found');
    }

    // Check for duplicate email if changing
    if (dto.email && dto.email !== existing.email) {
      const duplicate = await this.prisma.lawClient.findFirst({
        where: {
          ownerUid,
          organizationId,
          email: dto.email,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new BadRequestException('Client with this email already exists');
      }
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.company !== undefined) data.company = dto.company;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.clientType !== undefined) data.clientType = dto.clientType;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.lawClient.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete a client
   */
  async delete(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawClient.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Client not found');
    }

    // Prevent deletion if client has active cases
    if (existing._count.cases > 0) {
      throw new BadRequestException('Cannot delete client with active cases');
    }

    await this.prisma.lawClient.delete({ where: { id } });

    return { success: true, id };
  }
}
