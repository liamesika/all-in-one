import { Module } from '@nestjs/common';
import { RealEstateCalendarController } from './real-estate-calendar.controller';
import { RealEstateCalendarService } from './real-estate-calendar.service';

@Module({
  controllers: [RealEstateCalendarController],
  providers: [RealEstateCalendarService],
  exports: [RealEstateCalendarService],
})
export class RealEstateCalendarModule {}
