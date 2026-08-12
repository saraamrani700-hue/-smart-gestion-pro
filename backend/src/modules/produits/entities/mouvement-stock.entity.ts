import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Produit } from './produit.entity';
import { Succursale } from '../../entreprises/entities/succursale.entity';

export enum TypeMouvementStock {
  ENTREE = 'entree',
  SORTIE = 'sortie',
  TRANSFERT = 'transfert',
  AJUSTEMENT = 'ajustement',
  INVENTAIRE = 'inventaire',
}

/**
 * Chaque changement de quantite en stock passe par ici (traçabilite complete,
 * cf. Article 1 - Securite & Audit). Ne jamais modifier "stocks.quantite"
 * directement sans creer un mouvement correspondant.
 */
@Entity('mouvements_stock')
export class MouvementStock extends BaseTenantEntity {
  @Column({ name: 'succursale_id', type: 'uuid' })
  succursaleId: string;

  @ManyToOne(() => Succursale)
  @JoinColumn({ name: 'succursale_id' })
  succursale: Succursale;

  @Column({ name: 'produit_id', type: 'uuid' })
  produitId: string;

  @ManyToOne(() => Produit)
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  @Column({ type: 'enum', enum: TypeMouvementStock })
  type: TypeMouvementStock;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantite: number;

  @Column({ name: 'quantite_avant', type: 'numeric', precision: 14, scale: 3, nullable: true })
  quantiteAvant: number;

  @Column({ name: 'quantite_apres', type: 'numeric', precision: 14, scale: 3, nullable: true })
  quantiteApres: number;

  @Column({ name: 'reference_doc', nullable: true })
  referenceDoc: string;

  @Column({ type: 'text', nullable: true })
  motif: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;
}
