import { Module } from '@nestjs/common';
import { RealEstatePropertiesController } from './real-estate-properties.controller';
import { RealEstatePropertiesService } from './real-estate-properties.service';
import { StorageService } from './storage.service';
import { PropertyScrapingService } from './property-scraping.service';
import { PropertyImportService } from './property-import.service';

@Module({
  controllers: [RealEstatePropertiesController],
  providers: [
    RealEstatePropertiesService, 
    StorageService,
    PropertyScrapingService,
    PropertyImportService
  ],
  exports: [RealEstatePropertiesService],
})
export class RealEstatePropertiesModule {}
