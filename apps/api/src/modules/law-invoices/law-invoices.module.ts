import { Module } from '@nestjs/common';
import { LawInvoicesController } from './law-invoices.controller';
import { LawInvoicesService } from './law-invoices.service';

@Module({
  imports: [],
  controllers: [LawInvoicesController],
  providers: [LawInvoicesService],
  exports: [LawInvoicesService],
})
export class LawInvoicesModule {}
