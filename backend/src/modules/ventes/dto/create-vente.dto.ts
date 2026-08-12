import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class LigneVenteDto {
  @IsUUID()
  produitId: string;

  @IsNumber()
  @Min(0.001, { message: 'La quantite doit etre superieure a 0' })
  quantite: number;

  @IsNumber()
  @Min(0)
  prixUnitaireHt: number;

  @IsNumber()
  @Min(0)
  tauxTva: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remisePct?: number;
}

export class CreateVenteDto {
  @IsUUID()
  succursaleId: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'La vente doit contenir au moins une ligne' })
  @ValidateNested({ each: true })
  @Type(() => LigneVenteDto)
  lignes: LigneVenteDto[];
}
