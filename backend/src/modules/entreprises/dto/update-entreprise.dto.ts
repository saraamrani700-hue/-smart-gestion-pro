import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateEntrepriseDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  ice?: string;

  @IsOptional()
  @IsString()
  ifFiscal?: string;

  @IsOptional()
  @IsString()
  rc?: string;

  @IsOptional()
  @IsString()
  patente?: string;

  @IsOptional()
  @IsString()
  cnss?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  devise?: string;
}
