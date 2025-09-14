import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../lib/prisma.service';
import { ConnectionsService } from '../connections/connections.service';
import { InsightsService } from '../insights/insights.service';
import {
  JobType,
  JobStatus,
  ConnectionProvider,
  ConnectionStatus,
  Job,
} from '@prisma/client';

@Injectable()
export class PlatformJobsService {
  private readonly logger = new Logger(PlatformJobsService.name);

  constructor(
    private prisma: PrismaService,
    private connectionsService: ConnectionsService,
    private insightsService: InsightsService,
  ) {}

  /**
   * Scheduled job to fetch insights hourly
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledInsightsFetch(): Promise<void> {
    this.logger.log('Starting scheduled insights fetch');

    try {
      // Get all active connections
      const connections = await this.prisma.connection.findMany({
        where: {
          status: ConnectionStatus.CONNECTED,
        },
      });

      for (const connection of connections) {
        await this.enqueueJob({
          ownerUid: connection.ownerUid,
          connectionId: connection.id,
          type: JobType.FETCH_INSIGHTS,
          inputData: {
            provider: connection.provider,
            window: 7, // Last 7 days
          },
        });
      }

      this.logger.log(`Enqueued ${connections.length} insights fetch jobs`);
    } catch (error) {
      this.logger.error('Failed to enqueue scheduled insights jobs', error);
    }
  }

  /**
   * Scheduled job to refresh tokens 5 minutes before expiry
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledTokenRefresh(): Promise<void> {
    this.logger.log('Checking for tokens that need refresh');

    try {
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

      const tokensToRefresh = await this.prisma.oAuthToken.findMany({
        where: {
          expiresAt: {
            lte: fiveMinutesFromNow,
          },
          connection: {
            status: ConnectionStatus.CONNECTED,
          },
        },
        include: {
          connection: true,
        },
      });

      for (const token of tokensToRefresh) {
        await this.enqueueJob({
          ownerUid: token.connection.ownerUid,
          connectionId: token.connectionId,
          type: JobType.TOKEN_REFRESH,
          inputData: {
            provider: token.connection.provider,
            tokenId: token.id,
          },
          priority: 10, // High priority
        });
      }

      this.logger.log(`Enqueued ${tokensToRefresh.length} token refresh jobs`);
    } catch (error) {
      this.logger.error('Failed to enqueue token refresh jobs', error);
    }
  }

  /**
   * Process pending jobs
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async processPendingJobs(): Promise<void> {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.PENDING,
        scheduledFor: {
          lte: new Date(),
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 10, // Process up to 10 jobs at once
    });

    for (const job of jobs) {
      await this.processJob(job);
    }
  }

  /**
   * Enqueue a new job
   */
  async enqueueJob(jobData: {
    ownerUid: string;
    connectionId?: string;
    type: JobType;
    inputData?: any;
    scheduledFor?: Date;
    priority?: number;
    maxRetries?: number;
  }): Promise<Job> {
    return this.prisma.job.create({
      data: {
        ownerUid: jobData.ownerUid,
        connectionId: jobData.connectionId,
        type: jobData.type,
        status: JobStatus.PENDING,
        inputData: jobData.inputData,
        scheduledFor: jobData.scheduledFor || new Date(),
        priority: jobData.priority || 0,
        maxRetries: jobData.maxRetries || 3,
      },
    });
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.id} (${job.type})`);

    // Mark job as running
    await this.prisma.job.update({
      where: { id: job.id },
      data: {
        status: JobStatus.RUNNING,
        startedAt: new Date(),
        statusMessage: `Processing ${job.type}`,
      },
    });

    try {
      let result: any = null;

      switch (job.type) {
        case JobType.SYNC_ACCOUNTS:
          result = await this.processSyncAccountsJob(job);
          break;
        case JobType.FETCH_INSIGHTS:
          result = await this.processFetchInsightsJob(job);
          break;
        case JobType.TOKEN_REFRESH:
          result = await this.processTokenRefreshJob(job);
          break;
        case JobType.CREATE_CAMPAIGN:
        case JobType.PAUSE_CAMPAIGN:
        case JobType.RESUME_CAMPAIGN:
          result = await this.processCampaignJob(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Mark job as completed
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          outputData: result,
          statusMessage: 'Completed successfully',
          progress: 100,
        },
      });

      this.logger.log(`Completed job ${job.id} (${job.type})`);
    } catch (error) {
      await this.handleJobError(job, error);
    }
  }

  /**
   * Process sync accounts job
   */
  private async processSyncAccountsJob(job: Job): Promise<any> {
    if (!job.connectionId) {
      throw new Error('Connection ID required for SYNC_ACCOUNTS job');
    }

    const connection = await this.prisma.connection.findUnique({
      where: { id: job.connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const accessToken = await this.connectionsService.getAccessToken(job.connectionId);
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    // Fetch ad accounts from provider
    const accounts = await this.fetchAdAccountsFromProvider(
      connection.provider,
      accessToken,
    );

    // Upsert accounts in database
    let syncedCount = 0;
    for (const account of accounts) {
      await this.prisma.adAccount.upsert({
        where: {
          connectionId_externalId: {
            connectionId: job.connectionId,
            externalId: account.externalId,
          },
        },
        create: {
          connectionId: job.connectionId,
          ownerUid: job.ownerUid,
          externalId: account.externalId,
          name: account.name,
          currency: account.currency,
          timezone: account.timezone,
          status: account.status,
          permissions: account.permissions,
          metadata: account.metadata,
        },
        update: {
          name: account.name,
          currency: account.currency,
          timezone: account.timezone,
          status: account.status,
          permissions: account.permissions,
          metadata: account.metadata,
          lastSyncAt: new Date(),
        },
      });
      syncedCount++;
    }

    // Update connection account count
    await this.prisma.connection.update({
      where: { id: job.connectionId },
      data: {
        accountCount: syncedCount,
        lastSyncAt: new Date(),
      },
    });

    return { syncedAccounts: syncedCount };
  }

  /**
   * Process fetch insights job
   */
  private async processFetchInsightsJob(job: Job): Promise<any> {
    if (!job.connectionId) {
      throw new Error('Connection ID required for FETCH_INSIGHTS job');
    }

    await this.insightsService.fetchInsightsFromProviders(
      job.ownerUid,
      job.connectionId,
    );

    return { status: 'insights_fetched' };
  }

  /**
   * Process token refresh job
   */
  private async processTokenRefreshJob(job: Job): Promise<any> {
    if (!job.connectionId) {
      throw new Error('Connection ID required for TOKEN_REFRESH job');
    }

    const refreshed = await this.connectionsService.refreshToken(job.connectionId);

    if (!refreshed) {
      throw new Error('Token refresh failed');
    }

    return { status: 'token_refreshed' };
  }

  /**
   * Process campaign operation jobs
   */
  private async processCampaignJob(job: Job): Promise<any> {
    // Campaign jobs are handled by the external campaigns service
    // This is a placeholder for campaign-specific job processing
    return { status: `${job.type.toLowerCase()}_completed` };
  }

  /**
   * Handle job errors and retries
   */
  private async handleJobError(job: Job, error: any): Promise<void> {
    this.logger.error(`Job ${job.id} failed:`, error);

    const newRetryCount = job.retryCount + 1;
    const shouldRetry = newRetryCount < job.maxRetries;

    if (shouldRetry) {
      // Calculate exponential backoff delay
      const delayMinutes = Math.pow(2, newRetryCount) * 5; // 5, 10, 20 minutes
      const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);

      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.RETRYING,
          retryCount: newRetryCount,
          scheduledFor,
          errorData: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          },
          statusMessage: `Retry ${newRetryCount}/${job.maxRetries} scheduled`,
        },
      });

      this.logger.log(`Scheduled retry ${newRetryCount} for job ${job.id} in ${delayMinutes} minutes`);
    } else {
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          errorData: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          },
          statusMessage: `Failed after ${job.maxRetries} retries`,
        },
      });
    }
  }

  /**
   * Fetch ad accounts from provider APIs
   */
  private async fetchAdAccountsFromProvider(
    provider: ConnectionProvider,
    accessToken: string,
  ): Promise<Array<{
    externalId: string;
    name: string;
    currency?: string;
    timezone?: string;
    status: string;
    permissions?: any;
    metadata?: any;
  }>> {
    // Provider-specific implementations
    switch (provider) {
      case ConnectionProvider.META:
        return this.fetchMetaAdAccounts(accessToken);
      case ConnectionProvider.GOOGLE_ADS:
        return this.fetchGoogleAdAccounts(accessToken);
      case ConnectionProvider.TIKTOK_ADS:
        return this.fetchTikTokAdAccounts(accessToken);
      case ConnectionProvider.LINKEDIN_ADS:
        return this.fetchLinkedInAdAccounts(accessToken);
      default:
        return [];
    }
  }

  // Provider-specific ad account fetching (simplified for MVP)

  private async fetchMetaAdAccounts(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,currency,timezone,account_status,capabilities`,
      );
      const result = await response.json();

      return result.data?.map((account: any) => ({
        externalId: account.id.replace('act_', ''),
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name,
        status: account.account_status === 1 ? 'ACTIVE' : 'DISABLED',
        permissions: account.capabilities,
        metadata: { platform: 'meta' },
      })) || [];
    } catch (error) {
      this.logger.error('Failed to fetch Meta ad accounts', error);
      return [];
    }
  }

  private async fetchGoogleAdAccounts(accessToken: string): Promise<any[]> {
    // Google Ads API implementation - placeholder for MVP
    return [];
  }

  private async fetchTikTokAdAccounts(accessToken: string): Promise<any[]> {
    // TikTok API implementation - placeholder for MVP
    return [];
  }

  private async fetchLinkedInAdAccounts(accessToken: string): Promise<any[]> {
    // LinkedIn API implementation - placeholder for MVP
    return [];
  }
}