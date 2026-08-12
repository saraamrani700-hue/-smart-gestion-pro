import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Fournisseur } from '../../clients-fournisseurs/entities/fournisseur.entity';
import { Succursale } from '../../entreprises/entities/succursale.entity';
import { LigneAchat } from './ligne-achat.entity';

export enum StatutAchat {
  BROUILLON = 'brouillon',
  VALIDEE = 'validee',
  PAYEE = 'payee',
  ANNULEE = 'annulee',
}

@Entity('achats')
export class Achat extends BaseTenantEntity {
  @Column({ name: 'succursale_id', type: 'uuid' })
  succursaleId: string;

  @ManyToOne(() => Succursale)
  @JoinColumn({ name: 'succursale_id' })
  succursale: Succursale;

  @Column({ name: 'fournisseur_id', type: 'uuid', nullable: true })
  fournisseurId: string | null;

  @ManyToOne(() => Fournisseur, { nullable: true })
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column()
  numero: string;

  @Column({ type: 'enum', enum: StatutAchat, default: StatutAchat.BROUILLON })
  statut: StatutAchat;

  @Column({ name: 'total_ht', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalHt: number;

  @Column({ name: 'total_tva', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTva: number;

  @Column({ name: 'total_ttc', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTtc: number;

  @OneToMany(() => LigneAchat, (ligne) => ligne.achat, { cascade: true })
  lignes: LigneAchat[];
}
