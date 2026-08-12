import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TypeDocumentCommercial } from '../entities/document-commercial.entity';

export class LigneDocumentDto {
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

  @IsNumber()
  @Min(0)
  tauxTva: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remisePct?: number;
}

export class CreateDocumentDto {
  @IsEnum(TypeDocumentCommercial)
  type: TypeDocumentCommercial;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  documentOrigineId?: string;

  @IsOptional()
  @IsDateString()
  dateEcheance?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Le document doit contenir au moins une ligne' })
  @ValidateNested({ each: true })
  @Type(() => LigneDocumentDto)
  lignes: LigneDocumentDto[];
}
