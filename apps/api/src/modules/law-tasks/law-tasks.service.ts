
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLawTaskDto } from './dtos/create-law-task.dto';
import { UpdateLawTaskDto } from './dtos/update-law-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type ListQuery = {
  q?: string;
  status?: string;
  priority?: string;
  caseId?: string;
  assignedToId?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class LawTasksService {
  constructor() {}
    private prisma = new PrismaClient();
  async list(ownerUid: string, organizationId: string, query: ListQuery = {}) {
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const page = Math.max(1, Number(query.page || 1));
    const offset = query.offset !== undefined ? Number(query.offset) : (page - 1) * limit;
    const skip = Math.max(0, offset);

    const where: any = { ownerUid, organizationId };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.caseId) where.caseId = query.caseId;
    if (query.assignedToId) where.assignedToId = query.assignedToId;

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any[] = [{ boardOrder: 'asc' }, { createdAt: 'desc' }];
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'status', 'dueDate', 'boardOrder'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = [{ [query.sortBy]: sortOrder }];
    }

    const [data, total] = await Promise.all([
      this.prisma.lawTask.findMany({
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
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.lawTask.count({ where }),
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
    const task = await this.prisma.lawTask.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        case: true,
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(ownerUid: string, organizationId: string, dto: CreateLawTaskDto) {
    if (dto.caseId) {
      const caseExists = await this.prisma.lawCase.findFirst({
        where: { id: dto.caseId, ownerUid, organizationId },
      });
      if (!caseExists) {
        throw new BadRequestException('Case not found');
      }
    }

    if (dto.assignedToId) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const task = await this.prisma.lawTask.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'medium',
        status: dto.status || 'todo',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        caseId: dto.caseId,
        assignedToId: dto.assignedToId,
        boardColumn: dto.boardColumn || 'todo',
        boardOrder: dto.boardOrder || 0,
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
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return task;
  }

  async update(ownerUid: string, organizationId: string, id: string, dto: UpdateLawTaskDto) {
    const existing = await this.prisma.lawTask.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'completed' && !existing.completedDate) {
        data.completedDate = new Date();
      }
    }
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.caseId !== undefined) data.caseId = dto.caseId;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;
    if (dto.boardColumn !== undefined) data.boardColumn = dto.boardColumn;
    if (dto.boardOrder !== undefined) data.boardOrder = dto.boardOrder;
    if (dto.completedDate !== undefined) data.completedDate = dto.completedDate ? new Date(dto.completedDate) : null;

    return this.prisma.lawTask.update({
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
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async move(ownerUid: string, organizationId: string, id: string, dto: MoveTaskDto) {
    const existing = await this.prisma.lawTask.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    // Update the task's board position
    const updated = await this.prisma.lawTask.update({
      where: { id },
      data: {
        boardColumn: dto.boardColumn,
        boardOrder: dto.boardOrder,
        status: dto.boardColumn === 'done' ? 'completed' : existing.status,
        completedDate: dto.boardColumn === 'done' && !existing.completedDate ? new Date() : existing.completedDate,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
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

  async delete(ownerUid: string, organizationId: string, id: string) {
    const existing = await this.prisma.lawTask.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.lawTask.delete({ where: { id } });

    return { success: true, id };
  }
}
