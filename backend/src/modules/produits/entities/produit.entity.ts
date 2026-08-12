import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Categorie } from './categorie.entity';
import { UniteMesure } from './unite-mesure.entity';

export enum TypeProduit {
  PRODUIT = 'produit',
  SERVICE = 'service',
}

@Entity('produits')
@Index(['entrepriseId', 'codeBarre'])
export class Produit extends BaseTenantEntity {
  @Column({ name: 'categorie_id', type: 'uuid', nullable: true })
  categorieId: string | null;

  @ManyToOne(() => Categorie, { nullable: true })
  @JoinColumn({ name: 'categorie_id' })
  categorie: Categorie;

  @Column({ name: 'unite_id', type: 'uuid', nullable: true })
  uniteId: string | null;

  @ManyToOne(() => UniteMesure, { nullable: true })
  @JoinColumn({ name: 'unite_id' })
  unite: UniteMesure;

  @Column({ type: 'enum', enum: TypeProduit, default: TypeProduit.PRODUIT })
  type: TypeProduit;

  @Column({ nullable: true })
  reference: string;

  @Column({ name: 'code_barre', nullable: true })
  codeBarre: string;

  @Column()
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'prix_achat_ht', type: 'numeric', precision: 14, scale: 2, default: 0 })
  prixAchatHt: number;

  @Column({ name: 'prix_vente_ht', type: 'numeric', precision: 14, scale: 2, default: 0 })
  prixVenteHt: number;

  @Column({ name: 'taux_tva', type: 'numeric', precision: 5, scale: 2, default: 20 })
  tauxTva: number;

  @Column({ name: 'seuil_alerte', type: 'numeric', precision: 14, scale: 3, default: 0 })
  seuilAlerte: number;

  @Column({ name: 'gere_stock', default: true })
  gereStock: boolean;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  // Champs specifiques au module Bibliotheque/Librairie (marque, rayon,
  // date d'expiration) — non utilises par les autres modules de vente.
  @Column({ type: 'varchar', nullable: true })
  marque: string | null;

  @Column({ type: 'varchar', nullable: true })
  rayon: string | null;

  @Column({ name: 'date_expiration', type: 'date', nullable: true })
  dateExpiration: string | null;

  @Column({ default: true })
  actif: boolean;
}
