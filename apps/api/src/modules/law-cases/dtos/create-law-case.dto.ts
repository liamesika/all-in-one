import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateLawCaseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  clientId: string;

  @IsIn(['civil', 'criminal', 'corporate', 'family', 'immigration', 'other'])
  caseType: string;

  @IsIn(['active', 'pending', 'closed', 'archived'])
  @IsOptional()
  status?: string;

  @IsIn(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsDateString()
  filingDate?: string;

  @IsOptional()
  @IsDateString()
  nextHearingDate?: string;
}
