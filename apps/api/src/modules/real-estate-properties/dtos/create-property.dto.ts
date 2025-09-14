// apps/api/src/modules/real-estate-properties/dtos/create-property.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsUrl } from 'class-validator';
import { PropertyStatus, PropertyType } from './enums';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @IsNumber()
  @IsOptional()
  rooms?: number; // will be mapped to bedrooms in the service

  @IsNumber()  
  @IsOptional()
  size?: number; // will be mapped to areaSqm in the service

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  areaSqm?: number;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  amenities?: string;

  @IsString()
  @IsOptional()
  agentName?: string;

  @IsString()
  @IsOptional()
  agentPhone?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  // Photos as URLs for the photos array
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  photos?: string[];
}
