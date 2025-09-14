// apps/api/src/modules/real-estate-properties/dtos/update-property.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}