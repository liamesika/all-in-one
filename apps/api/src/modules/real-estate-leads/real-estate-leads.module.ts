import { Module } from '@nestjs/common';
import { RealEstateLeadsController } from './real-estate-leads.controller.js';
import { RealEstateLeadsService } from './real-estate-leads.service.js';

@Module({
  controllers: [RealEstateLeadsController],
  providers: [RealEstateLeadsService],
})
export class RealEstateLeadsModule {}
