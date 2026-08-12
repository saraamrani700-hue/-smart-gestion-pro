import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

/**
 * Collaborateur interne au module Bibliotheque, identifie par un code PIN
 * (utilise pour le changement rapide de caissier), distinct des vrais
 * comptes Smart Gestion Pro (email/mot de passe, JWT) qui restent l'unique
 * barriere de securite reelle pour acceder au site. Ce PIN n'est qu'une
 * commodite d'identification a l'interieur de l'appli une fois deja connecte.
 */
@Entity('employes_internes')
export class EmployeInterne extends BaseTenantEntity {
  @Column()
  nom: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  role: string;

  @Column()
  pin: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];
}
