import { Module } from '@nestjs/common';
import { RealEstatePropertiesController } from './real-estate-properties.controller.js';
import { RealEstatePropertiesService } from './real-estate-properties.service.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [RealEstatePropertiesController],
  providers: [RealEstatePropertiesService, StorageService],
  exports: [RealEstatePropertiesService],
})
export class RealEstatePropertiesModule {}
