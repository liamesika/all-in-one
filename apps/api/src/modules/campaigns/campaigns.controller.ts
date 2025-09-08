import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { OrgGuard } from '../../auth/org.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@UseGuards(OrgGuard)
@Controller('e-commerce/campaigns')
export class CampaignsController {
  constructor(private readonly svc: CampaignsService) {}

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
}
