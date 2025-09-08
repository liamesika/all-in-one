import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { RealEstateLeadsService } from './real-estate-leads.service.js';

@Controller('real-estate/leads')
export class RealEstateLeadsController {
  constructor(private readonly svc: RealEstateLeadsService) {}

  @Get()
  list(
    @Headers('x-org-id') orgId?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('limit') limit = '100',
  ) {
    return this.svc.list({ orgId: orgId || 'demo', q, status, limit: Number(limit) });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.svc.getOne(id);
  }

  @Post()
  create(@Headers('x-org-id') orgId: string, @Body() dto: any) {
    return this.svc.create({ orgId: orgId || 'demo', dto });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.hardDelete(id);
  }
}
