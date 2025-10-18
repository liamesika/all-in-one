import { Controller, Get, Query, Req, Logger } from '@nestjs/common';
import { CreativeCalendarService } from './services/creative-calendar.service';

@Controller('creative-calendar')
export class CreativeCalendarController {
  private readonly logger = new Logger(CreativeCalendarController.name);

  constructor(private readonly calendarService: CreativeCalendarService) {}

  /**
   * Extract auth context from request
   */
  private extractAuthContext(req: any): {
    organizationId: string;
    ownerUid: string;
  } {
    return {
      organizationId: req.headers['x-org-id'] || 'demo-org',
      ownerUid: req.headers['x-owner-uid'] || 'demo-user',
    };
  }

  @Get('events')
  async getEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('projectId') projectId?: string,
    @Query('eventTypes') eventTypes?: string,
    @Req() req: any = {},
  ) {
    const { organizationId, ownerUid } = this.extractAuthContext(req);

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (projectId) filters.projectId = projectId;
    if (eventTypes) filters.eventTypes = eventTypes.split(',');

    return this.calendarService.getEvents(organizationId, ownerUid, filters);
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req: any = {},
  ) {
    const { organizationId, ownerUid } = this.extractAuthContext(req);

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.calendarService.getSummary(organizationId, ownerUid, filters);
  }
}
