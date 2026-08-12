import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('rappels_fiscaux')
export class RappelFiscal extends BaseTenantEntity {
  @Column()
  libelle: string;

  @Column({ name: 'date_echeance', type: 'date' })
  dateEcheance: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  termine: boolean;
}
