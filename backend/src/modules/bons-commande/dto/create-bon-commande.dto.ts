import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class LigneBonCommandeDto {
  @IsOptional()
  @IsUUID()
  produitId?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsNumber()
  @Min(0.001)
  quantite: number;

  @IsNumber()
  @Min(0)
  prixUnitaireHt: number;
}

export class CreateBonCommandeDto {
  @IsOptional()
  @IsUUID()
  fournisseurId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigneBonCommandeDto)
  lignes: LigneBonCommandeDto[];
}
