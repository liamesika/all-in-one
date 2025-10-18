import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateLawDocumentDto {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  caseId?: string;
}
