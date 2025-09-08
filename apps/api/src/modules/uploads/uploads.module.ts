import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
