import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TypeMouvementStock } from '../entities/mouvement-stock.entity';

export class AjusterStockDto {
  @IsUUID()
  produitId: string;

  @IsUUID()
  succursaleId: string;

  @IsEnum(TypeMouvementStock)
  type: TypeMouvementStock;

  @IsNotEmpty()
  @IsNumber()
  quantite: number; // toujours positive; le sens (+/-) depend de "type"

  @IsOptional()
  @IsString()
  referenceDoc?: string;

  @IsOptional()
  @IsString()
  motif?: string;
}
