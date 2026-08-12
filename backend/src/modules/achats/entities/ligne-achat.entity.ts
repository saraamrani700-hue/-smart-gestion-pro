import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Achat } from './achat.entity';
import { Produit } from '../../produits/entities/produit.entity';

@Entity('lignes_achat')
export class LigneAchat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'achat_id', type: 'uuid' })
  achatId: string;

  @ManyToOne(() => Achat, (achat) => achat.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achat_id' })
  achat: Achat;

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
}
