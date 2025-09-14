import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RealEstateResearchController } from './real-estate-research.controller';
import { RealEstateResearchService } from './real-estate-research.service';
import { SearchProcessor } from './processors/search.processor';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'real-estate-search',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  controllers: [RealEstateResearchController],
  providers: [
    RealEstateResearchService,
    SearchProcessor,
    PrismaService,
  ],
  exports: [RealEstateResearchService],
})
export class RealEstateResearchModule {}