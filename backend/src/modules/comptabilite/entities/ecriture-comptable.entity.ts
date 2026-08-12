import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { CompteComptable } from './compte-comptable.entity';

@Entity('ecritures_comptables')
export class EcritureComptable extends BaseTenantEntity {
  @Column({ name: 'compte_id', type: 'uuid' })
  compteId: string;

  @ManyToOne(() => CompteComptable)
  @JoinColumn({ name: 'compte_id' })
  compte: CompteComptable;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  credit: number;

  @Column({ name: 'date_ecriture', type: 'date' })
  dateEcriture: string;

  @Column({ type: 'text', nullable: true })
  libelle: string;
}
