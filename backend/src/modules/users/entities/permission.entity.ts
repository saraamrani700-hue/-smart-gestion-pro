import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

/**
 * Catalogue global des permissions disponibles dans le systeme.
 * Ex: "produits.create", "produits.update", "ventes.valider", "stock.ajuster"...
 * Ce n'est pas multi-tenant : la liste des permissions est la meme pour tous,
 * seule l'affectation aux roles differe par entreprise.
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // ex: 'produits.create'

  @Column()
  module: string; // ex: 'produits', 'ventes', 'stock'...

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
