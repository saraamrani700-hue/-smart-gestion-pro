import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum CategorieDepense {
  PROFESSIONNELLE = 'Professionnelle',
  PERSONNELLE = 'Personnelle',
}

@Entity('depenses')
export class Depense extends BaseTenantEntity {
  @Column()
  titre: string;

  @Column({ type: 'enum', enum: CategorieDepense, default: CategorieDepense.PROFESSIONNELLE })
  categorie: CategorieDepense;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  montant: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'date_depense', type: 'timestamptz', default: () => 'now()' })
  dateDepense: Date;
}
