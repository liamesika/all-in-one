import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { ConnectionProvider } from '@prisma/client';

export interface ApiCallLog {
  connectionId?: string;
  ownerUid?: string;
  provider: ConnectionProvider;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  errorCode?: string;
  errorMessage?: string;
  cost?: number;
  quotaUsed?: number;
  jobId?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an external API call
   */
  async logApiCall(logData: ApiCallLog): Promise<void> {
    try {
      await this.prisma.apiAuditLog.create({
        data: {
          connectionId: logData.connectionId,
          ownerUid: logData.ownerUid,
          provider: logData.provider,
          method: logData.method,
          path: logData.path,
          statusCode: logData.statusCode,
          responseTime: logData.responseTime,
          errorCode: logData.errorCode,
          errorMessage: logData.errorMessage,
          cost: logData.cost,
          quotaUsed: logData.quotaUsed,
          jobId: logData.jobId,
          userAgent: logData.userAgent,
          ipAddress: logData.ipAddress,
        },
      });

      // Log errors for monitoring
      if (logData.statusCode >= 400) {
        this.logger.warn(
          `API Error: ${logData.provider} ${logData.method} ${logData.path} - ${logData.statusCode} (${logData.responseTime}ms)`,
          {
            connectionId: logData.connectionId,
            errorCode: logData.errorCode,
            errorMessage: logData.errorMessage,
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to log API call', error);
    }
  }

  /**
   * Get audit logs for a connection
   */
  async getConnectionLogs(
    connectionId: string,
    limit: number = 100,
  ): Promise<any[]> {
    return this.prisma.apiAuditLog.findMany({
      where: { connectionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get error rate statistics for a provider
   */
  async getErrorRateStats(
    provider: ConnectionProvider,
    hours: number = 24,
  ): Promise<{
    totalCalls: number;
    errorCalls: number;
    errorRate: number;
    avgResponseTime: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await this.prisma.apiAuditLog.aggregate({
      where: {
        provider,
        createdAt: {
          gte: since,
        },
      },
      _count: true,
      _avg: {
        responseTime: true,
      },
    });

    const errorStats = await this.prisma.apiAuditLog.aggregate({
      where: {
        provider,
        createdAt: {
          gte: since,
        },
        statusCode: {
          gte: 400,
        },
      },
      _count: true,
    });

    const totalCalls = stats._count;
    const errorCalls = errorStats._count;
    const errorRate = totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0;
    const avgResponseTime = stats._avg.responseTime || 0;

    return {
      totalCalls,
      errorCalls,
      errorRate,
      avgResponseTime,
    };
  }

  /**
   * Get cost analysis for a connection
   */
  async getCostAnalysis(
    connectionId: string,
    days: number = 30,
  ): Promise<{
    totalCost: number;
    totalQuota: number;
    dailyAverages: { date: string; cost: number; calls: number }[];
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const costStats = await this.prisma.apiAuditLog.aggregate({
      where: {
        connectionId,
        createdAt: {
          gte: since,
        },
      },
      _sum: {
        cost: true,
        quotaUsed: true,
      },
    });

    // Get daily breakdown
    const dailyStats = await this.prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(cost), 0) as cost,
        COUNT(*) as calls
      FROM "ApiAuditLog"
      WHERE connection_id = ${connectionId}
        AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return {
      totalCost: costStats._sum.cost || 0,
      totalQuota: costStats._sum.quotaUsed || 0,
      dailyAverages: Array.isArray(dailyStats) ? dailyStats.map((day: any) => ({
        date: day.date,
        cost: parseFloat(day.cost),
        calls: parseInt(day.calls),
      })) : [],
    };
  }

  /**
   * Health check endpoint for monitoring
   */
  async getHealthStatus(): Promise<{
    status: string;
    providers: { [key in ConnectionProvider]: any };
  }> {
    const providers: any = {};

    for (const provider of Object.values(ConnectionProvider)) {
      const stats = await this.getErrorRateStats(provider, 1); // Last hour
      providers[provider] = {
        healthy: stats.errorRate < 20, // Less than 20% error rate
        errorRate: stats.errorRate,
        avgResponseTime: stats.avgResponseTime,
        totalCalls: stats.totalCalls,
      };
    }

    const overallHealthy = Object.values(providers).every((p: any) => p.healthy);

    return {
      status: overallHealthy ? 'healthy' : 'degraded',
      providers,
    };
  }

  /**
   * Clean up old audit logs (keep only last 90 days)
   */
  async cleanupOldLogs(): Promise<void> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.apiAuditLog.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old audit logs`);
    } catch (error) {
      this.logger.error('Failed to cleanup old audit logs', error);
    }
  }
}

/**
 * Decorator to automatically log API calls
 */
export function LogApiCall(provider: ConnectionProvider) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      let statusCode = 200;
      let errorMessage: string | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error: any) {
        statusCode = error.status || 500;
        errorMessage = error.message;
        throw error;
      } finally {
        const responseTime = Date.now() - start;

        // Extract relevant info from args if available
        const auditService = this.auditService as AuditService;
        if (auditService) {
          auditService.logApiCall({
            provider,
            method: 'API_CALL',
            path: propertyName,
            statusCode,
            responseTime,
            errorMessage,
          });
        }
      }
    };
  };
}