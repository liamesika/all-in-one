import { IsEmail, IsString, IsEnum, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';

export enum Vertical {
  REAL_ESTATE = 'REAL_ESTATE',
  LAW = 'LAW',
  E_COMMERCE = 'E_COMMERCE',
}

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(80, { message: 'Full name must not exceed 80 characters' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @IsEnum(Vertical, { message: 'Invalid vertical. Must be one of: REAL_ESTATE, LAW, E_COMMERCE' })
  vertical: Vertical;

  @IsBoolean({ message: 'Terms consent is required' })
  termsConsent: boolean;

  @IsString()
  @IsEnum(['en', 'he'], { message: 'Language must be either "en" or "he"' })
  lang?: string;
}

export class RegisterResponseDto {
  redirectPath: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    defaultVertical: Vertical;
  };
}