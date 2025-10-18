// apps/api/src/modules/creative-production/services/creative-projects.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UsageTrackingService } from '@/modules/usage-tracking/usage-tracking.service';
import {
  CreativeProject,
  CreativeProjectStatus,
  Prisma,
} from '@prisma/client';
import {
  CreateCreativeProjectDto,
  UpdateCreativeProjectDto,
} from '../dto/create-creative-project.dto';

@Injectable()
export class CreativeProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  /**
   * Create a new creative project
   */
  async create(
    orgId: string,
    ownerUid: string,
    userId: string,
    dto: CreateCreativeProjectDto,
  ): Promise<CreativeProject> {
    const project = await this.prisma.creativeProject.create({
      data: {
        orgId,
        ownerUid,
        name: dto.name,
        objective: dto.objective,
        targetAudience: dto.targetAudience,
        channels: dto.channels || [],
        status: dto.status || CreativeProjectStatus.DRAFT,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        tasks: true,
        assets: true,
        renders: true,
        reviews: true,
      },
    });

    // Track usage
    await this.usageTracking.trackCreativeProjectCreated(
      ownerUid,
      orgId,
      project.id,
      userId,
    );

    return project;
  }

  /**
   * Get all projects for organization
   */
  async findAll(
    orgId: string,
    ownerUid: string,
    filters?: {
      status?: CreativeProjectStatus;
      search?: string;
    },
  ): Promise<CreativeProject[]> {
    const where: Prisma.CreativeProjectWhereInput = {
      orgId,
      ownerUid,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { objective: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.creativeProject.findMany({
      where,
      include: {
        tasks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        assets: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        renders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            assets: true,
            renders: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single project by ID
   */
  async findOne(
    projectId: string,
    orgId: string,
    ownerUid: string,
  ): Promise<CreativeProject> {
    const project = await this.prisma.creativeProject.findFirst({
      where: {
        id: projectId,
        orgId,
        ownerUid,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        assets: {
          orderBy: { createdAt: 'desc' },
        },
        renders: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          orderBy: { requestedAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            assets: true,
            renders: true,
            reviews: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Update project
   */
  async update(
    projectId: string,
    orgId: string,
    ownerUid: string,
    userId: string,
    dto: UpdateCreativeProjectDto,
  ): Promise<CreativeProject> {
    // Verify ownership
    const existing = await this.findOne(projectId, orgId, ownerUid);

    const updated = await this.prisma.creativeProject.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        objective: dto.objective,
        targetAudience: dto.targetAudience,
        channels: dto.channels,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        tasks: true,
        assets: true,
        renders: true,
        reviews: true,
      },
    });

    // Track usage
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_PROJECT_UPDATED',
      category: 'PROJECTS',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeProject',
      resourceId: projectId,
    });

    return updated;
  }

  /**
   * Delete project
   */
  async delete(
    projectId: string,
    orgId: string,
    ownerUid: string,
    userId: string,
  ): Promise<void> {
    // Verify ownership
    await this.findOne(projectId, orgId, ownerUid);

    await this.prisma.creativeProject.delete({
      where: { id: projectId },
    });

    // Track usage
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_PROJECT_DELETED',
      category: 'PROJECTS',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeProject',
      resourceId: projectId,
    });
  }

  /**
   * Get project statistics
   */
  async getStatistics(orgId: string, ownerUid: string): Promise<any> {
    const [totalProjects, byStatus, recentProjects] = await Promise.all([
      this.prisma.creativeProject.count({
        where: { orgId, ownerUid },
      }),
      this.prisma.creativeProject.groupBy({
        by: ['status'],
        where: { orgId, ownerUid },
        _count: true,
      }),
      this.prisma.creativeProject.findMany({
        where: { orgId, ownerUid },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      totalProjects,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentProjects,
    };
  }
}
