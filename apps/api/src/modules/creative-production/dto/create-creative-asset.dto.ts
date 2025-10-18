// apps/api/src/modules/creative-production/dto/create-creative-asset.dto.ts
import { IsString, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';
import { CreativeAssetType } from '@prisma/client';

export class CreateCreativeAssetDto {
  @IsString()
  title: string;

  @IsEnum(CreativeAssetType)
  type: CreativeAssetType;

  @IsString()
  storageUrl: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  version?: number;
}

export class UpdateCreativeAssetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
