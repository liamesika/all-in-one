import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, Min, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Enums based on Prisma schema
export enum FileFolder {
  PERMITS = 'PERMITS',
  SAFETY = 'SAFETY',
  DESIGNS = 'DESIGNS',
  CONTRACTS = 'CONTRACTS',
  OTHER = 'OTHER'
}

export class CreateProductionFileAssetDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEnum(FileFolder)
  folder: FileFolder;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsUUID()
  projectId: string;
}

export class UpdateProductionFileAssetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(FileFolder)
  folder?: FileFolder;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ProductionFileAssetResponseDto {
  id: string;
  name: string;
  folder: FileFolder;
  url: string;
  version: number;
  notes?: string;
  mimeType?: string;
  size?: number;
  projectId: string;
  ownerUid: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  creator?: {
    id: string;
    fullName: string;
    email: string;
  };

  project?: {
    id: string;
    name: string;
  };
}

export class ProductionFileAssetListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FileFolder)
  folder?: FileFolder;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;

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

export class FileUploadResponseDto {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  folder: FileFolder;
  projectId: string;
  message: string;
}

export class BulkFileUploadResponseDto {
  uploaded: FileUploadResponseDto[];
  failed: {
    fileName: string;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}