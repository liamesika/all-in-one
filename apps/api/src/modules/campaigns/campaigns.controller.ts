import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { LeadImportService } from './lead-import.service';
import { ShopifyIntegrationService } from './shopify-integration.service';
import { AttributionTrackingService } from './attribution-tracking.service';
import { OrgGuard } from '../../auth/org.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@UseGuards(OrgGuard)
@Controller('e-commerce/campaigns')
export class CampaignsController {
  constructor(
    private readonly svc: CampaignsService,
    private readonly leadImportService: LeadImportService,
    private readonly shopifyService: ShopifyIntegrationService,
    private readonly attributionService: AttributionTrackingService
  ) {}

  // GET /api/e-commerce/campaigns?q=&status=&limit=
  @Get()
  list(@Req() req: any, @Query('q') q?: string, @Query('status') status?: string, @Query('limit') limit = '100') {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.list(ownerUid, { q, status, limit: Number(limit) });
  }

  // GET /api/e-commerce/campaigns/:id
  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.get(ownerUid, id);
  }

  // POST /api/e-commerce/campaigns
  @Post()
  create(@Req() req: any, @Body() dto: CreateCampaignDto) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.create(ownerUid, dto);
  }

  // PATCH /api/e-commerce/campaigns/:id
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.svc.update(ownerUid, id, dto);
  }

  // DELETE /api/e-commerce/campaigns/:id
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const ownerUid = req?.ownerUid || 'demo';
    const ok = await this.svc.hardDelete(ownerUid, id);
    return { ok };
  }

  // POST /api/e-commerce/campaigns/leads/sync
  @Post('leads/sync')
  async syncLeads(@Req() req: any, @Query('campaignId') campaignId?: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.leadImportService.syncMetaCampaignLeads(ownerUid, campaignId);
  }

  // POST /api/e-commerce/campaigns/leads/import
  @Post('leads/import')
  async importLeads(@Req() req: any, @Body() body: { leads: any[] }) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.leadImportService.importMetaLeads(ownerUid, body.leads);
  }

  // GET /api/e-commerce/campaigns/leads/:leadId/attribution
  @Get('leads/:leadId/attribution')
  async getLeadAttribution(@Req() req: any, @Param('leadId') leadId: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.leadImportService.getCampaignAttribution(ownerUid, leadId);
  }

  // POST /api/e-commerce/campaigns/shopify/sync
  @Post('shopify/sync')
  async syncShopifyOrders(@Req() req: any, @Body() body: { shopifyUrl?: string; accessToken?: string }) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.shopifyService.syncShopifyOrders(ownerUid, body.shopifyUrl, body.accessToken);
  }

  // GET /api/e-commerce/campaigns/conversion-tracking
  @Get('conversion-tracking')
  async getConversionTracking(@Req() req: any, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.shopifyService.getConversionTracking(ownerUid, dateFrom, dateTo);
  }

  // GET /api/e-commerce/campaigns/attribution-report
  @Get('attribution-report')
  async getAttributionReport(@Req() req: any, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.attributionService.generateAttributionReport(ownerUid, dateFrom, dateTo);
  }

  // GET /api/e-commerce/campaigns/leads/:leadId/journey
  @Get('leads/:leadId/journey')
  async getLeadJourney(@Req() req: any, @Param('leadId') leadId: string) {
    const ownerUid = req?.ownerUid || 'demo';
    return this.attributionService.getLeadJourney(ownerUid, leadId);
  }

  // GET /api/e-commerce/campaigns/real-time-conversions
  @Get('real-time-conversions')
  async getRealTimeConversions(@Req() req: any, @Query('hoursBack') hoursBack?: string) {
    const ownerUid = req?.ownerUid || 'demo';
    const hours = parseInt(hoursBack || '24', 10);
    return this.attributionService.getRealTimeConversions(ownerUid, hours);
  }
}
