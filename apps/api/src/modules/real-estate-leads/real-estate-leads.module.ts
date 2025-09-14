import { Module } from '@nestjs/common';
import { RealEstateLeadsController } from './real-estate-leads.controller';
import { RealEstateLeadsService } from './real-estate-leads.service';

@Module({
  controllers: [RealEstateLeadsController],
  providers: [RealEstateLeadsService],
})
export class RealEstateLeadsModule {}
