import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateEmployeDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  nomComplet: string;

  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaireBase?: number;
}
