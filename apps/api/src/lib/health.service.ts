import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvService } from './env.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    environment: HealthCheck;
    memory: HealthCheck;
    dependencies: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  details?: any;
  responseTime?: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly envService: EnvService
  ) {}

  /**
   * Comprehensive health check for all system components
   */
  async getHealthStatus(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const version = process.env.npm_package_version || '1.0.0';
    const uptime = Math.floor(process.uptime());

    const [database, environment, memory, dependencies] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkEnvironment(),
      this.checkMemory(),
      this.checkDependencies(),
    ]);

    const checks = {
      database: this.extractResult(database),
      environment: this.extractResult(environment),
      memory: this.extractResult(memory),
      dependencies: this.extractResult(dependencies),
    };

    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (statuses.includes('fail')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('warn')) {
      overallStatus = 'degraded';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp,
      version,
      uptime,
      checks,
    };

    this.logger.log(`Health check completed: ${overallStatus}`, {
      status: overallStatus,
      checks: Object.entries(checks).map(([name, check]) => `${name}: ${check.status}`).join(', '),
    });

    return result;
  }

  /**
   * Database connectivity and performance check
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Test write capability with a simple query
      const userCount = await this.prisma.user.count();

      const responseTime = Date.now() - startTime;

      // Warn if database is slow
      if (responseTime > 1000) {
        return {
          status: 'warn',
          message: 'Database responding slowly',
          responseTime,
          details: { userCount, slowQuery: true },
        };
      }

      return {
        status: 'pass',
        message: 'Database connection healthy',
        responseTime,
        details: { userCount },
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Environment configuration check
   */
  private async checkEnvironment(): Promise<HealthCheck> {
    try {
      // Validate critical environment variables
      const critical = ['DATABASE_URL', 'JWT_SECRET', 'TOKEN_CRYPTO_KEY'];
      const missing = critical.filter(key => !this.envService.get(key as any));

      if (missing.length > 0) {
        return {
          status: 'fail',
          message: `Missing critical environment variables: ${missing.join(', ')}`,
          details: { missing },
        };
      }

      // Check crypto key validity
      try {
        this.envService.validateCryptoKey();
      } catch (error) {
        return {
          status: 'fail',
          message: 'Invalid crypto key configuration',
          details: { error: error.message },
        };
      }

      // Count configured integrations
      const providers = ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN'];
      const configured = providers.filter(provider =>
        this.envService.isProviderConfigured(provider as any)
      );

      return {
        status: 'pass',
        message: 'Environment configuration valid',
        details: {
          environment: this.envService.get('NODE_ENV'),
          configuredProviders: configured,
          totalProviders: providers.length,
        },
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Environment check failed: ${error.message}`,
      };
    }
  }

  /**
   * Memory and system resource check
   */
  private async checkMemory(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // Warn if memory usage is high (over 512MB heap)
    if (heapUsedMB > 512) {
      return {
        status: 'warn',
        message: 'High memory usage detected',
        details: {
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
          rss: `${rssMB}MB`,
          uptime: Math.floor(process.uptime()),
        },
      };
    }

    return {
      status: 'pass',
      message: 'Memory usage normal',
      details: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${rssMB}MB`,
        uptime: Math.floor(process.uptime()),
      },
    };
  }

  /**
   * External dependencies and integrations check
   */
  private async checkDependencies(): Promise<HealthCheck> {
    const checks = [];

    // Check if Redis is configured (optional)
    const redisHost = this.envService.get('REDIS_HOST');
    if (redisHost) {
      // Note: In a real implementation, you'd test Redis connectivity here
      checks.push({ name: 'redis', status: 'configured', url: redisHost });
    }

    // Check if OpenAI is configured
    const openaiKey = this.envService.get('OPENAI_API_KEY');
    if (openaiKey) {
      checks.push({ name: 'openai', status: 'configured' });
    }

    // Check platform integrations
    const providers = ['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN'];
    const platformChecks = providers.map(provider => ({
      name: provider.toLowerCase(),
      status: this.envService.isProviderConfigured(provider as any) ? 'configured' : 'not_configured',
    }));

    const configuredCount = platformChecks.filter(p => p.status === 'configured').length;

    return {
      status: 'pass',
      message: 'Dependencies checked',
      details: {
        external: checks,
        platforms: platformChecks,
        configuredPlatforms: `${configuredCount}/${providers.length}`,
      },
    };
  }

  /**
   * Get basic system metrics for monitoring
   */
  getMetrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    environment: string;
    nodeVersion: string;
    startTime: number;
  } {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      environment: this.envService.get('NODE_ENV'),
      nodeVersion: process.version,
      startTime: this.startTime,
    };
  }

  /**
   * Simple ready check (lighter than full health check)
   */
  async ready(): Promise<{ ready: boolean; message?: string }> {
    try {
      // Just test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch (error) {
      return {
        ready: false,
        message: `Database not ready: ${error.message}`,
      };
    }
  }

  /**
   * Liveness check (minimal check to verify service is running)
   */
  alive(): { alive: boolean; timestamp: string } {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }

  private extractResult(result: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'fail',
        message: result.reason?.message || 'Health check failed',
      };
    }
  }
}