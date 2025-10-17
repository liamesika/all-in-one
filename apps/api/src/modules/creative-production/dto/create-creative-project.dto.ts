// apps/api/src/modules/creative-production/dto/create-creative-project.dto.ts
import { IsString, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';
import { CreativeProjectStatus } from '@prisma/client';

export class CreateCreativeProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @IsOptional()
  @IsEnum(CreativeProjectStatus)
  status?: CreativeProjectStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateCreativeProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true})
  channels?: string[];

  @IsOptional()
  @IsEnum(CreativeProjectStatus)
  status?: CreativeProjectStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
