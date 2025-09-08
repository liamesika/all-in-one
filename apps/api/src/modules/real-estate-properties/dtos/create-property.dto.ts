// apps/api/src/modules/real-estate-properties/dtos/create-property.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsUrl } from 'class-validator';
import { PropertyStatus, PropertyType } from './enums';

export class CreatePropertyDto {
  // NOTE: בפרונט קיים name כטייטל. משאירים name כדי לא לשבור את ה-UI הנוכחי.
  @IsString()
  @IsNotEmpty()
  name!: string; // acts as "title"

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus; // <-- היה string, מתוקן ל-Enum

  @IsNumber()
  @IsOptional()
  rooms?: number;

  @IsNumber()
  @IsOptional()
  size?: number; // sqm

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  agentName?: string;

  @IsString()
  @IsOptional()
  agentPhone?: string;

  // תמונות (URLs) — אופציונלי למינימום ה-MVP
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  photos?: string[];
}
