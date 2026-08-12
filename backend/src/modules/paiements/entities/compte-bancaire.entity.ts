import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('comptes_bancaires')
export class CompteBancaire extends BaseTenantEntity {
  @Column()
  banque: string;

  @Column({ nullable: true })
  rib: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  solde: number;
}
