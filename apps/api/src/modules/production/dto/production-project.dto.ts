import { IsString, IsOptional, IsEnum, IsDateString, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Enums based on Prisma schema
export enum ProjectType {
  CONFERENCE = 'CONFERENCE',
  SHOW = 'SHOW',
  FILMING = 'FILMING',
  OTHER = 'OTHER'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  DONE = 'DONE',
  ON_HOLD = 'ON_HOLD'
}

export class CreateProductionProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType = ProjectType.OTHER;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus = ProjectStatus.PLANNING;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateProductionProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ProductionProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  ownerUid: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;

  // Aggregated data (computed fields)
  taskCount?: number;
  completedTasks?: number;
  budgetTotal?: number;
  actualSpent?: number;
  fileCount?: number;
  supplierCount?: number;
}

export class ProductionProjectListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

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