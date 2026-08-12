import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MoyenPaiement, TypeDocumentPaiement } from '../entities/paiement.entity';

export class CreatePaiementDto {
  @IsEnum(TypeDocumentPaiement)
  documentType: TypeDocumentPaiement;

  @IsUUID()
  documentId: string;

  @IsEnum(MoyenPaiement)
  moyenPaiement: MoyenPaiement;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit etre superieur a 0' })
  montant: number;

  @IsOptional()
  @IsString()
  referenceTransaction?: string;

  @IsOptional()
  @IsString()
  carte4Derniers?: string;

  @IsOptional()
  @IsString()
  banque?: string;

  @IsOptional()
  @IsUUID()
  succursaleId?: string;
}
