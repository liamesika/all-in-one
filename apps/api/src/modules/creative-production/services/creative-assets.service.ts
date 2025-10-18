// apps/api/src/modules/creative-production/services/creative-assets.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UsageTrackingService } from '@/modules/usage-tracking/usage-tracking.service';
import {
  CreativeAsset,
  CreativeAssetType,
  Prisma,
} from '@prisma/client';
import {
  CreateCreativeAssetDto,
  UpdateCreativeAssetDto,
} from '../dto/create-creative-asset.dto';

@Injectable()
export class CreativeAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  /**
   * Create a new creative asset
   */
  async create(
    orgId: string,
    ownerUid: string,
    createdByUid: string,
    dto: CreateCreativeAssetDto,
  ): Promise<CreativeAsset> {
    // Validate projectId if provided
    if (dto.projectId) {
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
    }

    const asset = await this.prisma.creativeAsset.create({
      data: {
        orgId,
        projectId: dto.projectId,
        title: dto.title,
        type: dto.type,
        storageUrl: dto.storageUrl,
        size: dto.size,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
        tags: dto.tags || [],
        version: dto.version || 1,
        createdByUid,
      },
    });

    // Track usage
    await this.usageTracking.trackCreativeAssetUploaded(
      ownerUid,
      orgId,
      asset.id,
      asset.type,
      asset.size || 0,
      createdByUid,
    );

    return asset;
  }

  /**
   * Get all assets for organization
   */
  async findAll(
    orgId: string,
    ownerUid: string,
    filters?: {
      projectId?: string;
      type?: CreativeAssetType;
      search?: string;
    },
  ): Promise<CreativeAsset[]> {
    const where: Prisma.CreativeAssetWhereInput = {
      orgId,
    };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }

    return this.prisma.creativeAsset.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single asset by ID
   */
  async findOne(
    assetId: string,
    orgId: string,
  ): Promise<CreativeAsset> {
    const asset = await this.prisma.creativeAsset.findFirst({
      where: {
        id: assetId,
        orgId,
      },
      include: {
        project: true,
        reviews: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  /**
   * Update asset
   */
  async update(
    assetId: string,
    orgId: string,
    ownerUid: string,
    dto: UpdateCreativeAssetDto,
  ): Promise<CreativeAsset> {
    // Verify ownership
    await this.findOne(assetId, orgId);

    // Validate projectId if provided
    if (dto.projectId) {
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
    }

    return this.prisma.creativeAsset.update({
      where: { id: assetId },
      data: {
        title: dto.title,
        projectId: dto.projectId,
        tags: dto.tags,
      },
      include: {
        project: true,
        reviews: true,
      },
    });
  }

  /**
   * Delete asset
   */
  async delete(
    assetId: string,
    orgId: string,
    ownerUid: string,
    userId: string,
  ): Promise<void> {
    const asset = await this.findOne(assetId, orgId);

    await this.prisma.creativeAsset.delete({
      where: { id: assetId },
    });

    // Track usage
    await this.usageTracking.trackEvent({
      ownerUid,
      organizationId: orgId,
      userId,
      eventType: 'CREATIVE_ASSET_DELETED',
      category: 'STORAGE',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeAsset',
      resourceId: assetId,
      storageBytes: asset.size ? BigInt(-asset.size) : undefined, // Negative to decrement
    });

    // Update storage quota (decrement)
    if (asset.size) {
      await this.updateStorageQuotaOnDelete(orgId, asset.type, asset.size);
    }
  }

  /**
   * Get asset statistics
   */
  async getStatistics(orgId: string): Promise<any> {
    const [totalAssets, byType, totalSize] = await Promise.all([
      this.prisma.creativeAsset.count({
        where: { orgId },
      }),
      this.prisma.creativeAsset.groupBy({
        by: ['type'],
        where: { orgId },
        _count: true,
        _sum: {
          size: true,
        },
      }),
      this.prisma.creativeAsset.aggregate({
        where: { orgId },
        _sum: {
          size: true,
        },
      }),
    ]);

    return {
      totalAssets,
      totalSize: totalSize._sum.size || 0,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = {
          count: item._count,
          size: item._sum.size || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; size: number }>),
    };
  }

  /**
   * Update storage quota on asset deletion
   */
  private async updateStorageQuotaOnDelete(
    organizationId: string,
    assetType: string,
    sizeBytes: number,
  ): Promise<void> {
    try {
      const quota = await this.prisma.storageQuota.findUnique({
        where: { organizationId },
      });

      if (!quota) return;

      await this.prisma.storageQuota.update({
        where: { organizationId },
        data: {
          usedBytes: { decrement: BigInt(sizeBytes) },
          assetCount: { decrement: 1 },
          videoBytes:
            assetType === 'VIDEO'
              ? { decrement: BigInt(sizeBytes) }
              : undefined,
          imageBytes:
            assetType === 'IMAGE'
              ? { decrement: BigInt(sizeBytes) }
              : undefined,
          audioBytes:
            assetType === 'AUDIO'
              ? { decrement: BigInt(sizeBytes) }
              : undefined,
          documentBytes:
            assetType === 'PDF' ? { decrement: BigInt(sizeBytes) } : undefined,
          otherBytes:
            !['VIDEO', 'IMAGE', 'AUDIO', 'PDF'].includes(assetType)
              ? { decrement: BigInt(sizeBytes) }
              : undefined,
          lastCalculated: new Date(),
        },
      });
    } catch (error) {
      // Non-blocking
      console.error('Failed to update storage quota on delete:', error);
    }
  }

  /**
   * Generate presigned upload URL (for S3/Firebase Storage)
   * TODO: Implement actual S3/Firebase Storage integration
   */
  async generateUploadUrl(
    orgId: string,
    ownerUid: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    // Placeholder implementation
    // In production, generate actual S3 presigned URL or Firebase Storage URL
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${orgId}/${ownerUid}/${timestamp}_${sanitizedFileName}`;

    return {
      uploadUrl: `https://storage.example.com/upload/${fileKey}`,
      fileUrl: `https://storage.example.com/${fileKey}`,
    };
  }
}
