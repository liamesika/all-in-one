import { Module } from '@nestjs/common';
import { PreviewService } from './preview.service';
import { PreviewController } from './preview.controller';
import { IntegrationService } from '../integrations/integration.service';

/**
 * Campaign Preview Module
 * 
 * Provides campaign preview generation with smart insights
 * and platform-specific estimates.
 */
@Module({
  controllers: [PreviewController],
  providers: [PreviewService, IntegrationService],
  exports: [PreviewService]
})
export class PreviewModule {}