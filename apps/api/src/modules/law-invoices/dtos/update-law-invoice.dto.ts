import { PartialType } from '@nestjs/mapped-types';
import { CreateLawInvoiceDto } from './create-law-invoice.dto';

export class UpdateLawInvoiceDto extends PartialType(CreateLawInvoiceDto) {}
