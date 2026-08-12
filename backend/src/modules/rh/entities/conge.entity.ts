import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Employe } from './employe.entity';

export enum TypeConge {
  PAYE = 'paye',
  MALADIE = 'maladie',
  SANS_SOLDE = 'sans_solde',
  AUTRE = 'autre',
}

export enum StatutConge {
  EN_ATTENTE = 'en_attente',
  APPROUVE = 'approuve',
  REFUSE = 'refuse',
}

@Entity('conges')
export class Conge extends BaseTenantEntity {
  @Column({ name: 'employe_id', type: 'uuid' })
  employeId: string;

  @ManyToOne(() => Employe)
  @JoinColumn({ name: 'employe_id' })
  employe: Employe;

  @Column({ type: 'enum', enum: TypeConge, default: TypeConge.PAYE })
  type: TypeConge;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: string;

  @Column({ name: 'date_fin', type: 'date' })
  dateFin: string;

  @Column({ type: 'enum', enum: StatutConge, default: StatutConge.EN_ATTENTE })
  statut: StatutConge;

  @Column({ type: 'text', nullable: true })
  motif: string;
}
