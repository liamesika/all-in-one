import { IsString, IsOptional, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSearchJobDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  minRooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minSize?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSize?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}