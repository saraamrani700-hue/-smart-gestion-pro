import { IsNumber, IsOptional } from 'class-validator';

export class CreateCalculZakatDto {
  @IsOptional()
  @IsNumber()
  valeurStock?: number;

  @IsOptional()
  @IsNumber()
  valeurCaisse?: number;

  @IsOptional()
  @IsNumber()
  creancesClients?: number;

  @IsOptional()
  @IsNumber()
  dettesFournisseurs?: number;

  @IsOptional()
  @IsNumber()
  baseZakatable?: number;

  @IsOptional()
  @IsNumber()
  nisab?: number;

  @IsOptional()
  @IsNumber()
  taux?: number;

  @IsOptional()
  @IsNumber()
  zakatDue?: number;
}
