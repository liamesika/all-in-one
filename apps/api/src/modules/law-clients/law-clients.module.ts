import { Module } from '@nestjs/common';
import { LawClientsController } from './law-clients.controller';
import { LawClientsService } from './law-clients.service';

@Module({
  imports: [],
  controllers: [LawClientsController],
  providers: [LawClientsService],
  exports: [LawClientsService],
})
export class LawClientsModule {}
