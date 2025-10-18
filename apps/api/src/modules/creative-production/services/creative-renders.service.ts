// apps/api/src/modules/creative-production/services/creative-renders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UsageTrackingService } from '@/modules/usage-tracking/usage-tracking.service';
import {
  CreativeRender,
  CreativeRenderStatus,
  Prisma,
} from '@prisma/client';
import { CreateRenderDto } from '../dto/create-render.dto';

@Injectable()
export class CreativeRendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  /**
   * Request a new render
   */
  async create(
    orgId: string,
    ownerUid: string,
    userId: string,
    dto: CreateRenderDto,
  ): Promise<CreativeRender> {
    // Verify project exists and user has access
    const project = await this.prisma.creativeProject.findFirst({
      where: {
        id: dto.projectId,
        orgId,
        ownerUid,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Create render record
    const render = await this.prisma.creativeRender.create({
      data: {
        projectId: dto.projectId,
        format: dto.format,
        spec: dto.spec as Prisma.JsonValue,
        status: CreativeRenderStatus.QUEUED,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Add to render queue
    await this.prisma.renderQueue.create({
      data: {
        projectId: dto.projectId,
        renderId: render.id,
        organizationId: orgId,
        ownerUid,
        status: CreativeRenderStatus.QUEUED,
        priority: dto.priority || 0,
        format: dto.format,
      },
    });

    // Track usage
    await this.usageTracking.trackRenderRequested(
      ownerUid,
      orgId,
      render.id,
      dto.format,
      userId,
    );

    return render;
  }

  /**
   * Get all renders for organization
   */
  async findAll(
    orgId: string,
    ownerUid: string,
    filters?: {
      projectId?: string;
      status?: CreativeRenderStatus;
    },
  ): Promise<CreativeRender[]> {
    const where: Prisma.CreativeRenderWhereInput = {
      project: {
        orgId,
        ownerUid,
      },
    };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.creativeRender.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single render by ID
   */
  async findOne(
    renderId: string,
    orgId: string,
    ownerUid: string,
  ): Promise<CreativeRender> {
    const render = await this.prisma.creativeRender.findFirst({
      where: {
        id: renderId,
        project: {
          orgId,
          ownerUid,
        },
      },
      include: {
        project: true,
      },
    });

    if (!render) {
      throw new NotFoundException('Render not found');
    }

    return render;
  }

  /**
   * Get render queue status
   */
  async getQueueStatus(orgId: string, ownerUid: string): Promise<any> {
    const queueItems = await this.prisma.renderQueue.findMany({
      where: {
        organizationId: orgId,
        ownerUid,
      },
      include: {
        _count: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const statusCounts = await this.prisma.renderQueue.groupBy({
      by: ['status'],
      where: {
        organizationId: orgId,
        ownerUid,
      },
      _count: true,
    });

    return {
      queue: queueItems,
      summary: {
        total: queueItems.length,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  /**
   * Update render status (used by render worker)
   */
  async updateStatus(
    renderId: string,
    status: CreativeRenderStatus,
    outputUrl?: string,
    logs?: string,
    computeSeconds?: number,
  ): Promise<CreativeRender> {
    const render = await this.prisma.creativeRender.update({
      where: { id: renderId },
      data: {
        status,
        outputUrl,
        logs,
      },
    });

    // Update queue item
    const queueItem = await this.prisma.renderQueue.findFirst({
      where: { renderId },
    });

    if (queueItem) {
      const updateData: any = { status };

      if (status === CreativeRenderStatus.RENDERING && !queueItem.startedAt) {
        updateData.startedAt = new Date();
      }

      if (status === CreativeRenderStatus.READY || status === CreativeRenderStatus.FAILED) {
        updateData.completedAt = new Date();
        if (computeSeconds) {
          updateData.computeSeconds = computeSeconds;
        }
      }

      if (status === CreativeRenderStatus.FAILED) {
        updateData.errorMessage = logs;
        updateData.retryCount = { increment: 1 };
      }

      await this.prisma.renderQueue.update({
        where: { id: queueItem.id },
        data: updateData,
      });

      // Track usage
      if (status === CreativeRenderStatus.READY && computeSeconds) {
        await this.usageTracking.trackRenderCompleted(
          queueItem.ownerUid,
          queueItem.organizationId,
          renderId,
          computeSeconds,
        );
      } else if (status === CreativeRenderStatus.FAILED) {
        await this.usageTracking.trackRenderFailed(
          queueItem.ownerUid,
          queueItem.organizationId,
          renderId,
          logs || 'Unknown error',
        );
      }
    }

    return render;
  }

  /**
   * Get next render job from queue (for worker)
   */
  async getNextJob(workerId: string): Promise<any> {
    // Get highest priority queued job
    const job = await this.prisma.renderQueue.findFirst({
      where: {
        status: CreativeRenderStatus.QUEUED,
        retryCount: {
          lt: 3, // Max retries
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    if (!job) {
      return null;
    }

    // Assign to worker and mark as rendering
    await this.prisma.renderQueue.update({
      where: { id: job.id },
      data: {
        status: CreativeRenderStatus.RENDERING,
        workerId,
        startedAt: new Date(),
      },
    });

    // Update render status
    await this.prisma.creativeRender.update({
      where: { id: job.renderId },
      data: {
        status: CreativeRenderStatus.RENDERING,
      },
    });

    // Get full render details
    const render = await this.prisma.creativeRender.findUnique({
      where: { id: job.renderId },
      include: {
        project: {
          include: {
            assets: true,
          },
        },
      },
    });

    return {
      ...job,
      render,
    };
  }

  /**
   * Cancel render
   */
  async cancel(
    renderId: string,
    orgId: string,
    ownerUid: string,
  ): Promise<void> {
    // Verify ownership
    await this.findOne(renderId, orgId, ownerUid);

    // Update render status
    await this.prisma.creativeRender.update({
      where: { id: renderId },
      data: {
        status: CreativeRenderStatus.FAILED,
        logs: 'Cancelled by user',
      },
    });

    // Remove from queue
    await this.prisma.renderQueue.deleteMany({
      where: { renderId },
    });
  }

  /**
   * Get render statistics
   */
  async getStatistics(orgId: string, ownerUid: string): Promise<any> {
    const [totalRenders, byStatus, computeTime] = await Promise.all([
      this.prisma.creativeRender.count({
        where: {
          project: {
            orgId,
            ownerUid,
          },
        },
      }),
      this.prisma.creativeRender.groupBy({
        by: ['status'],
        where: {
          project: {
            orgId,
            ownerUid,
          },
        },
        _count: true,
      }),
      this.prisma.renderQueue.aggregate({
        where: {
          organizationId: orgId,
          ownerUid,
          status: CreativeRenderStatus.READY,
        },
        _sum: {
          computeSeconds: true,
        },
        _avg: {
          computeSeconds: true,
        },
      }),
    ]);

    return {
      totalRenders,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      computeTime: {
        total: computeTime._sum.computeSeconds || 0,
        average: computeTime._avg.computeSeconds || 0,
      },
    };
  }
}
