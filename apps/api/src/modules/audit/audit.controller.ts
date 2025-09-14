import {
  Controller,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { ConnectionProvider } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    organizationId?: string;
  };
}

@Controller('api/audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  /**
   * Get health status for all providers
   * GET /api/audit/health
   */
  @Get('health')
  async getHealthStatus() {
    const health = await this.auditService.getHealthStatus();
    return {
      success: true,
      ...health,
    };
  }

  /**
   * Get error rate statistics for a provider
   * GET /api/audit/stats/:provider
   */
  @Get('stats/:provider')
  async getProviderStats(
    @Param('provider') provider: string,
    @Query('hours') hours?: string,
  ) {
    const providerEnum = this.validateProvider(provider);
    const hoursNum = hours ? parseInt(hours) : 24;

    const stats = await this.auditService.getErrorRateStats(
      providerEnum,
      hoursNum,
    );

    return {
      success: true,
      provider: providerEnum,
      period: `${hoursNum} hours`,
      ...stats,
    };
  }

  /**
   * Get audit logs for a connection
   * GET /api/audit/connections/:connectionId/logs
   */
  @Get('connections/:connectionId/logs')
  async getConnectionLogs(
    @Param('connectionId') connectionId: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const limitNum = limit ? parseInt(limit) : 100;

    const logs = await this.auditService.getConnectionLogs(
      connectionId,
      limitNum,
    );

    return {
      success: true,
      connectionId,
      logs,
      total: logs.length,
    };
  }

  /**
   * Get cost analysis for a connection
   * GET /api/audit/connections/:connectionId/costs
   */
  @Get('connections/:connectionId/costs')
  async getConnectionCosts(
    @Param('connectionId') connectionId: string,
    @Query('days') days?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const daysNum = days ? parseInt(days) : 30;

    const costs = await this.auditService.getCostAnalysis(
      connectionId,
      daysNum,
    );

    return {
      success: true,
      connectionId,
      period: `${daysNum} days`,
      ...costs,
    };
  }

  private validateProvider(provider: string): ConnectionProvider {
    const upperProvider = provider.toUpperCase().replace('-', '_');

    if (!Object.values(ConnectionProvider).includes(upperProvider as ConnectionProvider)) {
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers: ${Object.values(ConnectionProvider).join(', ')}`,
      );
    }

    return upperProvider as ConnectionProvider;
  }
}