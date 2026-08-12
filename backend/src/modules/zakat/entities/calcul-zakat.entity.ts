import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('calculs_zakat')
export class CalculZakat extends BaseTenantEntity {
  @Column({ name: 'valeur_stock', type: 'numeric', precision: 14, scale: 2, default: 0 })
  valeurStock: number;

  @Column({ name: 'valeur_caisse', type: 'numeric', precision: 14, scale: 2, default: 0 })
  valeurCaisse: number;

  @Column({ name: 'creances_clients', type: 'numeric', precision: 14, scale: 2, default: 0 })
  creancesClients: number;

  @Column({ name: 'dettes_fournisseurs', type: 'numeric', precision: 14, scale: 2, default: 0 })
  dettesFournisseurs: number;

  @Column({ name: 'base_zakatable', type: 'numeric', precision: 14, scale: 2, default: 0 })
  baseZakatable: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  nisab: number;

  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.025 })
  taux: number;

  @Column({ name: 'zakat_due', type: 'numeric', precision: 14, scale: 2, default: 0 })
  zakatDue: number;
}
