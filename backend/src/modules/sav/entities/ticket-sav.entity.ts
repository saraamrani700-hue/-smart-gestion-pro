import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Client } from '../../clients-fournisseurs/entities/client.entity';

export enum PrioriteTicket {
  BASSE = 'basse',
  NORMALE = 'normale',
  HAUTE = 'haute',
  URGENTE = 'urgente',
}

export enum StatutTicket {
  OUVERT = 'ouvert',
  EN_COURS = 'en_cours',
  RESOLU = 'resolu',
  FERME = 'ferme',
}

@Entity('tickets_sav')
export class TicketSav extends BaseTenantEntity {
  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'produit_id', type: 'uuid', nullable: true })
  produitId: string | null;

  @Column()
  sujet: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PrioriteTicket, default: PrioriteTicket.NORMALE })
  priorite: PrioriteTicket;

  @Column({ type: 'enum', enum: StatutTicket, default: StatutTicket.OUVERT })
  statut: StatutTicket;

  @Column({ name: 'assigne_a', type: 'uuid', nullable: true })
  assigneA: string | null;
}
