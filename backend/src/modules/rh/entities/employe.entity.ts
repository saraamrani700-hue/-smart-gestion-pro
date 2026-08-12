import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('employes')
export class Employe extends BaseTenantEntity {
  // Reference optionnelle vers le compte de connexion (users), si l'employe
  // a aussi acces au systeme.
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'nom_complet' })
  nomComplet: string;

  @Column({ nullable: true })
  poste: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'date_embauche', type: 'date', nullable: true })
  dateEmbauche: string | null;

  @Column({ name: 'salaire_base', type: 'numeric', precision: 14, scale: 2, default: 0 })
  salaireBase: number;

  @Column({ default: true })
  actif: boolean;
}
