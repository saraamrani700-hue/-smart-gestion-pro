import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Client } from '../../clients-fournisseurs/entities/client.entity';
import { LigneDocument } from './ligne-document.entity';

export enum TypeDocumentCommercial {
  DEVIS = 'devis',
  PROFORMA = 'proforma',
  BON_LIVRAISON = 'bon_livraison',
  FACTURE = 'facture',
  AVOIR = 'avoir',
}

export enum StatutDocumentCommercial {
  BROUILLON = 'brouillon',
  ENVOYE = 'envoye',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  CONVERTI = 'converti', // ex: un devis converti en facture
  ANNULE = 'annule',
}

/**
 * Documents commerciaux "papier" : Devis, Proforma, Bon de Livraison, Facture,
 * Avoir. Ce module NE touche PAS le stock (ca c'est le role du module Ventes).
 * Une Facture peut etre generee a partir d'une Vente deja validee (le stock
 * a deja ete decremente a ce moment-la) via VentesService, ou creee de facon
 * autonome pour de la facturation de services.
 */
@Entity('documents_commerciaux')
export class DocumentCommercial extends BaseTenantEntity {
  @Column({ type: 'enum', enum: TypeDocumentCommercial })
  type: TypeDocumentCommercial;

  @Column()
  numero: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  // Reference vers le document a partir duquel celui-ci a ete genere
  // (devis -> facture, facture -> avoir...)
  @Column({ name: 'document_origine_id', type: 'uuid', nullable: true })
  documentOrigineId: string | null;

  // Reference optionnelle vers la Vente qui a decremente le stock
  @Column({ name: 'vente_id', type: 'uuid', nullable: true })
  venteId: string | null;

  @Column({
    type: 'enum',
    enum: StatutDocumentCommercial,
    default: StatutDocumentCommercial.BROUILLON,
  })
  statut: StatutDocumentCommercial;

  @Column({ name: 'total_ht', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalHt: number;

  @Column({ name: 'total_tva', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTva: number;

  @Column({ name: 'total_ttc', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTtc: number;

  @Column({ name: 'date_document', type: 'date' })
  dateDocument: string;

  @Column({ name: 'date_echeance', type: 'date', nullable: true })
  dateEcheance: string | null;

  @OneToMany(() => LigneDocument, (ligne) => ligne.document, { cascade: true })
  lignes: LigneDocument[];
}
