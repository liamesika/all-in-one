
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLawCaseDto } from './dtos/create-law-case.dto';
import { UpdateLawCaseDto } from './dtos/update-law-case.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  status?: string;
  caseType?: string;
  priority?: string;
  clientId?: string;
  assignedToId?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawCasesService {
  constructor() {}
    private prisma = new PrismaClient();
  /**
   * Generate unique case number for organization
   */
  private async generateCaseNumber(ownerUid: string, organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LAW-${year}-`;

    // Find the highest case number for this year
    const lastCase = await this.prisma.lawCase.findFirst({
      where: {
        ownerUid,
        caseNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        caseNumber: 'desc',
      },
    });

    if (!lastCase) {
      return `${prefix}001`;
    }

    // Extract number from last case number (e.g., "LAW-2025-042" -> 42)
    const lastNumber = parseInt(lastCase.caseNumber.split('-')[2] || '0');
    const nextNumber = lastNumber + 1;

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * List cases with pagination, search, and filters
   */
  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    // Build where clause
    const where: any = { ownerUid, organizationId };

    // Status filter
    if (query.status && ['active', 'pending', 'closed', 'archived'].includes(query.status)) {
      where.status = query.status;
    }

    // Case type filter
    if (query.caseType && ['civil', 'criminal', 'corporate', 'family', 'immigration', 'other'].includes(query.caseType)) {
      where.caseType = query.caseType;
    }

    // Priority filter
    if (query.priority && ['low', 'medium', 'high', 'urgent'].includes(query.priority)) {
      where.priority = query.priority;
    }

    // Client filter
    if (query.clientId) {
      where.clientId = query.clientId;
    }

    // Assigned attorney filter
    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    // Search query (fuzzy search across multiple fields)
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { caseNumber: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any[] = [{ createdAt: 'desc' }];
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'caseNumber', 'status', 'priority', 'filingDate', 'nextHearingDate'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.lawCase.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              clientType: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
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
      }),
      this.prisma.lawCase.count({ where }),
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
   * Get single case with all relations
   */
  async get(ownerUid: string, organizationId: string, id: string) {
    const lawCase = await this.prisma.lawCase.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        client: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit recent documents
          include: {
            uploadedBy: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        events: {
          where: {
            eventDate: {
              gte: new Date(), // Only future/today events
            },
          },
          orderBy: { eventDate: 'asc' },
          take: 5,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!lawCase) {
      throw new NotFoundException('Case not found');
    }

    return lawCase;
  }

  /**
   * Create a new case
   */
  async create(ownerUid: string, organizationId: string, userId: string, dto: CreateLawCaseDto) {
    // Verify client exists and belongs to this organization
    const client = await this.prisma.lawClient.findFirst({
      where: {
        id: dto.clientId,
        ownerUid,
        organizationId,
      },
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // Verify assignedTo user exists if provided
    if (dto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // Generate unique case number
    const caseNumber = await this.generateCaseNumber(ownerUid, organizationId);

    const lawCase = await this.prisma.lawCase.create({
      data: {
        caseNumber,
        title: dto.title,
        description: dto.description,
        clientId: dto.clientId,
        caseType: dto.caseType,
        status: dto.status || 'active',
        priority: dto.priority || 'medium',
        assignedToId: dto.assignedToId,
        filingDate: dto.filingDate ? new Date(dto.filingDate) : null,
        nextHearingDate: dto.nextHearingDate ? new Date(dto.nextHearingDate) : null,
        ownerUid,
        organizationId,
      },
      include: {
        client: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return lawCase;
  }

  /**
   * Update a case
   */
  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawCaseDto) {
    const existing = await this.prisma.lawCase.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Case not found');
    }

    // Verify client exists if changing
    if (dto.clientId && dto.clientId !== existing.clientId) {
      const client = await this.prisma.lawClient.findFirst({
        where: {
          id: dto.clientId,
          ownerUid,
          organizationId,
        },
      });
      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    // Verify assignedTo user exists if changing
    if (dto.assignedToId && dto.assignedToId !== existing.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.clientId !== undefined) data.clientId = dto.clientId;
    if (dto.caseType !== undefined) data.caseType = dto.caseType;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;
    if (dto.filingDate !== undefined) data.filingDate = dto.filingDate ? new Date(dto.filingDate) : null;
    if (dto.nextHearingDate !== undefined) data.nextHearingDate = dto.nextHearingDate ? new Date(dto.nextHearingDate) : null;
    if (dto.closingDate !== undefined) data.closingDate = dto.closingDate ? new Date(dto.closingDate) : null;

    const updated = await this.prisma.lawCase.update({
      where: { id },
      data,
      include: {
        client: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete a case
   */
  async delete(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawCase.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Case not found');
    }

    await this.prisma.lawCase.delete({ where: { id } });

    return { success: true, id };
  }

  /**
   * Get case timeline (activity history)
   */
  async getTimeline(ownerUid: string, organizationId: string, id: string) {
    const lawCase = await this.prisma.lawCase.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!lawCase) {
      throw new NotFoundException('Case not found');
    }

    // Get all related activities
    const [documents, tasks, events, invoices] = await Promise.all([
      this.prisma.lawDocument.findMany({
        where: { caseId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.lawTask.findMany({
        where: { caseId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          assignedTo: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.lawEvent.findMany({
        where: { caseId: id },
        orderBy: { eventDate: 'desc' },
        take: 20,
      }),
      this.prisma.lawInvoice.findMany({
        where: { caseId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Merge and sort all activities by date
    const timeline: any[] = [];

    documents.forEach(doc => {
      timeline.push({
        type: 'document',
        date: doc.createdAt,
        id: doc.id,
        title: `Document uploaded: ${doc.fileName}`,
        data: doc,
      });
    });

    tasks.forEach(task => {
      timeline.push({
        type: 'task',
        date: task.createdAt,
        id: task.id,
        title: `Task created: ${task.title}`,
        data: task,
      });
      if (task.completedDate) {
        timeline.push({
          type: 'task_completed',
          date: task.completedDate,
          id: task.id,
          title: `Task completed: ${task.title}`,
          data: task,
        });
      }
    });

    events.forEach(event => {
      timeline.push({
        type: 'event',
        date: event.eventDate,
        id: event.id,
        title: `${event.eventType}: ${event.title}`,
        data: event,
      });
    });

    invoices.forEach(invoice => {
      timeline.push({
        type: 'invoice',
        date: invoice.createdAt,
        id: invoice.id,
        title: `Invoice ${invoice.invoiceNumber}: ${invoice.status}`,
        data: invoice,
      });
      if (invoice.paidDate) {
        timeline.push({
          type: 'invoice_paid',
          date: invoice.paidDate,
          id: invoice.id,
          title: `Invoice ${invoice.invoiceNumber} paid`,
          data: invoice,
        });
      }
    });

    // Sort by date descending
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      caseId: id,
      caseNumber: lawCase.caseNumber,
      timeline,
    };
  }
}
