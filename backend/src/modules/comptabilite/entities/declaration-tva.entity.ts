import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum StatutDeclarationTva {
  BROUILLON = 'brouillon',
  DEPOSEE = 'deposee',
}

@Entity('declarations_tva')
export class DeclarationTva extends BaseTenantEntity {
  @Column()
  periode: string; // ex: '2026-T3' ou '2026-07'

  @Column({ name: 'tva_collectee', type: 'numeric', precision: 14, scale: 2, default: 0 })
  tvaCollectee: number;

  @Column({ name: 'tva_deductible', type: 'numeric', precision: 14, scale: 2, default: 0 })
  tvaDeductible: number;

  @Column({ name: 'tva_a_payer', type: 'numeric', precision: 14, scale: 2, default: 0 })
  tvaAPayer: number;

  @Column({ type: 'enum', enum: StatutDeclarationTva, default: StatutDeclarationTva.BROUILLON })
  statut: StatutDeclarationTva;
}
