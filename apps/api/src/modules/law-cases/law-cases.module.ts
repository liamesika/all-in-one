import { Module } from '@nestjs/common';
import { LawCasesController } from './law-cases.controller';
import { LawCasesService } from './law-cases.service';

@Module({
  imports: [],
  controllers: [LawCasesController],
  providers: [LawCasesService],
  exports: [LawCasesService],
})
export class LawCasesModule {}
