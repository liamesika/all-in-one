import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, BadRequestException } from '@nestjs/common';
import { RealEstateLeadsService } from './real-estate-leads.service';
import { CreateRealEstateLeadDto } from './dto/create-real-estate-lead.dto';
import { UpdateRealEstateLeadDto } from './dto/update-real-estate-lead.dto';

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
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.svc.list({ orgId, q, status, limit: Number(limit) });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.svc.getOne(id);
  }

  @Post()
  create(@Headers('x-org-id') orgId: string, @Body() dto: CreateRealEstateLeadDto) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }
    return this.svc.create({ orgId, dto });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRealEstateLeadDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.hardDelete(id);
  }
}
