import { IsString, IsOptional, IsDateString, IsIn, IsNumber, IsArray } from 'class-validator';

export class CreateLawEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['hearing', 'meeting', 'deadline', 'submission', 'consultation'])
  eventType: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendeeIds?: string[];

  @IsOptional()
  @IsIn(['scheduled', 'completed', 'cancelled', 'rescheduled'])
  status?: string;
}
