import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRappelFiscalDto {
  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsNotEmpty()
  @IsString()
  dateEcheance: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRappelFiscalDto {
  @IsOptional()
  @IsBoolean()
  termine?: boolean;
}
