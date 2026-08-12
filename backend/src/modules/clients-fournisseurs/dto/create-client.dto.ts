import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TypeClient } from '../entities/client.entity';

export class CreateClientDto {
  @IsOptional()
  @IsEnum(TypeClient)
  type?: TypeClient;

  @IsNotEmpty({ message: 'Le nom du client est requis' })
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  plafondCredit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsFidelite?: number;
}
