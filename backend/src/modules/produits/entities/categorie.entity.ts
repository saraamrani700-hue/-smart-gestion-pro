import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('categories_produits')
export class Categorie extends BaseTenantEntity {
  @Column()
  nom: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Categorie, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Categorie;
}
