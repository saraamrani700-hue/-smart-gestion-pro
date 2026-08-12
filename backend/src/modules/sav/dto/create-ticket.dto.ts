import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PrioriteTicket } from '../entities/ticket-sav.entity';

export class CreateTicketDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  produitId?: string;

  @IsNotEmpty()
  @IsString()
  sujet: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PrioriteTicket)
  priorite?: PrioriteTicket;
}
