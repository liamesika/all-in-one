// apps/api/src/modules/usage-tracking/usage-tracking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  UsageEventType,
  UsageCategory,
  Vertical,
  Prisma,
} from '@prisma/client';

export interface TrackUsageOptions {
  ownerUid: string;
  organizationId: string;
  userId?: string;
  eventType: UsageEventType;
  category: UsageCategory;
  vertical?: Vertical;
  resourceType?: string;
  resourceId?: string;
  quantity?: number;
  storageBytes?: bigint;
  computeSeconds?: number;
  metadata?: Record<string, any>;
  source?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a usage event (non-blocking, fire-and-forget)
   */
  async trackEvent(options: TrackUsageOptions): Promise<void> {
    try {
      await this.prisma.usageEvent.create({
        data: {
          ownerUid: options.ownerUid,
          organizationId: options.organizationId,
          userId: options.userId,
          eventType: options.eventType,
          category: options.category,
          vertical: options.vertical,
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          quantity: options.quantity ?? 1,
          storageBytes: options.storageBytes,
          computeSeconds: options.computeSeconds,
          metadata: options.metadata as Prisma.JsonValue,
          source: options.source ?? 'web',
          userAgent: options.userAgent,
          ipAddress: options.ipAddress,
        },
      });

      this.logger.debug(
        `Tracked event: ${options.eventType} for org ${options.organizationId}`,
      );
    } catch (error) {
      // Non-blocking: log error but don't throw
      this.logger.error(`Failed to track usage event: ${error.message}`, error.stack);
    }
  }

