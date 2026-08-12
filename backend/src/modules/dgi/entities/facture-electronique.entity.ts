import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum StatutDgi {
  EN_ATTENTE = 'en_attente',
  VALIDE = 'valide',
  REJETE = 'rejete',
  REEMIS = 'reemis',
}

/**
 * IMPORTANT : ce module prepare la STRUCTURE locale (UUID, QR code, statut)
 * necessaire a la Facturation Electronique. Il ne soumet PAS reellement les
 * factures a la DGI — cette integration reelle demande les specifications
 * techniques officielles de la DGI (format XML exact, methode de signature,
 * endpoint API, certificats) qui n'ont pas ete fournies. Le champ `xmlSigne`
 * reste donc null jusqu'a ce que la vraie integration soit branchee ici.
 */
@Entity('factures_electroniques')
export class FactureElectronique extends BaseTenantEntity {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string; // reference vers documents_commerciaux (type=facture)

  @Column({ name: 'uuid_dgi', unique: true })
  uuidDgi: string;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode: string; // QR code encode en data URL (base64 PNG)

  @Column({ name: 'xml_signe', type: 'text', nullable: true })
  xmlSigne: string | null;

  @Column({ name: 'statut_dgi', type: 'enum', enum: StatutDgi, default: StatutDgi.EN_ATTENTE })
  statutDgi: StatutDgi;

  @Column({ name: 'date_envoi', type: 'timestamptz', nullable: true })
  dateEnvoi: Date | null;

  @Column({ name: 'date_validation', type: 'timestamptz', nullable: true })
  dateValidation: Date | null;

  @Column({ name: 'message_erreur', type: 'text', nullable: true })
  messageErreur: string | null;
}
