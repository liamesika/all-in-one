import { PartialType } from '@nestjs/mapped-types';
import { CreateLawClientDto } from './create-law-client.dto';

export class UpdateLawClientDto extends PartialType(CreateLawClientDto) {}
