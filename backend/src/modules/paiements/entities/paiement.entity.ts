import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum TypeDocumentPaiement {
  VENTE = 'vente',
  ACHAT = 'achat',
}

export enum MoyenPaiement {
  CASH = 'cash',
  TPE = 'tpe', // Terminal de Paiement Electronique (carte bancaire)
  VIREMENT = 'virement',
  CHEQUE = 'cheque',
  MOBILE_WALLET = 'mobile_wallet',
  QR_CODE = 'qr_code',
}

export enum StatutPaiement {
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  ANNULE = 'annule',
  REMBOURSEMENT = 'remboursement',
}

/**
 * Un paiement peut etre lie a une Vente (encaissement client) ou un Achat
 * (decaissement fournisseur). Cf. discussion Article "Paiements, Caisse &
 * Banques" : mode manuel TPE (saisie ref transaction + 4 derniers chiffres +
 * banque), acompte/reste a payer (plusieurs paiements pour un seul document),
 * remboursement (paiement avec montant negatif ou statut REMBOURSEMENT).
 */
@Entity('paiements')
export class Paiement extends BaseTenantEntity {
  @Column({ name: 'document_type', type: 'enum', enum: TypeDocumentPaiement })
  documentType: TypeDocumentPaiement;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({ name: 'moyen_paiement', type: 'enum', enum: MoyenPaiement })
  moyenPaiement: MoyenPaiement;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  montant: number;

  // Mode manuel TPE : numero de transaction saisi par l'utilisateur.
  // Aussi utilise pour reference de virement ou tout autre identifiant externe.
  @Column({ name: 'reference_transaction', nullable: true })
  referenceTransaction: string;

  // 4 derniers chiffres de la carte (facultatif, jamais le numero complet)
  @Column({ name: 'carte_4_derniers', nullable: true, length: 4 })
  carte4Derniers: string;

  @Column({ nullable: true })
  banque: string;

  @Column({ type: 'enum', enum: StatutPaiement, default: StatutPaiement.ACCEPTE })
  statut: StatutPaiement;

  @Column({ name: 'succursale_id', type: 'uuid', nullable: true })
  succursaleId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;
}
