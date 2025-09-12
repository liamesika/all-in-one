import { PartialType } from '@nestjs/mapped-types';
import { CreateRealEstateLeadDto } from './create-real-estate-lead.dto';

export class UpdateRealEstateLeadDto extends PartialType(CreateRealEstateLeadDto) {}