import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  CreateProductionTaskDto,
  UpdateProductionTaskDto,
  AssignTaskDto,
  ProductionTaskResponseDto,
  ProductionTaskListQueryDto,
} from './dto/production-task.dto';

@Injectable()
export class ProductionTaskService {
  constructor(private prisma: PrismaService) {}

  async create(
    ownerUid: string,
    organizationId: string,
    dto: CreateProductionTaskDto
  ): Promise<ProductionTaskResponseDto> {
    // Verify project exists and belongs to organization
    const project = await this.prisma.productionProject.findFirst({
      where: { id: dto.projectId, ownerUid, organizationId },
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    // Verify assignee exists and belongs to organization (if provided)
    if (dto.assigneeId) {
      const assignee = await this.prisma.membership.findFirst({
        where: {
          userId: dto.assigneeId,
          orgId: organizationId,
          status: 'ACTIVE'
        },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee is not a member of this organization');
      }
    }

    // Verify predecessor exists and belongs to same project (if provided)
    if (dto.predecessorId) {
      const predecessor = await this.prisma.productionTask.findFirst({
        where: {
          id: dto.predecessorId,
          projectId: dto.projectId,
          ownerUid,
          organizationId,
        },
      });

      if (!predecessor) {
        throw new BadRequestException('Predecessor task not found in this project');
      }
    }

    const task = await this.prisma.productionTask.create({
      data: {
        ...dto,
        ownerUid,
        organizationId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    return this.mapToResponseDto(task);
  }

  async findAll(
    ownerUid: string,
    organizationId: string,
    query: ProductionTaskListQueryDto
  ): Promise<{ tasks: ProductionTaskResponseDto[]; total: number; page: number; limit: number }> {
    const {
      search,
      status,
      domain,
      projectId,
      assigneeId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where = {
      ownerUid,
      organizationId,
      ...(status && { status }),
      ...(domain && { domain }),
      ...(projectId && { projectId }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [tasks, total] = await Promise.all([
      this.prisma.productionTask.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignee: {
            select: { id: true, fullName: true, email: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          }
        }
      }),
      this.prisma.productionTask.count({ where })
    ]);

    return {
      tasks: tasks.map(task => this.mapToResponseDto(task)),
      total,
      page,
      limit: take
    };
  }

  async findOne(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<ProductionTaskResponseDto> {
    const task = await this.prisma.productionTask.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    if (!task) {
      throw new NotFoundException('Production task not found');
    }

    return this.mapToResponseDto(task);
  }

  async update(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionTaskDto,
    userId?: string // Current user ID for permission checking
  ): Promise<ProductionTaskResponseDto> {
    // Get existing task
    const existingTask = await this.prisma.productionTask.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!existingTask) {
      throw new NotFoundException('Production task not found');
    }

    // Check if user can update this task
    // Members can only update tasks assigned to them (status and description)
    if (userId && existingTask.assigneeId === userId) {
      // Allow limited updates for assigned user
      const allowedUpdates: (keyof UpdateProductionTaskDto)[] = ['status', 'description'];
      const hasRestrictedUpdates = Object.keys(dto).some(key =>
        !allowedUpdates.includes(key as keyof UpdateProductionTaskDto)
      );

      if (hasRestrictedUpdates) {
        throw new ForbiddenException('You can only update status and description of tasks assigned to you');
      }
    }

    // Verify assignee exists and belongs to organization (if provided)
    if (dto.assigneeId) {
      const assignee = await this.prisma.membership.findFirst({
        where: {
          userId: dto.assigneeId,
          orgId: organizationId,
          status: 'ACTIVE'
        },
      });

      if (!assignee) {
        throw new BadRequestException('Assignee is not a member of this organization');
      }
    }

    // Verify predecessor exists and belongs to same project (if provided)
    if (dto.predecessorId) {
      const predecessor = await this.prisma.productionTask.findFirst({
        where: {
          id: dto.predecessorId,
          projectId: existingTask.projectId,
          ownerUid,
          organizationId,
        },
      });

      if (!predecessor) {
        throw new BadRequestException('Predecessor task not found in this project');
      }
    }

    const task = await this.prisma.productionTask.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    return this.mapToResponseDto(task);
  }

  async assignTask(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: AssignTaskDto
  ): Promise<ProductionTaskResponseDto> {
    // Verify task exists
    const task = await this.prisma.productionTask.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Production task not found');
    }

    // Verify assignee exists and belongs to organization
    const assignee = await this.prisma.membership.findFirst({
      where: {
        userId: dto.assigneeId,
        orgId: organizationId,
        status: 'ACTIVE'
      },
    });

    if (!assignee) {
      throw new BadRequestException('Assignee is not a member of this organization');
    }

    const updatedTask = await this.prisma.productionTask.update({
      where: { id },
      data: { assigneeId: dto.assigneeId },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    return this.mapToResponseDto(updatedTask);
  }

  async remove(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    const task = await this.prisma.productionTask.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!task) {
      throw new NotFoundException('Production task not found');
    }

    await this.prisma.productionTask.delete({
      where: { id },
    });

    return { message: 'Production task deleted successfully' };
  }

  async getTasksByProject(
    ownerUid: string,
    organizationId: string,
    projectId: string
  ): Promise<ProductionTaskResponseDto[]> {
    const tasks = await this.prisma.productionTask.findMany({
      where: { projectId, ownerUid, organizationId },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      },
      orderBy: [
        { status: 'asc' }, // Open tasks first
        { dueDate: 'asc' }, // Then by due date
        { createdAt: 'desc' }
      ]
    });

    return tasks.map(task => this.mapToResponseDto(task));
  }

  async getMyTasks(
    ownerUid: string,
    organizationId: string,
    userId: string,
    includeCompleted = false
  ): Promise<ProductionTaskResponseDto[]> {
    const where = {
      ownerUid,
      organizationId,
      assigneeId: userId,
      ...(includeCompleted ? {} : { status: { not: 'DONE' } })
    };

    const tasks = await this.prisma.productionTask.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      },
      orderBy: [
        { dueDate: { sort: 'asc', nulls: 'last' } },
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return tasks.map(task => this.mapToResponseDto(task));
  }

  async getOverdueTasks(
    ownerUid: string,
    organizationId: string
  ): Promise<ProductionTaskResponseDto[]> {
    const now = new Date();

    const tasks = await this.prisma.productionTask.findMany({
      where: {
        ownerUid,
        organizationId,
        status: { not: 'DONE' },
        dueDate: { lt: now }
      },
      include: {
        assignee: {
          select: { id: true, fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return tasks.map(task => this.mapToResponseDto(task));
  }

  private mapToResponseDto(task: any): ProductionTaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      domain: task.domain,
      status: task.status,
      dueDate: task.dueDate?.toISOString(),
      predecessorId: task.predecessorId,
      assigneeId: task.assigneeId,
      projectId: task.projectId,
      ownerUid: task.ownerUid,
      organizationId: task.organizationId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      ...(task.assignee && { assignee: task.assignee }),
      ...(task.project && { project: task.project }),
    };
  }
}