import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum TypeCheque {
  RECU = 'recu', // recu d'un client
  EMIS = 'emis', // emis vers un fournisseur
}

export enum StatutCheque {
  EN_ATTENTE = 'en_attente',
  ENCAISSE = 'encaisse',
  REJETE = 'rejete',
}

@Entity('cheques')
export class Cheque extends BaseTenantEntity {
  @Column({ type: 'enum', enum: TypeCheque })
  type: TypeCheque;

  @Column({ name: 'numero_cheque', nullable: true })
  numeroCheque: string;

  @Column({ nullable: true })
  banque: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  montant: number;

  @Column({ name: 'date_emission', type: 'date', nullable: true })
  dateEmission: string;

  // Date a laquelle le cheque doit etre presente a l'encaissement. Utilisee
  // pour generer des alertes (echeance proche ou depassee).
  @Column({ name: 'date_echeance', type: 'date', nullable: true })
  dateEcheance: string | null;

  @Column({ name: 'date_encaissement', type: 'date', nullable: true })
  dateEncaissement: string | null;

  @Column({ type: 'enum', enum: StatutCheque, default: StatutCheque.EN_ATTENTE })
  statut: StatutCheque;

  // Reference libre vers le client ou fournisseur concerne
  @Column({ name: 'tiers_id', type: 'uuid', nullable: true })
  tiersId: string | null;
}
