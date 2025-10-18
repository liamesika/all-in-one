// apps/api/src/modules/usage-tracking/usage-tracking.module.ts
import { Module, Global } from '@nestjs/common';
import { UsageTrackingService } from './usage-tracking.service';
import { UsageTrackingController } from './usage-tracking.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Global() // Make it available everywhere without importing
@Module({
  imports: [PrismaModule],
  controllers: [UsageTrackingController],
  providers: [UsageTrackingService],
  exports: [UsageTrackingService],
})
export class UsageTrackingModule {}
