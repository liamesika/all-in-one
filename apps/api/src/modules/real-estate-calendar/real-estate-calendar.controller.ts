import { Controller, Get, Headers, Query, BadRequestException } from '@nestjs/common';
import { RealEstateCalendarService } from './real-estate-calendar.service';
import { CalendarEventsQueryDto } from './dto/calendar-events-query.dto';

@Controller('real-estate/calendar')
export class RealEstateCalendarController {
  constructor(private readonly calendarService: RealEstateCalendarService) {}

  /**
   * GET /api/real-estate/calendar/events
   *
   * Query Parameters:
   * - startDate (required): ISO date string (e.g., 2025-01-01)
   * - endDate (required): ISO date string (e.g., 2025-01-31)
   * - eventTypes (optional): Comma-separated event types (e.g., "property_viewing,follow_up")
   *
   * Returns array of CalendarEvent objects
   */
  @Get('events')
  async getEvents(
    @Headers('x-org-id') orgId: string,
    @Query() query: CalendarEventsQueryDto,
  ) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required (x-org-id header)');
    }

    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('startDate and endDate are required query parameters');
    }

    // Validate date format
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDate format. Use ISO date (e.g., 2025-01-01)');
    }

    if (isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid endDate format. Use ISO date (e.g., 2025-01-31)');
    }

    if (endDate < startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // Validate eventTypes if provided
    if (query.eventTypes) {
      const validTypes = ['property_viewing', 'task_due', 'follow_up', 'deadline'];
      const requestedTypes = query.eventTypes.split(',').map((t) => t.trim());
      const invalidTypes = requestedTypes.filter((t) => !validTypes.includes(t));

      if (invalidTypes.length > 0) {
        throw new BadRequestException(
          `Invalid event types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`,
        );
      }
    }

    return this.calendarService.getEvents(orgId, {
      startDate: query.startDate,
      endDate: query.endDate,
      eventTypes: query.eventTypes,
    });
  }
}
