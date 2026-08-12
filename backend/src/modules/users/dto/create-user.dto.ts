import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString()
  nomComplet: string;

  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  motDePasse: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsUUID()
  succursaleId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;
}
