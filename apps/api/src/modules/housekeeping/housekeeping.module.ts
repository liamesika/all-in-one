import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HousekeepingService } from './housekeeping.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [HousekeepingService],
})
export class HousekeepingModule {}
