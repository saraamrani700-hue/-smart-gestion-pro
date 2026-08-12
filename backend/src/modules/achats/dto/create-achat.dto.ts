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

export class LigneAchatDto {
  @IsUUID()
  produitId: string;

  @IsNumber()
  @Min(0.001)
  quantite: number;

  @IsNumber()
  @Min(0)
  prixUnitaireHt: number;

  @IsNumber()
  @Min(0)
  tauxTva: number;
}

export class CreateAchatDto {
  @IsUUID()
  succursaleId: string;

  @IsOptional()
  @IsUUID()
  fournisseurId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: "L'achat doit contenir au moins une ligne" })
  @ValidateNested({ each: true })
  @Type(() => LigneAchatDto)
  lignes: LigneAchatDto[];
}
