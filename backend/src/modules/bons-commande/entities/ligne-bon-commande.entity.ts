import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BonCommande } from './bon-commande.entity';
import { Produit } from '../../produits/entities/produit.entity';

@Entity('lignes_bon_commande')
export class LigneBonCommande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bon_commande_id', type: 'uuid' })
  bonCommandeId: string;

  @ManyToOne(() => BonCommande, (b) => b.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bon_commande_id' })
  bonCommande: BonCommande;

  @Column({ name: 'produit_id', type: 'uuid', nullable: true })
  produitId: string | null;

  @ManyToOne(() => Produit, { nullable: true })
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  @Column({ nullable: true })
  designation: string;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantite: number;

  @Column({ name: 'prix_unitaire_ht', type: 'numeric', precision: 14, scale: 2 })
  prixUnitaireHt: number;
}
