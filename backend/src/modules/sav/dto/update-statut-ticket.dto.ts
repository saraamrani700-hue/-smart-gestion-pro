import { IsEnum } from 'class-validator';
import { StatutTicket } from '../entities/ticket-sav.entity';

export class UpdateStatutTicketDto {
  @IsEnum(StatutTicket)
  statut: StatutTicket;
}
