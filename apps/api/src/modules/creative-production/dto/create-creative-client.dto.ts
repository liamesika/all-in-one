import { IsString, IsOptional, IsArray, IsNotEmpty, ArrayMinSize, IsEmail } from 'class-validator';

export class CreateCreativeClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  phones: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
