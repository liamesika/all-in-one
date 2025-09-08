// apps/api/src/modules/real-estate-properties/dtos/update-property.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PropertyStatus } from './enums';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsString()
  slug?: string;
}
