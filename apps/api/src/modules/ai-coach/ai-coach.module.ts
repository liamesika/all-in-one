import { Module } from '@nestjs/common';
import { AiCoachController } from './ai-coach.controller';
import { AiCoachService } from '../../lib/ai-coach.service';
import { BotDataService } from '../../lib/bot-data.service';
import { BotToolsService } from '../../lib/bot-tools.service';
import { PrismaService } from '../../lib/prisma.service';
import { EnvService } from '../../lib/env.service';

@Module({
  controllers: [AiCoachController],
  providers: [
    AiCoachService,
    BotDataService,
    BotToolsService,
    PrismaService,
    EnvService,
  ],
  exports: [AiCoachService, BotDataService, BotToolsService],
})
export class AiCoachModule {}