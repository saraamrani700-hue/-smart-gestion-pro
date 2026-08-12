import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PrevoirVentesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  nombreMoisHistorique?: number; // combien de mois passes analyser (defaut 6)
}
