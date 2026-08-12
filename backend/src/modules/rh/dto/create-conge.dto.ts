import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TypeConge } from '../entities/conge.entity';

export class CreateCongeDto {
  @IsUUID()
  employeId: string;

  @IsEnum(TypeConge)
  type: TypeConge;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;

  @IsOptional()
  @IsString()
  motif?: string;
}
