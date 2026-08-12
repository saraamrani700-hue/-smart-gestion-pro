import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TypeCheque } from '../entities/cheque.entity';

export class CreateChequeDto {
  @IsEnum(TypeCheque)
  type: TypeCheque;

  @IsOptional()
  @IsString()
  numeroCheque?: string;

  @IsOptional()
  @IsString()
  banque?: string;

  @IsNumber()
  @Min(0.01)
  montant: number;

  @IsOptional()
  @IsDateString()
  dateEmission?: string;

  @IsOptional()
  @IsDateString()
  dateEcheance?: string;

  @IsOptional()
  @IsUUID()
  tiersId?: string;
}
