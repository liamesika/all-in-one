import { PartialType } from '@nestjs/mapped-types';
import { CreateLawEventDto } from './create-law-event.dto';

export class UpdateLawEventDto extends PartialType(CreateLawEventDto) {}
