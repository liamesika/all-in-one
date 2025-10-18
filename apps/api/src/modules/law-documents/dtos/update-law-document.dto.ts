import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateLawDocumentDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  documentType?: string;
}
