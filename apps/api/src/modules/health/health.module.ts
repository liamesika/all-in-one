import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from '../../lib/health.service';
import { ProviderClientService } from '../../lib/provider-client.service';
import { EnvService } from '../../lib/env.service';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, ProviderClientService, EnvService, PrismaService],
  exports: [HealthService],
})
export class HealthModule {}
