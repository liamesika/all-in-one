// apps/api/src/modules/creative-production/creative-production.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UsageTrackingModule } from '@/modules/usage-tracking/usage-tracking.module';

// Controllers
import { CreativeProjectsController } from './creative-projects.controller';

// Services
import { CreativeProjectsService } from './services/creative-projects.service';
import { CreativeAssetsService } from './services/creative-assets.service';
import { CreativeRendersService } from './services/creative-renders.service';

@Module({
  imports: [
    PrismaModule,
    UsageTrackingModule,
  ],
  controllers: [
    CreativeProjectsController,
    // TODO: Add more controllers as they are created
    // CreativeAssetsController,
    // CreativeRendersController,
    // CreativeTasksController,
  ],
  providers: [
    CreativeProjectsService,
    CreativeAssetsService,
    CreativeRendersService,
  ],
  exports: [
    CreativeProjectsService,
    CreativeAssetsService,
    CreativeRendersService,
  ],
})
export class CreativeProductionModule {}
