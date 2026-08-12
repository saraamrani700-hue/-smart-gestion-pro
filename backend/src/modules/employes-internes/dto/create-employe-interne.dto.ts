import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmployeInterneDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsNotEmpty()
  @IsString()
  pin: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
