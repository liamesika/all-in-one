import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  CreateProductionProjectDto,
  UpdateProductionProjectDto,
  ProductionProjectResponseDto,
  ProductionProjectListQueryDto
} from './dto/production-project.dto';

@Injectable()
export class ProductionProjectService {
  constructor(private prisma: PrismaService) {}

  async create(
    ownerUid: string,
    organizationId: string,
    dto: CreateProductionProjectDto
  ): Promise<ProductionProjectResponseDto> {
    // Validate dates
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (start >= end) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const project = await this.prisma.productionProject.create({
      data: {
        ...dto,
        ownerUid,
        organizationId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    return this.mapToResponseDto(project);
  }

  async findAll(
    ownerUid: string,
    organizationId: string,
    query: ProductionProjectListQueryDto
  ): Promise<{ projects: ProductionProjectResponseDto[]; total: number; page: number; limit: number }> {
    const { search, status, type, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Cap at 100

    const where = {
      ownerUid,
      organizationId,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [projects, total] = await Promise.all([
      this.prisma.productionProject.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              tasks: true,
              budgetItems: true,
              files: true,
              suppliers: true,
            }
          },
          tasks: {
            where: { status: 'DONE' },
            select: { id: true }
          },
          budgetItems: {
            select: {
              planned: true,
              actual: true,
            }
          }
        }
      }),
      this.prisma.productionProject.count({ where })
    ]);

    const mappedProjects = projects.map(project => {
      const response = this.mapToResponseDto(project);

      // Add computed fields
      response.taskCount = project._count.tasks;
      response.completedTasks = project.tasks.length;
      response.fileCount = project._count.files;
      response.supplierCount = project._count.suppliers;

      // Calculate budget totals
      response.budgetTotal = project.budgetItems.reduce((sum, item) =>
        sum + Number(item.planned), 0
      );
      response.actualSpent = project.budgetItems.reduce((sum, item) =>
        sum + Number(item.actual), 0
      );

      return response;
    });

    return {
      projects: mappedProjects,
      total,
      page,
      limit: take
    };
  }

  async findOne(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<ProductionProjectResponseDto> {
    const project = await this.prisma.productionProject.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        _count: {
          select: {
            tasks: true,
            budgetItems: true,
            files: true,
            suppliers: true,
          }
        },
        tasks: {
          where: { status: 'DONE' },
          select: { id: true }
        },
        budgetItems: {
          select: {
            planned: true,
            actual: true,
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    const response = this.mapToResponseDto(project);

    // Add computed fields
    response.taskCount = project._count.tasks;
    response.completedTasks = project.tasks.length;
    response.fileCount = project._count.files;
    response.supplierCount = project._count.suppliers;

    // Calculate budget totals
    response.budgetTotal = project.budgetItems.reduce((sum, item) =>
      sum + Number(item.planned), 0
    );
    response.actualSpent = project.budgetItems.reduce((sum, item) =>
      sum + Number(item.actual), 0
    );

    return response;
  }

  async update(
    ownerUid: string,
    organizationId: string,
    id: string,
    dto: UpdateProductionProjectDto
  ): Promise<ProductionProjectResponseDto> {
    // Check if project exists and belongs to user
    const existingProject = await this.prisma.productionProject.findFirst({
      where: { id, ownerUid, organizationId },
    });

    if (!existingProject) {
      throw new NotFoundException('Production project not found');
    }

    // Validate dates if both are provided
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (start >= end) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate dates against existing dates
    const startDate = dto.startDate ? new Date(dto.startDate) : existingProject.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existingProject.endDate;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const project = await this.prisma.productionProject.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    return this.mapToResponseDto(project);
  }

  async remove(
    ownerUid: string,
    organizationId: string,
    id: string
  ): Promise<{ message: string }> {
    // Check if project exists and belongs to user
    const project = await this.prisma.productionProject.findFirst({
      where: { id, ownerUid, organizationId },
      include: {
        _count: {
          select: {
            tasks: true,
            budgetItems: true,
            files: true,
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    // Check if project has dependencies that would prevent deletion
    const hasData = project._count.tasks > 0 || project._count.budgetItems > 0 || project._count.files > 0;

    if (hasData) {
      // For safety, require explicit confirmation or soft delete
      // For now, we'll allow deletion but warn in response
    }

    await this.prisma.productionProject.delete({
      where: { id },
    });

    return {
      message: hasData
        ? 'Project deleted successfully. All related tasks, budget items, and files have been removed.'
        : 'Project deleted successfully.'
    };
  }

  private mapToResponseDto(project: any): ProductionProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      status: project.status,
      startDate: project.startDate?.toISOString(),
      endDate: project.endDate?.toISOString(),
      ownerUid: project.ownerUid,
      organizationId: project.organizationId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  // Additional helper methods for project management

  async getProjectStats(
    ownerUid: string,
    organizationId: string,
    projectId: string
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    budgetTotal: number;
    actualSpent: number;
    budgetVariance: number;
    teamSize: number;
    upcomingDeadlines: any[];
  }> {
    const project = await this.prisma.productionProject.findFirst({
      where: { id: projectId, ownerUid, organizationId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: { id: true, fullName: true }
            }
          }
        },
        budgetItems: true,
      }
    });

    if (!project) {
      throw new NotFoundException('Production project not found');
    }

    const now = new Date();
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = project.tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    ).length;

    const budgetTotal = project.budgetItems.reduce((sum, item) =>
      sum + Number(item.planned), 0
    );
    const actualSpent = project.budgetItems.reduce((sum, item) =>
      sum + Number(item.actual), 0
    );
    const budgetVariance = actualSpent - budgetTotal;

    const uniqueAssignees = new Set(
      project.tasks.filter(t => t.assigneeId).map(t => t.assigneeId)
    );
    const teamSize = uniqueAssignees.size;

    const upcomingDeadlines = project.tasks
      .filter(t => t.dueDate && new Date(t.dueDate) > now && t.status !== 'DONE')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5)
      .map(t => ({
        taskId: t.id,
        title: t.title,
        dueDate: t.dueDate,
        assignee: t.assignee?.fullName,
        daysUntilDue: Math.ceil((new Date(t.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }));

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      budgetTotal,
      actualSpent,
      budgetVariance,
      teamSize,
      upcomingDeadlines
    };
  }
}