import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Employe } from './employe.entity';

@Entity('fiches_paie')
export class FichePaie extends BaseTenantEntity {
  @Column({ name: 'employe_id', type: 'uuid' })
  employeId: string;

  @ManyToOne(() => Employe)
  @JoinColumn({ name: 'employe_id' })
  employe: Employe;

  @Column()
  periode: string; // ex: '2026-07'

  @Column({ name: 'salaire_base', type: 'numeric', precision: 14, scale: 2 })
  salaireBase: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  primes: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  deductions: number; // CNSS, AMO, IR... (calcul simplifie, pas une simulation fiscale complete)

  @Column({ name: 'salaire_net', type: 'numeric', precision: 14, scale: 2 })
  salaireNet: number;
}
