import { Module } from '@nestjs/common';
import { LawTasksController } from './law-tasks.controller';
import { LawTasksService } from './law-tasks.service';

@Module({
  imports: [],
  controllers: [LawTasksController],
  providers: [LawTasksService],
  exports: [LawTasksService],
})
export class LawTasksModule {}
