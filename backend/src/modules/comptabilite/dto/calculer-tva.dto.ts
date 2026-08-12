import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CalculerTvaDto {
  @IsNotEmpty()
  @IsString()
  periode: string; // libelle libre, ex: '2026-T3'

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}
