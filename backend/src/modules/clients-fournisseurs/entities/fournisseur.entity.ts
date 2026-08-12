import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('fournisseurs')
export class Fournisseur extends BaseTenantEntity {
  @Column()
  nom: string;

  @Column({ nullable: true })
  ice: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  solde: number; // positif = nous devons de l'argent au fournisseur

  @Column({ default: true })
  actif: boolean;
}
