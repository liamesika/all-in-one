// apps/api/src/modules/creative-production/creative-production.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsageTrackingModule } from '@/modules/usage-tracking/usage-tracking.module';

// Controllers
import { CreativeProjectsController } from './creative-projects.controller';
import { CreativeClientsController } from './creative-clients.controller';
import { CreativeCalendarController } from './creative-calendar.controller';

// Services
import { CreativeProjectsService } from './services/creative-projects.service';
import { CreativeAssetsService } from './services/creative-assets.service';
import { CreativeRendersService } from './services/creative-renders.service';
import { CreativeClientsService } from './services/creative-clients.service';
import { CreativeCalendarService } from './services/creative-calendar.service';

@Module({
  imports: [
    PrismaModule,
    UsageTrackingModule,
  ],
  controllers: [
    CreativeProjectsController,
    CreativeClientsController,
    CreativeCalendarController,
    // TODO: Add more controllers as they are created
    // CreativeAssetsController,
    // CreativeRendersController,
    // CreativeTasksController,
  ],
  providers: [
    CreativeProjectsService,
    CreativeAssetsService,
    CreativeRendersService,
    CreativeClientsService,
    CreativeCalendarService,
  ],
  exports: [
    CreativeProjectsService,
    CreativeAssetsService,
    CreativeRendersService,
    CreativeClientsService,
    CreativeCalendarService,
  ],
})
export class CreativeProductionModule {}
