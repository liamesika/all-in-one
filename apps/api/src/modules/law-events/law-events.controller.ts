import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LawEventsService } from './law-events.service';
import { CreateLawEventDto } from './dtos/create-law-event.dto';
import { UpdateLawEventDto } from './dtos/update-law-event.dto';
import { OrgGuard } from '../../auth/org.guard';

@UseGuards(OrgGuard)
@Controller('law/events')
export class LawEventsController {
  constructor(private readonly service: LawEventsService) {}

  @Get()
  list(@Req() req: any, @Query('q') q?: string, @Query('eventType') eventType?: string, @Query('caseId') caseId?: string,
    @Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Query('limit') limit?: string,
    @Query('page') page?: string, @Query('offset') offset?: string, @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
    return this.service.list(req.ownerUid, req.organizationId, {
      q, eventType, caseId, startDate, endDate,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      offset: offset ? Number(offset) : undefined,
      sortBy, sortOrder,
    });
  }

  @Get('calendar')
  getCalendar(@Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.service.getCalendarView(req.ownerUid, req.organizationId, startDate, endDate);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.ownerUid, req.organizationId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateLawEventDto) {
    return this.service.create(req.ownerUid, req.organizationId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLawEventDto) {
    return this.service.update(req.ownerUid, req.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.delete(req.ownerUid, req.organizationId, id);
  }
}
