import { IsString, IsOptional, IsEnum, IsUUID, IsDecimal, IsUrl, MinLength, MaxLength, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums based on Prisma schema
export enum BudgetCategory {
  STAGE = 'STAGE',
  LIGHTING = 'LIGHTING',
  CATERING = 'CATERING',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER'
}

export class CreateProductionBudgetItemDto {
  @IsEnum(BudgetCategory)
  category: BudgetCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  planned: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  actual?: number = 0;

  @IsOptional()
  @IsUrl()
  invoiceUrl?: string;

  @IsOptional()
  @IsUrl()
  quoteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

export class UpdateProductionBudgetItemDto {
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  planned?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  actual?: number;

  @IsOptional()
  @IsUrl()
  invoiceUrl?: string;

  @IsOptional()
  @IsUrl()
  quoteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

export class ProductionBudgetItemResponseDto {
  id: string;
  category: BudgetCategory;
  planned: number;
  actual: number;
  invoiceUrl?: string;
  quoteUrl?: string;
  notes?: string;
  projectId: string;
  supplierId?: string;
  ownerUid: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  project?: {
    id: string;
    name: string;
  };

  supplier?: {
    id: string;
    name: string;
    category: string;
  };
}

export class ProductionBudgetListQueryDto {
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ProductionBudgetSummaryDto {
  projectId: string;
  totalPlanned: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;

  categoryBreakdown: {
    category: BudgetCategory;
    planned: number;
    actual: number;
    variance: number;
  }[];

  supplierBreakdown: {
    supplierId: string;
    supplierName: string;
    planned: number;
    actual: number;
    itemCount: number;
  }[];
}