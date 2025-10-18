import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LawInvoicesService } from './law-invoices.service';
import { CreateLawInvoiceDto } from './dtos/create-law-invoice.dto';
import { UpdateLawInvoiceDto } from './dtos/update-law-invoice.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/invoices')
export class LawInvoicesController {
  constructor(private readonly service: LawInvoicesService) {}

  @Get()
  list(@Req() req: any, @Query('q') q?: string, @Query('status') status?: string, @Query('caseId') caseId?: string,
    @Query('limit') limit?: string, @Query('page') page?: string, @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string, @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.service.list(req.ownerUid, req.organizationId, {
      q, status, caseId,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      offset: offset ? Number(offset) : undefined,
      sortBy, sortOrder,
    });
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.ownerUid, req.organizationId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLawInvoiceDto) {
    return this.service.create(req.ownerUid, req.organizationId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawInvoiceDto) {
    return this.service.update(req.ownerUid, req.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.delete(req.ownerUid, req.organizationId, id);
  }

  @Post(':id/send')
  markAsSent(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsSent(req.ownerUid, req.organizationId, id);
  }

  @Post(':id/paid')
  markAsPaid(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsPaid(req.ownerUid, req.organizationId, id);
  }
}
