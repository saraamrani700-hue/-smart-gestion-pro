import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vente } from './vente.entity';
import { Produit } from '../../produits/entities/produit.entity';

@Entity('lignes_vente')
export class LigneVente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vente_id', type: 'uuid' })
  venteId: string;

  @ManyToOne(() => Vente, (vente) => vente.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vente_id' })
  vente: Vente;

  @Column({ name: 'produit_id', type: 'uuid' })
  produitId: string;

  @ManyToOne(() => Produit)
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantite: number;

  @Column({ name: 'prix_unitaire_ht', type: 'numeric', precision: 14, scale: 2 })
  prixUnitaireHt: number;

  @Column({ name: 'taux_tva', type: 'numeric', precision: 5, scale: 2 })
  tauxTva: number;

  @Column({ name: 'remise_pct', type: 'numeric', precision: 5, scale: 2, default: 0 })
  remisePct: number;
}
