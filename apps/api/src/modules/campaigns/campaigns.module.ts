import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { ExternalCampaignsService } from './external-campaigns.service';
import { ExternalCampaignsController } from './external-campaigns.controller';
import { ConnectionsModule } from '../connections/connections.module';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [ConnectionsModule],
  providers: [CampaignsService, ExternalCampaignsService, PrismaService],
  controllers: [CampaignsController, ExternalCampaignsController],
  exports: [ExternalCampaignsService],
})
export class CampaignsModule {}
