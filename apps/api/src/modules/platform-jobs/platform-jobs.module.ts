import { Module } from '@nestjs/common';
import { PlatformJobsService } from './platform-jobs.service';
import { ConnectionsModule } from '../connections/connections.module';
import { InsightsModule } from '../insights/insights.module';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [ConnectionsModule, InsightsModule],
  providers: [PlatformJobsService, PrismaService],
  exports: [PlatformJobsService],
})
export class PlatformJobsModule {}