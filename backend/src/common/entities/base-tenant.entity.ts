import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Classe de base pour toutes les entites "metier" du systeme.
 * Toute table qui herite de cette classe est automatiquement multi-tenant :
 * chaque enregistrement appartient a une seule entreprise (isolation totale
 * des donnees entre societes, cf. Article 1 - point 9 "Multi-tenant").
 */
export abstract class BaseTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entreprise_id', type: 'uuid' })
  entrepriseId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
