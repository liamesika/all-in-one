import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { HousekeepingModule } from './modules/housekeeping/housekeeping.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatController } from './modules/chat/chat.controller';
import { LeadsModule } from './modules/leads/leads.module';
import { PingController } from './ping.controller';
import { RealEstateLeadsModule } from './modules/real-estate-leads/real-estate-leads.module';
import { RealEstatePropertiesModule } from './modules/real-estate-properties/real-estate-properties.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    AiModule,
    HealthModule,
    JobsModule,
    UploadsModule,
    HousekeepingModule,
    LeadsModule,
    RealEstateLeadsModule,
    RealEstatePropertiesModule,
    CampaignsModule,
  ],
  controllers: [ChatController, PingController],
  
  providers: [],
  // אין controllers / providers ברמת האפליקציה
})
export class AppModule {}
