import { IsString, IsOptional, IsDateString, IsIn, IsNumber } from 'class-validator';

export class CreateLawTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsIn(['todo', 'in_progress', 'review', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsIn(['todo', 'in_progress', 'review', 'done'])
  boardColumn?: string;

  @IsOptional()
  @IsNumber()
  boardOrder?: number;
}
