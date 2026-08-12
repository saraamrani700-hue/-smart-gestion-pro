import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TypeProduit } from '../entities/produit.entity';

export class CreateProduitDto {
  @IsOptional()
  @IsUUID()
  categorieId?: string;

  @IsOptional()
  @IsUUID()
  uniteId?: string;

  @IsOptional()
  @IsEnum(TypeProduit)
  type?: TypeProduit;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  codeBarre?: string;

  @IsNotEmpty({ message: 'Le nom du produit est requis' })
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixAchatHt?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixVenteHt?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tauxTva?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seuilAlerte?: number;

  @IsOptional()
  @IsBoolean()
  gereStock?: boolean;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  rayon?: string;

  @IsOptional()
  @IsString()
  dateExpiration?: string;
}
