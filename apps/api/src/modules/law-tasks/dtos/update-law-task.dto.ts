import { PartialType } from '@nestjs/mapped-types';
import { CreateLawTaskDto } from './create-law-task.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateLawTaskDto extends PartialType(CreateLawTaskDto) {
  @IsOptional()
  @IsDateString()
  completedDate?: string;
}
