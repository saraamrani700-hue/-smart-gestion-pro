import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('plan_comptable')
export class CompteComptable extends BaseTenantEntity {
  @Column({ name: 'numero_compte' })
  numeroCompte: string;

  @Column()
  libelle: string;

  @Column({ name: 'type_compte', nullable: true })
  typeCompte: string; // actif / passif / charge / produit
}
