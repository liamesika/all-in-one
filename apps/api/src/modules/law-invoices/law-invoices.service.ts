
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLawInvoiceDto } from './dtos/create-law-invoice.dto';
import { UpdateLawInvoiceDto } from './dtos/update-law-invoice.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  status?: string;
  clientId?: string;
  caseId?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawInvoicesService {
  constructor() {}
    private prisma = new PrismaClient();
  private async generateInvoiceNumber(ownerUid: string, organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await this.prisma.lawInvoice.findFirst({
      where: {
        ownerUid,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0');
    const nextNumber = lastNumber + 1;

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    const where: any = { ownerUid, organizationId };

    if (query.status) where.status = query.status;
    if (query.caseId) where.caseId = query.caseId;

    if (query.q) {
      where.OR = [
        { invoiceNumber: { contains: query.q, mode: 'insensitive' } },
        { clientName: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any[] = [{ createdAt: 'desc' }];
    const validSortFields = ['createdAt', 'updatedAt', 'invoiceNumber', 'status', 'totalAmount', 'dueDate'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    const [data, total] = await Promise.all([
      this.prisma.lawInvoice.findMany({
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
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.lawInvoice.count({ where }),
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
    const invoice = await this.prisma.lawInvoice.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(ownerUid: string, organizationId: string, dto: CreateLawInvoiceDto) {
    if (dto.caseId) {
      const caseExists = await this.prisma.lawCase.findFirst({
        where: { id: dto.caseId, ownerUid, organizationId },
      });
      if (!caseExists) {
        throw new BadRequestException('Case not found');
      }
    }

    const invoiceNumber = await this.generateInvoiceNumber(ownerUid, organizationId);

    const invoice = await this.prisma.lawInvoice.create({
      data: {
        invoiceNumber,
        clientName: dto.clientName,
        caseId: dto.caseId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        taxRate: dto.taxRate,
        totalAmount: dto.totalAmount,
        billableHours: dto.billableHours,
        hourlyRate: dto.hourlyRate,
        description: dto.description,
        status: dto.status || 'draft',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
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

    return invoice;
  }

  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawInvoiceDto) {
    const existing = await this.prisma.lawInvoice.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    const data: any = {};
    if (dto.clientName !== undefined) data.clientName = dto.clientName;
    if (dto.caseId !== undefined) data.caseId = dto.caseId;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.taxRate !== undefined) data.taxRate = dto.taxRate;
    if (dto.totalAmount !== undefined) data.totalAmount = dto.totalAmount;
    if (dto.billableHours !== undefined) data.billableHours = dto.billableHours;
    if (dto.hourlyRate !== undefined) data.hourlyRate = dto.hourlyRate;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    return this.prisma.lawInvoice.update({
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
    const existing = await this.prisma.lawInvoice.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.lawInvoice.delete({ where: { id } });

    return { success: true, id };
  }

  async markAsSent(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawInvoice.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.lawInvoice.update({
      where: { id },
      data: { status: 'sent' },
    });
  }

  async markAsPaid(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawInvoice.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.lawInvoice.update({
      where: { id },
      data: {
        status: 'paid',
        paidDate: new Date(),
      },
    });
  }
}
