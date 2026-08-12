import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CategorieDepense } from '../entities/depense.entity';

export class CreateDepenseDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsEnum(CategorieDepense)
  categorie?: CategorieDepense;

  @IsNumber()
  @Min(0.01)
  montant: number;

  @IsOptional()
  @IsString()
  note?: string;
}
