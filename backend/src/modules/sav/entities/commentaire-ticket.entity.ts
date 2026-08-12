import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TicketSav } from './ticket-sav.entity';

@Entity('commentaires_ticket')
export class CommentaireTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => TicketSav, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: TicketSav;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