  /**
   * Track Creative Productions project creation
   */
  async trackCreativeProjectCreated(
    ownerUid: string,
    organizationId: string,
    projectId: string,
    userId?: string,
  ): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'CREATIVE_PROJECT_CREATED',
      category: 'PROJECTS',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeProject',
      resourceId: projectId,
      quantity: 1,
    });
  }

  /**
   * Track Creative Asset upload
   */
  async trackCreativeAssetUploaded(
    ownerUid: string,
    organizationId: string,
    assetId: string,
    assetType: string,
    sizeBytes: number,
    userId?: string,
  ): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'CREATIVE_ASSET_UPLOADED',
      category: 'STORAGE',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeAsset',
      resourceId: assetId,
      quantity: 1,
      storageBytes: BigInt(sizeBytes),
      metadata: { assetType },
    });

    // Update storage quota
    await this.updateStorageQuota(organizationId, assetType, sizeBytes);
  }

  /**
   * Track render job requested
   */
  async trackRenderRequested(
    ownerUid: string,
    organizationId: string,
    renderId: string,
    format: string,
    userId?: string,
  ): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'CREATIVE_RENDER_REQUESTED',
      category: 'COMPUTE',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeRender',
      resourceId: renderId,
      quantity: 1,
      metadata: { format },
    });
  }

  /**
   * Track render job completed
   */
  async trackRenderCompleted(
    ownerUid: string,
    organizationId: string,
    renderId: string,
    computeSeconds: number,
    userId?: string,
  ): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'CREATIVE_RENDER_COMPLETED',
      category: 'COMPUTE',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeRender',
      resourceId: renderId,
      quantity: 1,
      computeSeconds,
    });
  }

  /**
   * Track render job failed
   */
  async trackRenderFailed(
    ownerUid: string,
    organizationId: string,
    renderId: string,
    errorMessage: string,
    userId?: string,
  ): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'CREATIVE_RENDER_FAILED',
      category: 'COMPUTE',
      vertical: 'PRODUCTION',
      resourceType: 'CreativeRender',
      resourceId: renderId,
      quantity: 1,
      metadata: { errorMessage },
    });
  }

  /**
   * Update storage quota for organization
   */
  private async updateStorageQuota(
    organizationId: string,
    assetType: string,
    sizeBytes: number,
  ): Promise<void> {
    try {
      await this.prisma.storageQuota.upsert({
        where: { organizationId },
        create: {
          organizationId,
          usedBytes: BigInt(sizeBytes),
          assetCount: 1,
          videoBytes: assetType === 'VIDEO' ? BigInt(sizeBytes) : BigInt(0),
          imageBytes: assetType === 'IMAGE' ? BigInt(sizeBytes) : BigInt(0),
          audioBytes: assetType === 'AUDIO' ? BigInt(sizeBytes) : BigInt(0),
          documentBytes: assetType === 'PDF' ? BigInt(sizeBytes) : BigInt(0),
          otherBytes:
            !['VIDEO', 'IMAGE', 'AUDIO', 'PDF'].includes(assetType)
              ? BigInt(sizeBytes)
              : BigInt(0),
          lastCalculated: new Date(),
        },
        update: {
          usedBytes: { increment: BigInt(sizeBytes) },
          assetCount: { increment: 1 },
          videoBytes:
            assetType === 'VIDEO'
              ? { increment: BigInt(sizeBytes) }
              : undefined,
          imageBytes:
            assetType === 'IMAGE'
              ? { increment: BigInt(sizeBytes) }
              : undefined,
          audioBytes:
            assetType === 'AUDIO'
              ? { increment: BigInt(sizeBytes) }
              : undefined,
          documentBytes:
            assetType === 'PDF' ? { increment: BigInt(sizeBytes) } : undefined,
          otherBytes:
            !['VIDEO', 'IMAGE', 'AUDIO', 'PDF'].includes(assetType)
              ? { increment: BigInt(sizeBytes) }
              : undefined,
          lastCalculated: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update storage quota: ${error.message}`);
    }
  }

  /**
   * Get usage summary for organization
   */
  async getUsageSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.prisma.usageEvent.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Aggregate by category
    const summary = events.reduce(
      (acc, event) => {
        acc.totalEvents += 1;

        if (!acc.byCategory[event.category]) {
          acc.byCategory[event.category] = 0;
        }
        acc.byCategory[event.category] += event.quantity;

        if (!acc.byEventType[event.eventType]) {
          acc.byEventType[event.eventType] = 0;
        }
        acc.byEventType[event.eventType] += event.quantity;

        if (event.storageBytes) {
          acc.totalStorageBytes += Number(event.storageBytes);
        }

        if (event.computeSeconds) {
          acc.totalComputeSeconds += event.computeSeconds;
        }

        return acc;
      },
      {
        totalEvents: 0,
        byCategory: {} as Record<string, number>,
        byEventType: {} as Record<string, number>,
        totalStorageBytes: 0,
        totalComputeSeconds: 0,
      },
    );

    return summary;
  }

  /**
   * Get storage quota for organization
   */
  async getStorageQuota(organizationId: string): Promise<any> {
    const quota = await this.prisma.storageQuota.findUnique({
      where: { organizationId },
    });

    if (!quota) {
      return {
        usedBytes: 0,
        assetCount: 0,
        breakdown: {
          video: 0,
          image: 0,
          audio: 0,
          document: 0,
          other: 0,
        },
      };
    }

    return {
      usedBytes: Number(quota.usedBytes),
      assetCount: quota.assetCount,
      breakdown: {
        video: Number(quota.videoBytes),
        image: Number(quota.imageBytes),
        audio: Number(quota.audioBytes),
        document: Number(quota.documentBytes),
        other: Number(quota.otherBytes),
      },
      lastCalculated: quota.lastCalculated,
    };
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    organizationId: string,
    ownerUid: string,
    vertical: Vertical,
    featureName: string,
  ): Promise<void> {
    try {
      await this.prisma.featureUsage.upsert({
        where: {
          organizationId_vertical_featureName: {
            organizationId,
            vertical,
            featureName,
          },
        },
        create: {
          organizationId,
          ownerUid,
          vertical,
          featureName,
          usageCount: 1,
          firstUsedAt: new Date(),
          lastUsedAt: new Date(),
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to track feature usage: ${error.message}`);
    }
  }

  // ========= LAW VERTICAL TRACKING METHODS ========= //

  async trackLawCaseCreated(ownerUid: string, organizationId: string, caseId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_CASE_CREATED',
      category: 'PROJECTS',
      vertical: 'LAW',
      resourceType: 'LawCase',
      resourceId: caseId,
      quantity: 1,
    });
  }

  async trackLawCaseUpdated(ownerUid: string, organizationId: string, caseId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_CASE_UPDATED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawCase',
      resourceId: caseId,
      quantity: 1,
    });
  }

  async trackLawCaseClosed(ownerUid: string, organizationId: string, caseId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_CASE_CLOSED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawCase',
      resourceId: caseId,
      quantity: 1,
    });
  }

  async trackLawClientCreated(ownerUid: string, organizationId: string, clientId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_CLIENT_CREATED',
      category: 'PROJECTS',
      vertical: 'LAW',
      resourceType: 'LawClient',
      resourceId: clientId,
      quantity: 1,
    });
  }

  async trackLawClientUpdated(ownerUid: string, organizationId: string, clientId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_CLIENT_UPDATED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawClient',
      resourceId: clientId,
      quantity: 1,
    });
  }

  async trackLawDocumentUploaded(ownerUid: string, organizationId: string, documentId: string, fileSize: number, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_DOCUMENT_UPLOADED',
      category: 'STORAGE',
      vertical: 'LAW',
      resourceType: 'LawDocument',
      resourceId: documentId,
      quantity: 1,
      storageBytes: BigInt(fileSize),
    });
  }

  async trackLawDocumentDownloaded(ownerUid: string, organizationId: string, documentId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_DOCUMENT_DOWNLOADED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawDocument',
      resourceId: documentId,
      quantity: 1,
    });
  }

  async trackLawTaskCreated(ownerUid: string, organizationId: string, taskId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_TASK_CREATED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawTask',
      resourceId: taskId,
      quantity: 1,
    });
  }

  async trackLawTaskCompleted(ownerUid: string, organizationId: string, taskId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_TASK_COMPLETED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawTask',
      resourceId: taskId,
      quantity: 1,
    });
  }

  async trackLawEventCreated(ownerUid: string, organizationId: string, eventId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_EVENT_CREATED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawEvent',
      resourceId: eventId,
      quantity: 1,
    });
  }

  async trackLawInvoiceCreated(ownerUid: string, organizationId: string, invoiceId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_INVOICE_CREATED',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawInvoice',
      resourceId: invoiceId,
      quantity: 1,
    });
  }

  async trackLawInvoiceSent(ownerUid: string, organizationId: string, invoiceId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_INVOICE_SENT',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawInvoice',
      resourceId: invoiceId,
      quantity: 1,
    });
  }

  async trackLawInvoicePaid(ownerUid: string, organizationId: string, invoiceId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      ownerUid,
      organizationId,
      userId,
      eventType: 'LAW_INVOICE_PAID',
      category: 'FEATURES',
      vertical: 'LAW',
      resourceType: 'LawInvoice',
      resourceId: invoiceId,
      quantity: 1,
    });
  }
}
