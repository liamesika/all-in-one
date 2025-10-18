import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { UsageTrackingService } from '@/modules/usage-tracking/usage-tracking.service';
import { CreateCreativeClientDto } from '../dto/create-creative-client.dto';
import { UpdateCreativeClientDto } from '../dto/update-creative-client.dto';

@Injectable()
export class CreativeClientsService {
  private readonly logger = new Logger(CreativeClientsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  /**
   * Create a new creative client (customer)
   * Scoped to organizationId + ownerUid
   */
  async create(
    orgId: string,
    ownerUid: string,
    userId: string,
    dto: CreateCreativeClientDto,
  ) {
    this.logger.log(`Creating creative client: ${dto.name} for org ${orgId}`);

    const client = await this.prisma.creativeClient.create({
      data: {
        orgId,
        ownerUid,
        name: dto.name,
        company: dto.company,
        emails: dto.emails,
        phones: dto.phones,
        tags: dto.tags || [],
        notes: dto.notes,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Track usage event
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_PROJECT_CREATED', // Reuse existing enum (or add CLIENT_CREATED)
      category: 'PROJECTS',
      vertical: 'PRODUCTIONS',
      resourceType: 'creative_client',
      resourceId: client.id,
      quantity: 1,
      metadata: { name: client.name, company: client.company },
    });

    return client;
  }

  /**
   * Find all clients for an organization with optional filters
   */
  async findAll(
    orgId: string,
    ownerUid: string,
    filters?: {
      search?: string;
      tags?: string[];
    },
  ) {
    const where: any = {
      orgId,
      ownerUid,
    };

    // Search filter (name or company)
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const clients = await this.prisma.creativeClient.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clients;
  }

  /**
   * Find a single client by ID (with ownership verification)
   */
  async findOne(clientId: string, orgId: string, ownerUid: string) {
    const client = await this.prisma.creativeClient.findFirst({
      where: {
        id: clientId,
        orgId,
        ownerUid,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Creative client with ID ${clientId} not found`);
    }

    return client;
  }

  /**
   * Update a client
   */
  async update(
    clientId: string,
    orgId: string,
    ownerUid: string,
    userId: string,
    dto: UpdateCreativeClientDto,
  ) {
    // Verify ownership
    await this.findOne(clientId, orgId, ownerUid);

    const client = await this.prisma.creativeClient.update({
      where: { id: clientId },
      data: {
        name: dto.name,
        company: dto.company,
        emails: dto.emails,
        phones: dto.phones,
        tags: dto.tags,
        notes: dto.notes,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Track usage event
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_PROJECT_UPDATED', // Reuse existing enum
      category: 'PROJECTS',
      vertical: 'PRODUCTIONS',
      resourceType: 'creative_client',
      resourceId: client.id,
      quantity: 1,
      metadata: { name: client.name },
    });

    return client;
  }

  /**
   * Delete a client (soft delete by unlinking from projects)
   */
  async delete(clientId: string, orgId: string, ownerUid: string, userId: string) {
    // Verify ownership
    await this.findOne(clientId, orgId, ownerUid);

    // Unlink from all projects first
    await this.prisma.creativeProject.updateMany({
      where: { clientId },
      data: { clientId: null },
    });

    // Delete the client
    await this.prisma.creativeClient.delete({
      where: { id: clientId },
    });

    // Track usage event
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_PROJECT_DELETED', // Reuse existing enum
      category: 'PROJECTS',
      vertical: 'PRODUCTIONS',
      resourceType: 'creative_client',
      resourceId: clientId,
      quantity: 1,
    });

    return { success: true, message: 'Client deleted successfully' };
  }

  /**
   * Get client statistics
   */
  async getStatistics(orgId: string, ownerUid: string) {
    const totalClients = await this.prisma.creativeClient.count({
      where: { orgId, ownerUid },
    });

    const clientsWithProjects = await this.prisma.creativeClient.count({
      where: {
        orgId,
        ownerUid,
        projects: {
          some: {},
        },
      },
    });

    const recentActivity = await this.prisma.creativeClient.findMany({
      where: { orgId, ownerUid },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        company: true,
        updatedAt: true,
      },
    });

    return {
      totalClients,
      clientsWithProjects,
      clientsWithoutProjects: totalClients - clientsWithProjects,
      recentActivity,
    };
  }
}
