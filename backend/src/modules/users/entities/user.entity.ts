import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Role } from './role.entity';
import { Succursale } from '../../entreprises/entities/succursale.entity';

@Entity('users')
export class User extends BaseTenantEntity {
  @Column({ name: 'succursale_id', type: 'uuid', nullable: true })
  succursaleId: string | null;

  @ManyToOne(() => Succursale, { nullable: true })
  @JoinColumn({ name: 'succursale_id' })
  succursale: Succursale;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string | null;

  @ManyToOne(() => Role, { eager: true, nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'nom_complet' })
  nomComplet: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'mot_de_passe' })
  motDePasse: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'deux_fa_active', default: false })
  deuxFaActive: boolean;

  @Column({ name: 'derniere_connexion', type: 'timestamptz', nullable: true })
  derniereConnexion: Date | null;
}
