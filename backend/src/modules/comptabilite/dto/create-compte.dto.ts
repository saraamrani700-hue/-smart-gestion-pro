import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompteDto {
  @IsNotEmpty()
  @IsString()
  numeroCompte: string;

  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  typeCompte?: string;
}
