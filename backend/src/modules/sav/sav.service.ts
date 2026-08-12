import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketSav, StatutTicket } from './entities/ticket-sav.entity';
import { CommentaireTicket } from './entities/commentaire-ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class SavService {
  constructor(
    @InjectRepository(TicketSav)
    private ticketsRepository: Repository<TicketSav>,
    @InjectRepository(CommentaireTicket)
    private commentairesRepository: Repository<CommentaireTicket>,
  ) {}

  createTicket(entrepriseId: string, dto: CreateTicketDto): Promise<TicketSav> {
    const ticket = this.ticketsRepository.create({ entrepriseId, ...dto });
    return this.ticketsRepository.save(ticket);
  }

  findAllTickets(entrepriseId: string, statut?: StatutTicket): Promise<TicketSav[]> {
    return this.ticketsRepository.find({
      where: statut ? { entrepriseId, statut } : { entrepriseId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneTicket(id: string, entrepriseId: string): Promise<TicketSav> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, entrepriseId },
      relations: ['client'],
    });
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return ticket;
  }

  async updateStatut(id: string, entrepriseId: string, statut: StatutTicket): Promise<TicketSav> {
    const ticket = await this.findOneTicket(id, entrepriseId);
    ticket.statut = statut;
    return this.ticketsRepository.save(ticket);
  }

  async assigner(id: string, entrepriseId: string, userId: string): Promise<TicketSav> {
    const ticket = await this.findOneTicket(id, entrepriseId);
    ticket.assigneA = userId;
    ticket.statut = StatutTicket.EN_COURS;
    return this.ticketsRepository.save(ticket);
  }

  async ajouterCommentaire(
    ticketId: string,
    entrepriseId: string,
    userId: string,
    message: string,
  ): Promise<CommentaireTicket> {
    await this.findOneTicket(ticketId, entrepriseId); // valide l'appartenance
    const commentaire = this.commentairesRepository.create({ ticketId, userId, message });
    return this.commentairesRepository.save(commentaire);
  }

  getCommentaires(ticketId: string): Promise<CommentaireTicket[]> {
    return this.commentairesRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }
}
