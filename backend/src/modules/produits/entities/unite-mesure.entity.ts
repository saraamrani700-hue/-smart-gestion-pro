import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('unites_mesure')
export class UniteMesure extends BaseTenantEntity {
  @Column()
  nom: string; // ex: Kilogramme

  @Column()
  symbole: string; // ex: kg
}
