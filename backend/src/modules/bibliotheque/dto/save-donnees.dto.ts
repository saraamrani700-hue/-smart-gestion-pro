import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveDonneesDto {
  @IsNotEmpty()
  @IsString()
  donnees: string;

  // Version chargee par le client au moment ou il a recupere ses donnees.
  // Absente = premiere sauvegarde (aucune version existante encore).
  @IsOptional()
  @IsInt()
  version?: number;
}
