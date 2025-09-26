import { IsString, IsOptional, IsEnum, IsObject, IsNumber, Min, Max, MinLength, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

// Enums based on Prisma schema
export enum SupplierCategory {
  STAGE = 'STAGE',
  LIGHTING = 'LIGHTING',
  AUDIO = 'AUDIO',
  CATERING = 'CATERING',
  VENUE = 'VENUE',
  OTHER = 'OTHER'
}

export class ContactInfoDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class CreateProductionSupplierDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEnum(SupplierCategory)
  category: SupplierCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  priceNotes?: string;

  @IsOptional()
  @IsObject()
  contactInfo?: ContactInfoDto;
}

export class UpdateProductionSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  priceNotes?: string;

  @IsOptional()
  @IsObject()
  contactInfo?: ContactInfoDto;
}

export class ProductionSupplierResponseDto {
  id: string;
  name: string;
  category: SupplierCategory;
  rating?: number;
  notes?: string;
  priceNotes?: string;
  contactInfo?: ContactInfoDto;
  ownerUid: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Aggregated data (computed fields)
  projectCount?: number;
  budgetItemCount?: number;
  totalBudgetValue?: number;
}

export class ProductionSupplierListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

// Production Project Supplier relationship DTOs
export class CreateProductionProjectSupplierDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string; // e.g. "Stage provider", "Catering lead"
}

export class UpdateProductionProjectSupplierDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;
}

export class ProductionProjectSupplierResponseDto {
  id: string;
  role?: string;
  projectId: string;
  supplierId: string;
  ownerUid: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  project?: {
    id: string;
    name: string;
    status: string;
  };

  supplier?: {
    id: string;
    name: string;
    category: SupplierCategory;
    rating?: number;
    contactInfo?: ContactInfoDto;
  };
}