import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from '../../lib/health.service';
import { ProviderClientService } from '../../lib/provider-client.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly providerClientService: ProviderClientService
  ) {}

  /**
   * Comprehensive health check
   * GET /health
   */
  @Get()
  async health(@Res() res: Response) {
    const healthResult = await this.healthService.getHealthStatus();

    // Set HTTP status based on health result
    let httpStatus = HttpStatus.OK;
    if (healthResult.status === 'unhealthy') {
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
    } else if (healthResult.status === 'degraded') {
      httpStatus = HttpStatus.PARTIAL_CONTENT;
    }

    res.status(httpStatus).json(healthResult);
  }

  /**
   * Readiness check (for load balancers and Kubernetes)
   * GET /health/ready
   */
  @Get('ready')
  async ready(@Res() res: Response) {
    const readyResult = await this.healthService.ready();

    if (readyResult.ready) {
      res.status(HttpStatus.OK).json(readyResult);
    } else {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json(readyResult);
    }
  }

  /**
   * Liveness check (for Kubernetes)
   * GET /health/alive
   */
  @Get('alive')
  alive() {
    return this.healthService.alive();
  }

  /**
   * System metrics endpoint
   * GET /health/metrics
   */
  @Get('metrics')
  metrics() {
    const systemMetrics = this.healthService.getMetrics();
    const providerStats = this.providerClientService.getStats();

    return {
      system: systemMetrics,
      provider: providerStats,
    };
  }

  /**
   * Provider client health check
   * GET /health/providers
   */
  @Get('providers')
  async providers() {
    const providerHealth = await this.providerClientService.healthCheck();
    const systemStats = this.providerClientService.getStats();

    return {
      ...providerHealth,
      stats: systemStats,
    };
  }
}
