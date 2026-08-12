import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DocumentCommercial } from './document-commercial.entity';
import { Produit } from '../../produits/entities/produit.entity';

@Entity('lignes_document')
export class LigneDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @ManyToOne(() => DocumentCommercial, (doc) => doc.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: DocumentCommercial;

  @Column({ name: 'produit_id', type: 'uuid', nullable: true })
  produitId: string | null;

  @ManyToOne(() => Produit, { nullable: true })
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  // Designation libre (utile pour l'Avoir ou une ligne de service sans produit precis)
  @Column({ nullable: true })
  designation: string;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantite: number;

  @Column({ name: 'prix_unitaire_ht', type: 'numeric', precision: 14, scale: 2 })
  prixUnitaireHt: number;

  @Column({ name: 'taux_tva', type: 'numeric', precision: 5, scale: 2 })
  tauxTva: number;

  @Column({ name: 'remise_pct', type: 'numeric', precision: 5, scale: 2, default: 0 })
  remisePct: number;
}
