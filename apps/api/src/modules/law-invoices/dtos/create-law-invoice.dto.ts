import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateLawInvoiceDto {
  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  billableHours?: number;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
