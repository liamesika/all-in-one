// apps/api/src/modules/creative-production/dto/create-render.dto.ts
import { IsString, IsEnum, IsObject, IsOptional, IsNumber } from 'class-validator';
import { CreativeRenderFormat } from '@prisma/client';

export class CreateRenderDto {
  @IsString()
  projectId: string;

  @IsEnum(CreativeRenderFormat)
  format: CreativeRenderFormat;

  @IsObject()
  spec: {
    width?: number;
    height?: number;
    bitrate?: number;
    fps?: number;
    format?: string;
  };

  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateRenderDto {
  @IsOptional()
  @IsEnum(CreativeRenderFormat)
  format?: CreativeRenderFormat;

  @IsOptional()
  @IsObject()
  spec?: Record<string, any>;
}
