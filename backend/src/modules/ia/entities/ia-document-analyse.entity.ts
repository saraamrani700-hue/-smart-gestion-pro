import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

@Entity('ia_documents_analyses')
export class IaDocumentAnalyse extends BaseTenantEntity {
  @Column({ name: 'type_document', nullable: true })
  typeDocument: string;

  @Column({ name: 'texte_extrait', type: 'text', nullable: true })
  texteExtrait: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  confiance: number; // score de confiance OCR (0-100)

  @Column({ default: 'traite' })
  statut: string;

  // Champs candidats detectes automatiquement dans le texte OCR (montant
  // TTC/HT/TVA, date, numero de facture...) via des motifs de reconnaissance
  // de texte. Extraction "au mieux" : fiable sur des documents imprimes
  // nets, moins fiable sur des photos floues ou des mises en page inhabituelles.
  @Column({ name: 'donnees_extraites', type: 'jsonb', nullable: true })
  donneesExtraites: Record<string, unknown> | null;
}
