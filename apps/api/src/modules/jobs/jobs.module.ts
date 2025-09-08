import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AiModule } from '../ai/ai.module';  // ← חדש


@Module({
  imports: [AiModule], 
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService], // <— חשוב: מאפשר למודולים אחרים להשתמש ב-JobsService
})
export class JobsModule {}
