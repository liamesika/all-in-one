import { PartialType } from '@nestjs/mapped-types';
import { CreateLawCaseDto } from './create-law-case.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateLawCaseDto extends PartialType(CreateLawCaseDto) {
  @IsOptional()
  @IsDateString()
  closingDate?: string;
}
