import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { HousekeepingModule } from './modules/housekeeping/housekeeping.module';
import { AiModule } from './modules/ai/ai.module';
import { AiCoachModule } from './modules/ai-coach/ai-coach.module';
import { ChatController } from './modules/chat/chat.controller';
// import { LeadsModule } from './modules/leads/leads.module';
import { PingController } from './ping.controller';
import { RealEstateLeadsModule } from './modules/real-estate-leads/real-estate-leads.module';
import { RealEstatePropertiesModule } from './modules/real-estate-properties/real-estate-properties.module';
import { RealEstateResearchModule } from './modules/real-estate-research/real-estate-research.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { InsightsModule } from './modules/insights/insights.module';
import { PlatformJobsModule } from './modules/platform-jobs/platform-jobs.module';
import { AuditModule } from './modules/audit/audit.module';
import { ProductionModule } from './modules/production/production.module';
import {
  CompressionMiddleware,
  CacheHeadersMiddleware,
  PerformanceMonitoringMiddleware
} from './common/middleware/performance.middleware';

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    AiModule,
    AiCoachModule,
    HealthModule,
    JobsModule,
    UploadsModule,
    HousekeepingModule,
    // LeadsModule,
    RealEstateLeadsModule,
    RealEstatePropertiesModule,
    RealEstateResearchModule,
    CampaignsModule,
    ConnectionsModule,
    InsightsModule,
    PlatformJobsModule,
    AuditModule,
    ProductionModule,
  ],
  controllers: [ChatController, PingController],
  
  providers: [
    // Global performance interceptor
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompressionMiddleware, CacheHeadersMiddleware, PerformanceMonitoringMiddleware)
      .forRoutes('*');
  }
}
