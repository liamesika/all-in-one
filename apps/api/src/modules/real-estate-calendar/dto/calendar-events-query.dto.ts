import { IsString, IsOptional } from 'class-validator';

export class CalendarEventsQueryDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  eventTypes?: string; // Comma-separated event types
}
