import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum TypeClient {
  PARTICULIER = 'particulier',
  ENTREPRISE = 'entreprise',
}

@Entity('clients')
export class Client extends BaseTenantEntity {
  @Column({ type: 'enum', enum: TypeClient, default: TypeClient.PARTICULIER })
  type: TypeClient;

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
  solde: number; // positif = le client nous doit de l'argent

  @Column({ name: 'plafond_credit', type: 'numeric', precision: 14, scale: 2, default: 0 })
  plafondCredit: number;

  // Champ specifique au module Bibliotheque/Librairie (programme de fidelite)
  @Column({ name: 'points_fidelite', type: 'int', default: 0 })
  pointsFidelite: number;

  @Column({ default: true })
  actif: boolean;
}
