import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('ia_previsions')
export class IaPrevision extends BaseTenantEntity {
  @Column()
  type: string; // 'ventes'

  @Column()
  periode: string; // ex: '2026-08'

  @Column({ name: 'valeur_prevue', type: 'numeric', precision: 14, scale: 2 })
  valeurPrevue: number;

  @Column({ name: 'donnees_json', type: 'jsonb', nullable: true })
  donneesJson: Record<string, unknown>;
}
