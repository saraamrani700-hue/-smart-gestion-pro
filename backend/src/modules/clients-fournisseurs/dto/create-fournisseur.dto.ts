import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFournisseurDto {
  @IsNotEmpty({ message: 'Le nom du fournisseur est requis' })
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  ice?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  adresse?: string;
}
