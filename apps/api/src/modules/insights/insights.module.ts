import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { ConnectionsModule } from '../connections/connections.module';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [ConnectionsModule],
  controllers: [InsightsController],
  providers: [InsightsService, PrismaService],
  exports: [InsightsService],
})
export class InsightsModule {}