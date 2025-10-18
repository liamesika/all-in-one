import { Module } from '@nestjs/common';
import { LawEventsController } from './law-events.controller';
import { LawEventsService } from './law-events.service';

@Module({
  imports: [],
  controllers: [LawEventsController],
  providers: [LawEventsService],
  exports: [LawEventsService],
})
export class LawEventsModule {}
